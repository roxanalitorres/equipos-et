import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProductLib "../lib/products";
import Types "../types/products";
import UserTypes "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, Types.Product>,
  approvedUsers : Map.Map<Principal, UserTypes.ApprovedUser>,
) {
  var nextProductId : Nat = 1;

  func prodRequireApproved(caller : Principal) {
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

  func prodRequireAdmin(caller : Principal) {
    prodRequireApproved(caller);
    switch (approvedUsers.get(caller)) {
      case (?u) {
        switch (u.role) {
          case (#Admin) {};
          case _ { Runtime.trap("acceso_denegado: se requiere rol Administrador") };
        };
      };
      case null { Runtime.trap("acceso_denegado") };
    };
  };

  public shared ({ caller }) func createProduct(input : Types.ProductInput) : async Types.Product {
    prodRequireApproved(caller);
    let product = ProductLib.create(products, nextProductId, input);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(id : Common.ProductId, input : Types.ProductInput) : async ?Types.Product {
    prodRequireApproved(caller);
    ProductLib.update(products, id, input);
  };

  public shared ({ caller }) func deleteProduct(id : Common.ProductId) : async Bool {
    prodRequireAdmin(caller);
    ProductLib.delete(products, id);
  };

  public query ({ caller }) func getProduct(id : Common.ProductId) : async ?Types.Product {
    prodRequireApproved(caller);
    ProductLib.get(products, id);
  };

  public query ({ caller }) func listProducts() : async [Types.Product] {
    prodRequireApproved(caller);
    ProductLib.list(products);
  };

  public query ({ caller }) func searchProducts(term : Text) : async [Types.Product] {
    prodRequireApproved(caller);
    ProductLib.search(products, term);
  };
};
