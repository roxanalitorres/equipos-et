import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserLib "../lib/users";
import Types "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  userProfiles : Map.Map<Principal, Types.UserProfile>,
) {
  public query ({ caller }) func getCallerUserProfile() : async ?Types.UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    UserLib.getProfile(userProfiles, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Types.UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    // Ensure caller can only save their own profile
    let profileToSave : Types.UserProfile = {
      profile with
      principal = caller;
      createdAt = switch (UserLib.getProfile(userProfiles, caller)) {
        case (?existing) existing.createdAt;
        case null Time.now();
      };
    };
    UserLib.saveProfile(userProfiles, profileToSave);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Types.UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("No autorizado: solo puede ver su propio perfil");
    };
    UserLib.getProfile(userProfiles, user);
  };

  public query ({ caller }) func listAllUsers() : async [Types.UserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("No autorizado: solo administradores");
    };
    UserLib.listUsers(userProfiles);
  };

  public shared ({ caller }) func setUserActive(userId : Principal, active : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("No autorizado: solo administradores");
    };
    UserLib.setActive(userProfiles, userId, active);
  };

  public shared ({ caller }) func setUserRole(userId : Principal, role : Common.Role) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("No autorizado: solo administradores");
    };
    UserLib.setRole(userProfiles, userId, role);
  };
};
