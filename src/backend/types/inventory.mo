import Common "common";

module {
  public type InventoryLocation = {
    productId : Common.ProductId;
    branch : Common.Branch;
    locationLabel : Text;
    quantity : Nat;
    updatedAt : Common.Timestamp;
  };

  public type StockAdjustmentReason = {
    #Purchase;
    #Sale;
    #ServiceUse;
    #Correction;
    #Return;
    #Loss;
  };

  public type StockAdjustment = {
    productId : Common.ProductId;
    branch : Common.Branch;
    quantity : Nat;
    reason : StockAdjustmentReason;
    note : Text;
    adjustedAt : Common.Timestamp;
    adjustedBy : Common.UserId;
  };

  public type LowStockItem = {
    productId : Common.ProductId;
    partNumber : Text;
    name : Text;
    branch : Common.Branch;
    quantity : Nat;
    minStockAlert : Nat;
  };
};
