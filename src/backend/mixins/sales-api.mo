import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import SalesLib "../lib/sales";
import Types "../types/sales";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Common.CustomerId, Types.Customer>,
  documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
) {
  var nextCustomerId : Nat = 1;
  var nextDocumentId : Nat = 1;
  var nextProformaNumber : Nat = 1;
  var nextInvoiceNumber : Nat = 1;

  public shared ({ caller }) func createCustomer(input : Types.CustomerInput) : async Types.Customer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    let customer = SalesLib.createCustomer(customers, nextCustomerId, input);
    nextCustomerId += 1;
    customer;
  };

  public shared ({ caller }) func updateCustomer(id : Common.CustomerId, input : Types.CustomerInput) : async ?Types.Customer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    SalesLib.updateCustomer(customers, id, input);
  };

  public query ({ caller }) func getCustomer(id : Common.CustomerId) : async ?Types.Customer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    SalesLib.getCustomer(customers, id);
  };

  public query ({ caller }) func listCustomers(nameFilter : ?Text) : async [Types.Customer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    SalesLib.listCustomers(customers, nameFilter);
  };

  public shared ({ caller }) func createProforma(input : Types.SalesDocumentInput) : async Types.SalesDocument {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    let proformaInput : Types.SalesDocumentInput = { input with docType = #Proforma };
    let doc = SalesLib.createDocument(documents, nextDocumentId, nextProformaNumber, proformaInput, caller);
    nextDocumentId += 1;
    nextProformaNumber += 1;
    doc;
  };

  public shared ({ caller }) func createInvoice(input : Types.SalesDocumentInput) : async Types.SalesDocument {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    let invoiceInput : Types.SalesDocumentInput = { input with docType = #Invoice };
    let doc = SalesLib.createDocument(documents, nextDocumentId, nextInvoiceNumber, invoiceInput, caller);
    nextDocumentId += 1;
    nextInvoiceNumber += 1;
    doc;
  };

  public shared ({ caller }) func convertProformaToInvoice(proformaId : Common.DocumentId) : async ?Types.SalesDocument {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    let result = SalesLib.convertToInvoice(documents, nextDocumentId, nextInvoiceNumber, proformaId, caller);
    switch result {
      case (?_) {
        nextDocumentId += 1;
        nextInvoiceNumber += 1;
      };
      case null {};
    };
    result;
  };

  public shared ({ caller }) func confirmDocument(id : Common.DocumentId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    SalesLib.confirmDocument(documents, id);
  };

  public shared ({ caller }) func cancelDocument(id : Common.DocumentId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    SalesLib.cancelDocument(documents, id);
  };

  public query ({ caller }) func getDocument(id : Common.DocumentId) : async ?Types.SalesDocumentView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    SalesLib.getDocumentView(documents, customers, id);
  };

  public query ({ caller }) func listDocuments(filter : Types.DocumentFilter) : async [Types.SalesDocumentView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado");
    };
    SalesLib.listDocuments(documents, customers, filter);
  };
};
