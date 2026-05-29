import Common "common";

module {
  public type Customer = {
    id : Common.CustomerId;
    name : Text;
    email : ?Text;
    phone : ?Text;
    taxId : ?Text;
  };

  public type CustomerInput = {
    name : Text;
    email : ?Text;
    phone : ?Text;
    taxId : ?Text;
  };

  public type DocumentType = {
    #Proforma;
    #Invoice;
  };

  public type DocumentStatus = {
    #Draft;
    #Confirmed;
    #Converted;
    #Cancelled;
  };

  // Extended document view with resolved customer name (returned by listDocuments/getDocument)
  public type SalesDocumentView = {
    id : Common.DocumentId;
    docType : DocumentType;
    documentNumber : Text;
    customerId : Common.CustomerId;
    customerName : Text;
    items : [SalesItem];
    subtotal : Float;
    taxPercent : Float;
    taxAmount : Float;
    total : Float;
    status : DocumentStatus;
    createdAt : Common.Timestamp;
    createdBy : Common.UserId;
    convertedToInvoiceId : ?Common.DocumentId;
  };

  public type SalesItem = {
    productId : Common.ProductId;
    partNumber : Text;
    name : Text;
    quantity : Nat;
    unitPrice : Float;
    subtotal : Float;
  };

  public type SalesDocument = {
    id : Common.DocumentId;
    docType : DocumentType;
    documentNumber : Text;
    customerId : Common.CustomerId;
    items : [SalesItem];
    subtotal : Float;
    taxPercent : Float;
    taxAmount : Float;
    total : Float;
    status : DocumentStatus;
    createdAt : Common.Timestamp;
    createdBy : Common.UserId;
    convertedToInvoiceId : ?Common.DocumentId;
  };

  public type SalesDocumentInput = {
    docType : DocumentType;
    customerId : Common.CustomerId;
    items : [SalesItemInput];
    taxPercent : Float;
  };

  public type SalesItemInput = {
    productId : Common.ProductId;
    partNumber : Text;
    name : Text;
    quantity : Nat;
    unitPrice : Float;
  };

  public type DocumentFilter = {
    docType : ?DocumentType;
    customerId : ?Common.CustomerId;
    status : ?DocumentStatus;
    fromDate : ?Common.Timestamp;
    toDate : ?Common.Timestamp;
  };
};
