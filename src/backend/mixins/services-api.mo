import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import ServicesLib "../lib/services";
import Types "../types/products";
import UserTypes "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  services : Map.Map<Common.ServiceId, Types.Service>,
  approvedUsers : Map.Map<Principal, UserTypes.ApprovedUser>,
) {
  var nextServiceId : Nat = 1;

  func svcRequireApproved(caller : Principal) {
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

  public shared ({ caller }) func createService(input : Types.ServiceInput) : async Types.Service {
    svcRequireApproved(caller);
    let service = ServicesLib.create(services, nextServiceId, input);
    nextServiceId += 1;
    service;
  };

  public query ({ caller }) func getService(id : Common.ServiceId) : async ?Types.Service {
    svcRequireApproved(caller);
    ServicesLib.get(services, id);
  };

  public query ({ caller }) func listServices() : async [Types.Service] {
    svcRequireApproved(caller);
    ServicesLib.list(services);
  };

  public query ({ caller }) func searchServices(term : Text) : async [Types.Service] {
    svcRequireApproved(caller);
    ServicesLib.search(services, term);
  };
};
