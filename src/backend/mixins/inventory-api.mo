import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import InventoryLib "../lib/inventory";
import ProductTypes "../types/products";
import InvTypes "../types/inventory";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  locations : Map.Map<InventoryLib.LocationKey, InvTypes.InventoryLocation>,
  adjustments : List.List<InvTypes.StockAdjustment>,
  products : Map.Map<Common.ProductId, ProductTypes.Product>,
) {
  public shared ({ caller }) func addStock(
    productId : Common.ProductId,
    branch : Common.Branch,
    locationLabel : Text,
    quantity : Nat,
    reason : InvTypes.StockAdjustmentReason,
    note : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    InventoryLib.addStock(locations, adjustments, productId, branch, locationLabel, quantity, reason, note, caller);
  };

  public shared ({ caller }) func removeStock(
    productId : Common.ProductId,
    branch : Common.Branch,
    quantity : Nat,
    reason : InvTypes.StockAdjustmentReason,
    note : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    InventoryLib.removeStock(locations, adjustments, productId, branch, quantity, reason, note, caller);
  };

  public query ({ caller }) func listLocationsByProduct(productId : Common.ProductId) : async [InvTypes.InventoryLocation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    InventoryLib.listByProduct(locations, productId);
  };

  public query ({ caller }) func listLocationsByBranch(branch : Common.Branch) : async [InvTypes.InventoryLocation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    InventoryLib.listByBranch(locations, branch);
  };

  public query ({ caller }) func getLowStockItems() : async [InvTypes.LowStockItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    InventoryLib.lowStockItems(locations, products);
  };
};
