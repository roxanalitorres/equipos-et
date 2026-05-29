import Common "common";

module {
  public type UserProfile = {
    principal : Common.UserId;
    name : Text;
    role : Common.Role;
    branch : Common.Branch;
    active : Bool;
    createdAt : Common.Timestamp;
  };
};
