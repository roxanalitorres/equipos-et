import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Types "../types/users";
import Common "../types/common";

module {
  public func getProfile(
    profiles : Map.Map<Principal, Types.UserProfile>,
    userId : Common.UserId,
  ) : ?Types.UserProfile {
    profiles.get(userId);
  };

  public func saveProfile(
    profiles : Map.Map<Principal, Types.UserProfile>,
    profile : Types.UserProfile,
  ) : () {
    profiles.add(profile.principal, profile);
  };

  public func listUsers(
    profiles : Map.Map<Principal, Types.UserProfile>,
  ) : [Types.UserProfile] {
    profiles.values().toArray();
  };

  public func setActive(
    profiles : Map.Map<Principal, Types.UserProfile>,
    userId : Common.UserId,
    active : Bool,
  ) : () {
    switch (profiles.get(userId)) {
      case (?p) { profiles.add(userId, { p with active }) };
      case null {};
    };
  };

  public func setRole(
    profiles : Map.Map<Principal, Types.UserProfile>,
    userId : Common.UserId,
    role : Common.Role,
  ) : () {
    switch (profiles.get(userId)) {
      case (?p) { profiles.add(userId, { p with role }) };
      case null {};
    };
  };
};
