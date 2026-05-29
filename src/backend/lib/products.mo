import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Types "../types/products";
import Common "../types/common";

module {
  public func create(
    products : Map.Map<Common.ProductId, Types.Product>,
    nextId : Nat,
    input : Types.ProductInput,
  ) : Types.Product {
    let now = Time.now();
    let product : Types.Product = {
      id = nextId;
      partNumber = input.partNumber;
      name = input.name;
      description = input.description;
      supplierName = input.supplierName;
      supplierPartNumber = input.supplierPartNumber;
      costPrice = input.costPrice;
      marginPercent = input.marginPercent;
      minStockAlert = input.minStockAlert;
      createdAt = now;
      updatedAt = now;
    };
    products.add(nextId, product);
    product;
  };

  public func update(
    products : Map.Map<Common.ProductId, Types.Product>,
    id : Common.ProductId,
    input : Types.ProductInput,
  ) : ?Types.Product {
    switch (products.get(id)) {
      case null null;
      case (?existing) {
        let updated : Types.Product = {
          existing with
          partNumber = input.partNumber;
          name = input.name;
          description = input.description;
          supplierName = input.supplierName;
          supplierPartNumber = input.supplierPartNumber;
          costPrice = input.costPrice;
          marginPercent = input.marginPercent;
          minStockAlert = input.minStockAlert;
          updatedAt = Time.now();
        };
        products.add(id, updated);
        ?updated;
      };
    };
  };

  public func delete(
    products : Map.Map<Common.ProductId, Types.Product>,
    id : Common.ProductId,
  ) : Bool {
    switch (products.get(id)) {
      case null false;
      case (?_) {
        products.remove(id);
        true;
      };
    };
  };

  public func get(
    products : Map.Map<Common.ProductId, Types.Product>,
    id : Common.ProductId,
  ) : ?Types.Product {
    products.get(id);
  };

  public func list(
    products : Map.Map<Common.ProductId, Types.Product>,
  ) : [Types.Product] {
    products.values().toArray();
  };

  public func search(
    products : Map.Map<Common.ProductId, Types.Product>,
    term : Text,
  ) : [Types.Product] {
    let lower = term.toLower();
    products.values().filter(func(p : Types.Product) : Bool {
      p.partNumber.toLower().contains(#text lower) or
      p.name.toLower().contains(#text lower) or
      p.description.toLower().contains(#text lower) or
      p.supplierPartNumber.toLower().contains(#text lower)
    }).toArray();
  };

  public func sellingPrice(costPrice : Float, marginPercent : Float) : Float {
    costPrice * (1.0 + marginPercent / 100.0);
  };
};
