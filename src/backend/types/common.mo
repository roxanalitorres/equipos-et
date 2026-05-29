module {
  public type UserId = Principal;
  public type ProductId = Nat;
  public type ServiceId = Nat;
  public type CustomerId = Nat;
  public type DocumentId = Nat;
  public type Timestamp = Int;

  public type Branch = {
    #Puyo;
    #El_Topo;
  };

  public type Role = {
    #Admin;
    #Vendor;
    #Technician;
  };
};
