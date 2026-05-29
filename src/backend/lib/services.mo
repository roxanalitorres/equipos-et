import Map "mo:core/Map";
import Types "../types/products";
import Common "../types/common";

module {
  func padNumber(n : Nat) : Text {
    let s = n.toText();
    let len = s.size();
    if (len >= 3) s
    else {
      var result = s;
      var i = len;
      while (i < 3) {
        result := "0" # result;
        i += 1;
      };
      result;
    };
  };

  public func create(
    services : Map.Map<Common.ServiceId, Types.Service>,
    nextId : Nat,
    input : Types.ServiceInput,
  ) : Types.Service {
    let code = "SRV-" # padNumber(nextId);
    let service : Types.Service = {
      id = nextId;
      code;
      description = input.description;
      price = input.price;
    };
    services.add(nextId, service);
    service;
  };

  public func list(
    services : Map.Map<Common.ServiceId, Types.Service>,
  ) : [Types.Service] {
    services.values().toArray();
  };

  public func get(
    services : Map.Map<Common.ServiceId, Types.Service>,
    id : Common.ServiceId,
  ) : ?Types.Service {
    services.get(id);
  };

  public func search(
    services : Map.Map<Common.ServiceId, Types.Service>,
    term : Text,
  ) : [Types.Service] {
    let lower = term.toLower();
    services.values().filter(func(s : Types.Service) : Bool {
      s.code.toLower().contains(#text lower) or
      s.description.toLower().contains(#text lower)
    }).toArray();
  };
};
