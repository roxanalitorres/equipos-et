import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Types "../types/sales";
import Common "../types/common";

module {
  func padNumber(n : Nat) : Text {
    let s = n.toText();
    let len = s.size();
    if (len >= 4) s
    else {
      var result = s;
      var i = len;
      while (i < 4) {
        result := "0" # result;
        i += 1;
      };
      result;
    };
  };

  func docPrefix(docType : Types.DocumentType) : Text {
    switch docType {
      case (#Proforma) "PRO-";
      case (#Invoice) "FAC-";
    };
  };

  public func createCustomer(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    nextId : Nat,
    input : Types.CustomerInput,
  ) : Types.Customer {
    let customer : Types.Customer = {
      id = nextId;
      name = input.name;
      email = input.email;
      phone = input.phone;
      taxId = input.taxId;
    };
    customers.add(nextId, customer);
    customer;
  };

  public func updateCustomer(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    id : Common.CustomerId,
    input : Types.CustomerInput,
  ) : ?Types.Customer {
    switch (customers.get(id)) {
      case null null;
      case (?existing) {
        let updated : Types.Customer = {
          existing with
          name = input.name;
          email = input.email;
          phone = input.phone;
          taxId = input.taxId;
        };
        customers.add(id, updated);
        ?updated;
      };
    };
  };

  public func getCustomer(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    id : Common.CustomerId,
  ) : ?Types.Customer {
    customers.get(id);
  };

  public func listCustomers(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    nameFilter : ?Text,
  ) : [Types.Customer] {
    switch nameFilter {
      case null { customers.values().toArray() };
      case (?nameQuery) {
        let q = nameQuery.toLower();
        customers.values().filter(func(c : Types.Customer) : Bool {
          c.name.toLower().contains(#text q)
        }).toArray();
      };
    };
  };

  public func computeTotals(items : [Types.SalesItemInput], taxPercent : Float) : (Float, Float, Float) {
    let subtotal = items.foldLeft(0.0, func(acc : Float, item : Types.SalesItemInput) : Float {
      acc + item.unitPrice * item.quantity.toFloat()
    });
    let taxAmount = subtotal * taxPercent / 100.0;
    let total = subtotal + taxAmount;
    (subtotal, taxAmount, total);
  };

  public func createDocument(
    documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
    nextId : Nat,
    nextDocNumber : Nat,
    input : Types.SalesDocumentInput,
    caller : Common.UserId,
  ) : Types.SalesDocument {
    let (subtotal, taxAmount, total) = computeTotals(input.items, input.taxPercent);
    let docItems : [Types.SalesItem] = input.items.map<Types.SalesItemInput, Types.SalesItem>(
      func(i : Types.SalesItemInput) : Types.SalesItem {
        {
          productId = i.productId;
          partNumber = i.partNumber;
          name = i.name;
          quantity = i.quantity;
          unitPrice = i.unitPrice;
          subtotal = i.unitPrice * i.quantity.toFloat();
        }
      }
    );
    let doc : Types.SalesDocument = {
      id = nextId;
      docType = input.docType;
      documentNumber = docPrefix(input.docType) # padNumber(nextDocNumber);
      customerId = input.customerId;
      items = docItems;
      subtotal;
      taxPercent = input.taxPercent;
      taxAmount;
      total;
      status = #Draft;
      createdAt = Time.now();
      createdBy = caller;
      convertedToInvoiceId = null;
    };
    documents.add(nextId, doc);
    doc;
  };

  public func getDocument(
    documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
    id : Common.DocumentId,
  ) : ?Types.SalesDocument {
    documents.get(id);
  };

  public func listDocuments(
    documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    filter : Types.DocumentFilter,
  ) : [Types.SalesDocumentView] {
    documents.values().filter(func(doc : Types.SalesDocument) : Bool {
      let matchType = switch (filter.docType) {
        case null true;
        case (?dt) switch (doc.docType, dt) {
          case (#Proforma, #Proforma) true;
          case (#Invoice, #Invoice) true;
          case _ false;
        };
      };
      let matchCustomer = switch (filter.customerId) {
        case null true;
        case (?cid) doc.customerId == cid;
      };
      let matchStatus = switch (filter.status) {
        case null true;
        case (?st) switch (doc.status, st) {
          case (#Draft, #Draft) true;
          case (#Confirmed, #Confirmed) true;
          case (#Converted, #Converted) true;
          case (#Cancelled, #Cancelled) true;
          case _ false;
        };
      };
      let matchFrom = switch (filter.fromDate) {
        case null true;
        case (?from) doc.createdAt >= from;
      };
      let matchTo = switch (filter.toDate) {
        case null true;
        case (?to) doc.createdAt <= to;
      };
      matchType and matchCustomer and matchStatus and matchFrom and matchTo;
    }).map<Types.SalesDocument, Types.SalesDocumentView>(func(doc : Types.SalesDocument) : Types.SalesDocumentView {
      let customerName = switch (customers.get(doc.customerId)) {
        case (?c) c.name;
        case null "";
      };
      { doc with customerName };
    }).toArray();
  };

  public func getDocumentView(
    documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    id : Common.DocumentId,
  ) : ?Types.SalesDocumentView {
    switch (documents.get(id)) {
      case null null;
      case (?doc) {
        let customerName = switch (customers.get(doc.customerId)) {
          case (?c) c.name;
          case null "";
        };
        ?{ doc with customerName };
      };
    };
  };

  public func confirmDocument(
    documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
    id : Common.DocumentId,
  ) : Bool {
    switch (documents.get(id)) {
      case null false;
      case (?doc) {
        switch (doc.status) {
          case (#Draft) {
            documents.add(id, { doc with status = #Confirmed });
            true;
          };
          case _ false;
        };
      };
    };
  };

  public func convertToInvoice(
    documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
    nextId : Nat,
    nextDocNumber : Nat,
    proformaId : Common.DocumentId,
    caller : Common.UserId,
  ) : ?Types.SalesDocument {
    switch (documents.get(proformaId)) {
      case null null;
      case (?proforma) {
        switch (proforma.docType) {
          case (#Invoice) Runtime.trap("Document is already an invoice");
          case (#Proforma) {};
        };
        switch (proforma.status) {
          case (#Cancelled) Runtime.trap("Cannot convert a cancelled proforma");
          case (#Converted) Runtime.trap("Proforma already converted");
          case _ {};
        };
        let invoice : Types.SalesDocument = {
          id = nextId;
          docType = #Invoice;
          documentNumber = "FAC-" # padNumber(nextDocNumber);
          customerId = proforma.customerId;
          items = proforma.items;
          subtotal = proforma.subtotal;
          taxPercent = proforma.taxPercent;
          taxAmount = proforma.taxAmount;
          total = proforma.total;
          status = #Confirmed;
          createdAt = Time.now();
          createdBy = caller;
          convertedToInvoiceId = null;
        };
        documents.add(nextId, invoice);
        let updatedProforma : Types.SalesDocument = {
          proforma with
          status = #Converted;
          convertedToInvoiceId = ?nextId;
        };
        documents.add(proformaId, updatedProforma);
        ?invoice;
      };
    };
  };

  public func cancelDocument(
    documents : Map.Map<Common.DocumentId, Types.SalesDocument>,
    id : Common.DocumentId,
  ) : Bool {
    switch (documents.get(id)) {
      case null false;
      case (?doc) {
        switch (doc.status) {
          case (#Cancelled) false;
          case _ {
            documents.add(id, { doc with status = #Cancelled });
            true;
          };
        };
      };
    };
  };
};
