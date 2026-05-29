import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ServicesLib "../lib/services";
import Types "../types/products";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  services : Map.Map<Common.ServiceId, Types.Service>,
) {
  var nextServiceId : Nat = 1;

  public shared ({ caller }) func createService(input : Types.ServiceInput) : async Types.Service {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    let service = ServicesLib.create(services, nextServiceId, input);
    nextServiceId += 1;
    service;
  };

  public query ({ caller }) func getService(id : Common.ServiceId) : async ?Types.Service {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    ServicesLib.get(services, id);
  };

  public query ({ caller }) func listServices() : async [Types.Service] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    ServicesLib.list(services);
  };

  public query ({ caller }) func searchServices(term : Text) : async [Types.Service] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    ServicesLib.search(services, term);
  };
};
