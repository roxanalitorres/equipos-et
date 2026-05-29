import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ServiceId = bigint;
export interface SalesItemInput {
    partNumber: string;
    name: string;
    productId: ProductId;
    quantity: bigint;
    unitPrice: number;
}
export type Timestamp = bigint;
export interface SalesItem {
    partNumber: string;
    name: string;
    productId: ProductId;
    quantity: bigint;
    unitPrice: number;
    subtotal: number;
}
export interface ProductInput {
    partNumber: string;
    supplierName: string;
    name: string;
    minStockAlert: bigint;
    description: string;
    supplierPartNumber: string;
    marginPercent: number;
    costPrice: number;
}
export interface Product {
    id: ProductId;
    partNumber: string;
    supplierName: string;
    name: string;
    createdAt: Timestamp;
    minStockAlert: bigint;
    description: string;
    updatedAt: Timestamp;
    supplierPartNumber: string;
    marginPercent: number;
    costPrice: number;
}
export interface Service {
    id: ServiceId;
    code: string;
    description: string;
    price: number;
}
export interface SalesDocumentView {
    id: DocumentId;
    customerName: string;
    status: DocumentStatus;
    convertedToInvoiceId?: DocumentId;
    total: number;
    taxPercent: number;
    createdAt: Timestamp;
    createdBy: UserId;
    customerId: CustomerId;
    items: Array<SalesItem>;
    taxAmount: number;
    docType: DocumentType;
    subtotal: number;
    documentNumber: string;
}
export interface DocumentFilter {
    status?: DocumentStatus;
    toDate?: Timestamp;
    fromDate?: Timestamp;
    customerId?: CustomerId;
    docType?: DocumentType;
}
export interface Customer {
    id: CustomerId;
    taxId?: string;
    name: string;
    email?: string;
    phone?: string;
}
export interface CustomerInput {
    taxId?: string;
    name: string;
    email?: string;
    phone?: string;
}
export type UserId = Principal;
export interface ServiceInput {
    description: string;
    price: number;
}
export type CustomerId = bigint;
export interface InventoryLocation {
    branch: Branch;
    productId: ProductId;
    updatedAt: Timestamp;
    quantity: bigint;
    locationLabel: string;
}
export type DocumentId = bigint;
export type ProductId = bigint;
export interface LowStockItem {
    branch: Branch;
    partNumber: string;
    name: string;
    minStockAlert: bigint;
    productId: ProductId;
    quantity: bigint;
}
export interface SalesDocument {
    id: DocumentId;
    status: DocumentStatus;
    convertedToInvoiceId?: DocumentId;
    total: number;
    taxPercent: number;
    createdAt: Timestamp;
    createdBy: UserId;
    customerId: CustomerId;
    items: Array<SalesItem>;
    taxAmount: number;
    docType: DocumentType;
    subtotal: number;
    documentNumber: string;
}
export interface SalesDocumentInput {
    taxPercent: number;
    customerId: CustomerId;
    items: Array<SalesItemInput>;
    docType: DocumentType;
}
export interface UserProfile {
    principal: UserId;
    branch: Branch;
    active: boolean;
    name: string;
    createdAt: Timestamp;
    role: Role;
}
export enum Branch {
    Puyo = "Puyo",
    El_Topo = "El_Topo"
}
export enum DocumentStatus {
    Confirmed = "Confirmed",
    Draft = "Draft",
    Converted = "Converted",
    Cancelled = "Cancelled"
}
export enum DocumentType {
    Invoice = "Invoice",
    Proforma = "Proforma"
}
export enum Role {
    Technician = "Technician",
    Admin = "Admin",
    Vendor = "Vendor"
}
export enum StockAdjustmentReason {
    Loss = "Loss",
    Sale = "Sale",
    Return = "Return",
    ServiceUse = "ServiceUse",
    Correction = "Correction",
    Purchase = "Purchase"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStock(productId: ProductId, branch: Branch, locationLabel: string, quantity: bigint, reason: StockAdjustmentReason, note: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelDocument(id: DocumentId): Promise<boolean>;
    confirmDocument(id: DocumentId): Promise<boolean>;
    convertProformaToInvoice(proformaId: DocumentId): Promise<SalesDocument | null>;
    createCustomer(input: CustomerInput): Promise<Customer>;
    createInvoice(input: SalesDocumentInput): Promise<SalesDocument>;
    createProduct(input: ProductInput): Promise<Product>;
    createProforma(input: SalesDocumentInput): Promise<SalesDocument>;
    createService(input: ServiceInput): Promise<Service>;
    deleteProduct(id: ProductId): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: CustomerId): Promise<Customer | null>;
    getDocument(id: DocumentId): Promise<SalesDocumentView | null>;
    getLowStockItems(): Promise<Array<LowStockItem>>;
    getProduct(id: ProductId): Promise<Product | null>;
    getService(id: ServiceId): Promise<Service | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<UserProfile>>;
    listCustomers(nameFilter: string | null): Promise<Array<Customer>>;
    listDocuments(filter: DocumentFilter): Promise<Array<SalesDocumentView>>;
    listLocationsByBranch(branch: Branch): Promise<Array<InventoryLocation>>;
    listLocationsByProduct(productId: ProductId): Promise<Array<InventoryLocation>>;
    listProducts(): Promise<Array<Product>>;
    listServices(): Promise<Array<Service>>;
    removeStock(productId: ProductId, branch: Branch, quantity: bigint, reason: StockAdjustmentReason, note: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(term: string): Promise<Array<Product>>;
    searchServices(term: string): Promise<Array<Service>>;
    setUserActive(userId: Principal, active: boolean): Promise<void>;
    setUserRole(userId: Principal, role: Role): Promise<void>;
    updateCustomer(id: CustomerId, input: CustomerInput): Promise<Customer | null>;
    updateProduct(id: ProductId, input: ProductInput): Promise<Product | null>;
}
