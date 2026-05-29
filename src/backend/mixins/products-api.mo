import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProductLib "../lib/products";
import Types "../types/products";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, Types.Product>,
) {
  var nextProductId : Nat = 1;

  public shared ({ caller }) func createProduct(input : Types.ProductInput) : async Types.Product {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    let product = ProductLib.create(products, nextProductId, input);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(id : Common.ProductId, input : Types.ProductInput) : async ?Types.Product {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    ProductLib.update(products, id, input);
  };

  public shared ({ caller }) func deleteProduct(id : Common.ProductId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("No autorizado: solo administradores pueden eliminar productos");
    };
    ProductLib.delete(products, id);
  };

  public query ({ caller }) func getProduct(id : Common.ProductId) : async ?Types.Product {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    ProductLib.get(products, id);
  };

  public query ({ caller }) func listProducts() : async [Types.Product] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    ProductLib.list(products);
  };

  public query ({ caller }) func searchProducts(term : Text) : async [Types.Product] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    ProductLib.search(products, term);
  };
};
