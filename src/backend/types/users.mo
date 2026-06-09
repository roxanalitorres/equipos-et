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

  public type AccessStatus = {
    #Active;
    #Inactive;
  };

  public type ApprovedUser = {
    principal : Common.UserId;
    name : Text;
    role : Common.Role;
    branch : Common.Branch;
    status : AccessStatus;
    approvedAt : Common.Timestamp;
  };

  public type PendingUser = {
    principal : Common.UserId;
    requestedAt : Common.Timestamp;
  };

  public type AccessResult = {
    #Requested;
    #AlreadyApproved;
    #AlreadyPending;
    #NotAuthorized;
    #ok;
    #NotFound;
  };
};
