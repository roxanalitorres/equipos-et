import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  userProfiles : Map.Map<Principal, Types.UserProfile>,
  approvedUsers : Map.Map<Principal, Types.ApprovedUser>,
  pendingUsers : Map.Map<Principal, Types.PendingUser>,
  bootstrapState : { var initialized : Bool },
) {

  // ── internal helper: bootstrap first admin ──────────────────────────
  func maybeBootstrap(caller : Principal) {
    if (not bootstrapState.initialized) {
      let adminUser : Types.ApprovedUser = {
        principal = caller;
        name = "Administrador";
        role = #Admin;
        branch = #Puyo;
        status = #Active;
        approvedAt = Time.now();
      };
      approvedUsers.add(caller, adminUser);
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      AccessControl.assignRole(accessControlState, caller, caller, #user);
      bootstrapState.initialized := true;
    };
  };

  // ── internal helper: access gate ────────────────────────────────────
  func requireApproved(caller : Principal) {
    switch (approvedUsers.get(caller)) {
      case (?u) {
        switch (u.status) {
          case (#Active) {};
          case (#Inactive) { Runtime.trap("acceso_denegado: usuario inactivo") };
        };
      };
      case null { Runtime.trap("acceso_denegado: principal no aprobado") };
    };
  };

  func requireAdmin(caller : Principal) {
    requireApproved(caller);
    switch (approvedUsers.get(caller)) {
      case (?u) {
        switch (u.role) {
          case (#Admin) {};
          case _ { Runtime.trap("acceso_denegado: se requiere rol Administrador") };
        };
      };
      case null { Runtime.trap("acceso_denegado") };
    };
  };

  // ── public: any principal can request access ─────────────────────────
  public shared ({ caller }) func requestAccess() : async Types.AccessResult {
    maybeBootstrap(caller);
    switch (approvedUsers.get(caller)) {
      case (?_) { return #AlreadyApproved };
      case null {};
    };
    switch (pendingUsers.get(caller)) {
      case (?_) { return #AlreadyPending };
      case null {};
    };
    let pending : Types.PendingUser = {
      principal = caller;
      requestedAt = Time.now();
    };
    pendingUsers.add(caller, pending);
    #Requested;
  };

  // ── public: check if at least one admin exists ────────────────────────
  public query func isInitialized() : async Bool {
    bootstrapState.initialized;
  };

  // ── admin: approve a pending user ────────────────────────────────────
  public shared ({ caller }) func approveUser(
    target : Principal,
    name : Text,
    role : Common.Role,
    branch : Common.Branch,
  ) : async Types.AccessResult {
    maybeBootstrap(caller);
    requireAdmin(caller);
    let approved : Types.ApprovedUser = {
      principal = target;
      name;
      role;
      branch;
      status = #Active;
      approvedAt = Time.now();
    };
    approvedUsers.add(target, approved);
    pendingUsers.remove(target);
    AccessControl.assignRole(accessControlState, caller, target, #user);
    switch (role) {
      case (#Admin) { AccessControl.assignRole(accessControlState, caller, target, #admin) };
      case _ {};
    };
    #ok;
  };

  // ── admin: reject a pending user ──────────────────────────────────────
  public shared ({ caller }) func rejectUser(target : Principal) : async Types.AccessResult {
    maybeBootstrap(caller);
    requireAdmin(caller);
    switch (pendingUsers.get(target)) {
      case null { return #NotFound };
      case (?_) {};
    };
    pendingUsers.remove(target);
    #ok;
  };

  // ── admin: deactivate a user ──────────────────────────────────────────
  public shared ({ caller }) func deactivateUser(target : Principal) : async Types.AccessResult {
    maybeBootstrap(caller);
    requireAdmin(caller);
    switch (approvedUsers.get(target)) {
      case null { return #NotFound };
      case (?u) {
        approvedUsers.add(target, { u with status = #Inactive });
        #ok;
      };
    };
  };

  // ── admin: activate a user ────────────────────────────────────────────
  public shared ({ caller }) func activateUser(target : Principal) : async Types.AccessResult {
    maybeBootstrap(caller);
    requireAdmin(caller);
    switch (approvedUsers.get(target)) {
      case null { return #NotFound };
      case (?u) {
        approvedUsers.add(target, { u with status = #Active });
        #ok;
      };
    };
  };

  // ── admin: list pending users ─────────────────────────────────────────
  public query ({ caller }) func listPendingUsers() : async [Types.PendingUser] {
    requireAdmin(caller);
    pendingUsers.values().toArray();
  };

  // ── admin: list approved users ────────────────────────────────────────
  public query ({ caller }) func listApprovedUsers() : async [Types.ApprovedUser] {
    requireAdmin(caller);
    approvedUsers.values().toArray();
  };

  // ── legacy: get caller profile (from approvedUsers) ───────────────────
  public query ({ caller }) func getCallerUserProfile() : async ?Types.UserProfile {
    requireApproved(caller);
    switch (approvedUsers.get(caller)) {
      case (?u) {
        ?{
          principal = u.principal;
          name = u.name;
          role = u.role;
          branch = u.branch;
          active = switch (u.status) { case (#Active) true; case (#Inactive) false };
          createdAt = u.approvedAt;
        };
      };
      case null null;
    };
  };

  // ── legacy: get a specific user's profile ─────────────────────────────
  public query ({ caller }) func getUserProfile(user : Principal) : async ?Types.UserProfile {
    requireApproved(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("acceso_denegado: solo puede ver su propio perfil");
    };
    switch (approvedUsers.get(user)) {
      case (?u) {
        ?{
          principal = u.principal;
          name = u.name;
          role = u.role;
          branch = u.branch;
          active = switch (u.status) { case (#Active) true; case (#Inactive) false };
          createdAt = u.approvedAt;
        };
      };
      case null null;
    };
  };

  // ── admin: list all users as legacy UserProfile ───────────────────────
  public query ({ caller }) func listAllUsers() : async [Types.UserProfile] {
    requireAdmin(caller);
    approvedUsers.values().map<Types.ApprovedUser, Types.UserProfile>(
      func(u) {
        {
          principal = u.principal;
          name = u.name;
          role = u.role;
          branch = u.branch;
          active = switch (u.status) { case (#Active) true; case (#Inactive) false };
          createdAt = u.approvedAt;
        }
      }
    ).toArray();
  };

  // ── admin: set user active/inactive via legacy API ────────────────────
  public shared ({ caller }) func setUserActive(userId : Principal, active : Bool) : async () {
    requireAdmin(caller);
    switch (approvedUsers.get(userId)) {
      case (?u) {
        let newStatus : Types.AccessStatus = if (active) #Active else #Inactive;
        approvedUsers.add(userId, { u with status = newStatus });
      };
      case null {};
    };
  };

  // ── admin: set user role via legacy API ───────────────────────────────
  public shared ({ caller }) func setUserRole(userId : Principal, role : Common.Role) : async () {
    requireAdmin(caller);
    switch (approvedUsers.get(userId)) {
      case (?u) { approvedUsers.add(userId, { u with role }) };
      case null {};
    };
  };
};
