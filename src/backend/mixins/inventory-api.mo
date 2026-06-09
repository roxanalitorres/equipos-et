import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import InventoryLib "../lib/inventory";
import ProductTypes "../types/products";
import InvTypes "../types/inventory";
import UserTypes "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  locations : Map.Map<InventoryLib.LocationKey, InvTypes.InventoryLocation>,
  adjustments : List.List<InvTypes.StockAdjustment>,
  products : Map.Map<Common.ProductId, ProductTypes.Product>,
  approvedUsers : Map.Map<Principal, UserTypes.ApprovedUser>,
) {
  func invRequireApproved(caller : Principal) {
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

  public shared ({ caller }) func addStock(
    productId : Common.ProductId,
    branch : Common.Branch,
    locationLabel : Text,
    quantity : Nat,
    reason : InvTypes.StockAdjustmentReason,
    note : Text,
  ) : async () {
    invRequireApproved(caller);
    InventoryLib.addStock(locations, adjustments, productId, branch, locationLabel, quantity, reason, note, caller);
  };

  public shared ({ caller }) func removeStock(
    productId : Common.ProductId,
    branch : Common.Branch,
    quantity : Nat,
    reason : InvTypes.StockAdjustmentReason,
    note : Text,
  ) : async () {
    invRequireApproved(caller);
    InventoryLib.removeStock(locations, adjustments, productId, branch, quantity, reason, note, caller);
  };

  public query ({ caller }) func listLocationsByProduct(productId : Common.ProductId) : async [InvTypes.InventoryLocation] {
    invRequireApproved(caller);
    InventoryLib.listByProduct(locations, productId);
  };

  public query ({ caller }) func listLocationsByBranch(branch : Common.Branch) : async [InvTypes.InventoryLocation] {
    invRequireApproved(caller);
    InventoryLib.listByBranch(locations, branch);
  };

  public query ({ caller }) func getLowStockItems() : async [InvTypes.LowStockItem] {
    invRequireApproved(caller);
    InventoryLib.lowStockItems(locations, products);
  };
};
