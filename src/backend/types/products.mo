import Common "common";

module {
  public type Product = {
    id : Common.ProductId;
    partNumber : Text;
    name : Text;
    description : Text;
    supplierName : Text;
    supplierPartNumber : Text;
    costPrice : Float;
    marginPercent : Float;
    minStockAlert : Nat;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type ProductInput = {
    partNumber : Text;
    name : Text;
    description : Text;
    supplierName : Text;
    supplierPartNumber : Text;
    costPrice : Float;
    marginPercent : Float;
    minStockAlert : Nat;
  };

  public type Service = {
    id : Common.ServiceId;
    code : Text;
    description : Text;
    price : Float;
  };

  public type ServiceInput = {
    description : Text;
    price : Float;
  };
};
