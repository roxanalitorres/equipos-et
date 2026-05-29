import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/inventory";
import ProductTypes "../types/products";
import Common "../types/common";

module {
  public type LocationKey = (Common.ProductId, Common.Branch);

  func branchEqual(a : Common.Branch, b : Common.Branch) : Bool {
    switch (a, b) {
      case (#Puyo, #Puyo) true;
      case (#El_Topo, #El_Topo) true;
      case _ false;
    };
  };

  func locationKeyCompare(a : LocationKey, b : LocationKey) : { #less; #equal; #greater } {
    let (aId, aBranch) = a;
    let (bId, bBranch) = b;
    if (aId < bId) #less
    else if (aId > bId) #greater
    else {
      let aTag = switch aBranch { case (#Puyo) 0; case (#El_Topo) 1 };
      let bTag = switch bBranch { case (#Puyo) 0; case (#El_Topo) 1 };
      if (aTag < bTag) #less
      else if (aTag > bTag) #greater
      else #equal;
    };
  };

  public func addStock(
    locations : Map.Map<LocationKey, Types.InventoryLocation>,
    adjustments : List.List<Types.StockAdjustment>,
    productId : Common.ProductId,
    branch : Common.Branch,
    locationLabel : Text,
    quantity : Nat,
    reason : Types.StockAdjustmentReason,
    note : Text,
    caller : Common.UserId,
  ) : () {
    let key : LocationKey = (productId, branch);
    let now = Time.now();
    let existing = locations.get(locationKeyCompare, key);
    let newQty = switch existing {
      case null quantity;
      case (?loc) loc.quantity + quantity;
    };
    let newLabel = switch existing {
      case null locationLabel;
      case (?loc) if (locationLabel == "") loc.locationLabel else locationLabel;
    };
    let loc : Types.InventoryLocation = {
      productId;
      branch;
      locationLabel = newLabel;
      quantity = newQty;
      updatedAt = now;
    };
    locations.add(locationKeyCompare, key, loc);
    let adj : Types.StockAdjustment = {
      productId;
      branch;
      quantity;
      reason;
      note;
      adjustedAt = now;
      adjustedBy = caller;
    };
    adjustments.add(adj);
  };

  public func removeStock(
    locations : Map.Map<LocationKey, Types.InventoryLocation>,
    adjustments : List.List<Types.StockAdjustment>,
    productId : Common.ProductId,
    branch : Common.Branch,
    quantity : Nat,
    reason : Types.StockAdjustmentReason,
    note : Text,
    caller : Common.UserId,
  ) : () {
    let key : LocationKey = (productId, branch);
    let now = Time.now();
    switch (locations.get(locationKeyCompare, key)) {
      case null Runtime.trap("No stock found for this product at this branch");
      case (?loc) {
        if (loc.quantity < quantity) Runtime.trap("Insufficient stock");
        let updated : Types.InventoryLocation = {
          loc with
          quantity = loc.quantity - quantity;
          updatedAt = now;
        };
        locations.add(locationKeyCompare, key, updated);
        let adj : Types.StockAdjustment = {
          productId;
          branch;
          quantity;
          reason;
          note;
          adjustedAt = now;
          adjustedBy = caller;
        };
        adjustments.add(adj);
      };
    };
  };

  public func listByProduct(
    locations : Map.Map<LocationKey, Types.InventoryLocation>,
    productId : Common.ProductId,
  ) : [Types.InventoryLocation] {
    locations.values().filter(func(loc : Types.InventoryLocation) : Bool {
      loc.productId == productId
    }).toArray();
  };

  public func listByBranch(
    locations : Map.Map<LocationKey, Types.InventoryLocation>,
    branch : Common.Branch,
  ) : [Types.InventoryLocation] {
    locations.values().filter(func(loc : Types.InventoryLocation) : Bool {
      branchEqual(loc.branch, branch)
    }).toArray();
  };

  public func lowStockItems(
    locations : Map.Map<LocationKey, Types.InventoryLocation>,
    products : Map.Map<Common.ProductId, ProductTypes.Product>,
  ) : [Types.LowStockItem] {
    locations.values().filterMap(func(loc : Types.InventoryLocation) : ?Types.LowStockItem {
      switch (products.get(loc.productId)) {
        case null null;
        case (?prod) {
          if (loc.quantity <= prod.minStockAlert) {
            ?{
              productId = loc.productId;
              partNumber = prod.partNumber;
              name = prod.name;
              branch = loc.branch;
              quantity = loc.quantity;
              minStockAlert = prod.minStockAlert;
            }
          } else null;
        };
      }
    }).toArray();
  };
};
