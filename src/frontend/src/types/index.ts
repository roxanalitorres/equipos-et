// Re-export backend types with enriched front-end aliases
export type {
  Product,
  ProductInput,
  InventoryLocation,
  LowStockItem,
  Customer,
  CustomerInput,
  SalesDocument,
  SalesDocumentInput,
  SalesItem,
  SalesItemInput,
  UserProfile,
  DocumentFilter,
  UserId,
  ProductId,
  CustomerId,
  DocumentId,
  Timestamp,
} from "../backend.d";

export {
  Branch,
  DocumentStatus,
  DocumentType,
  Role,
  StockAdjustmentReason,
  UserRole,
} from "../backend.d";

// UI-only helpers
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: import("../backend.d").Role[];
}

export interface SummaryCard {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}
