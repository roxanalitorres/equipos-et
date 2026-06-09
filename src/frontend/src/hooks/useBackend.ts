import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ApprovedUser, PendingUser } from "../backend.d";
import type {
  Service as BackendService,
  SalesDocumentView,
} from "../backend.d";
import type {
  Customer,
  CustomerId,
  CustomerInput,
  DocumentFilter,
  DocumentId,
  InventoryLocation,
  LowStockItem,
  Product,
  ProductId,
  ProductInput,
  SalesDocument,
  SalesDocumentInput,
  UserProfile,
} from "../types";
import { type Branch, DocumentStatus, DocumentType } from "../types";
import type { Role, StockAdjustmentReason } from "../types";

// UI-facing service shape (compatible with existing components)
export interface Service {
  codigo: string;
  descripcion: string;
  precio: number;
}

// ─── Candid variant normalizers ──────────────────────────────────────────────
// Motoko variants come over the wire as objects like { Draft: null }.
// The generated backend.d.ts declares them as string enums for convenience,
// but the runtime value is an object. These helpers normalise the raw Candid
// value to the TypeScript enum string so every comparison works correctly.

type CandidVariant = Record<string, null | undefined>;

function normalizeDocumentStatus(raw: unknown): DocumentStatus {
  if (typeof raw === "string") return raw as DocumentStatus;
  if (raw && typeof raw === "object") {
    const key = Object.keys(raw as CandidVariant)[0];
    if (key && key in DocumentStatus) return key as DocumentStatus;
  }
  return DocumentStatus.Draft;
}

function normalizeDocumentType(raw: unknown): DocumentType {
  if (typeof raw === "string") return raw as DocumentType;
  if (raw && typeof raw === "object") {
    const key = Object.keys(raw as CandidVariant)[0];
    if (key && key in DocumentType) return key as DocumentType;
  }
  return DocumentType.Invoice;
}

function normalizeDocument(
  doc: SalesDocument | null | undefined,
): SalesDocument | null {
  if (!doc || typeof doc !== "object") return null;
  return {
    ...doc,
    id: doc.id ?? (0n as DocumentId),
    customerId: doc.customerId ?? (0n as CustomerId),
    createdAt: doc.createdAt ?? 0n,
    createdBy: doc.createdBy ?? "",
    items: Array.isArray(doc.items) ? doc.items.filter(Boolean) : [],
    documentNumber: doc.documentNumber ?? "",
    status: normalizeDocumentStatus(doc.status),
    docType: normalizeDocumentType(doc.docType),
    total: typeof doc.total === "number" ? doc.total : 0,
    subtotal: typeof doc.subtotal === "number" ? doc.subtotal : 0,
    taxAmount: typeof doc.taxAmount === "number" ? doc.taxAmount : 0,
    taxPercent: typeof doc.taxPercent === "number" ? doc.taxPercent : 0,
  };
}

function normalizeDocumentView(
  doc: SalesDocumentView | null | undefined,
): SalesDocumentView | null {
  if (!doc || typeof doc !== "object") return null;
  return {
    ...doc,
    id: doc.id ?? (0n as DocumentId),
    customerId: doc.customerId ?? (0n as CustomerId),
    customerName: doc.customerName ?? "",
    createdAt: doc.createdAt ?? 0n,
    createdBy: doc.createdBy ?? "",
    items: Array.isArray(doc.items) ? doc.items.filter(Boolean) : [],
    documentNumber: doc.documentNumber ?? "",
    status: normalizeDocumentStatus(doc.status),
    docType: normalizeDocumentType(doc.docType),
    total: typeof doc.total === "number" ? doc.total : 0,
    subtotal: typeof doc.subtotal === "number" ? doc.subtotal : 0,
    taxAmount: typeof doc.taxAmount === "number" ? doc.taxAmount : 0,
    taxPercent: typeof doc.taxPercent === "number" ? doc.taxPercent : 0,
  };
}

function backendServiceToUi(s: BackendService): Service {
  return {
    codigo: s.code,
    descripcion: s.description,
    precio: typeof s.price === "number" ? s.price : Number(s.price),
  };
}

function useBackendActor() {
  return useActor(createActor);
}

// ─── Profile ────────────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching: actorFetching } = useBackendActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// ─── Access Control ─────────────────────────────────────────────────────────

export function useIsInitialized() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isInitialized"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isInitialized();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestAccess() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.requestAccess();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isInitialized"] });
    },
  });
}

export function useListPendingUsers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<PendingUser[]>({
    queryKey: ["pendingUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPendingUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListApprovedUsers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<ApprovedUser[]>({
    queryKey: ["approvedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovedUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveUser() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      name,
      role,
      branch,
    }: {
      target: Principal;
      name: string;
      role: Role;
      branch: Branch;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveUser(target, name, role, branch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      queryClient.invalidateQueries({ queryKey: ["approvedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useRejectUser() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
    },
  });
}

export function useDeactivateUser() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deactivateUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useActivateUser() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.activateUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllUsers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUserRole() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: Principal; role: Role }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUserRole(userId, role);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}

export function useSetUserActive() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      active,
    }: { userId: Principal; active: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUserActive(userId, active);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export function useListProducts() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(term: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["products", "search", term],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts(term);
    },
    enabled: !!actor && !isFetching && term.length > 1,
  });
}

export function useGetProduct(id: ProductId | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateProduct() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProduct(input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: ProductId; input: ProductInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProduct(id, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProductId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteProduct(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useLocationsByBranch(branch: Branch) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<InventoryLocation[]>({
    queryKey: ["inventory", "branch", branch],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLocationsByBranch(branch);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLocationsByProduct(productId: ProductId | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<InventoryLocation[]>({
    queryKey: ["inventory", "product", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return [];
      return actor.listLocationsByProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useLowStockItems() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<LowStockItem[]>({
    queryKey: ["inventory", "lowstock"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStock() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      branch,
      locationLabel,
      quantity,
      reason,
      note,
    }: {
      productId: ProductId;
      branch: Branch;
      locationLabel: string;
      quantity: bigint;
      reason: StockAdjustmentReason;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addStock(
        productId,
        branch,
        locationLabel,
        quantity,
        reason,
        note,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useRemoveStock() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      branch,
      quantity,
      reason,
      note,
    }: {
      productId: ProductId;
      branch: Branch;
      quantity: bigint;
      reason: StockAdjustmentReason;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeStock(productId, branch, quantity, reason, note);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function useListCustomers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCustomers(null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCustomer(id: CustomerId | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Customer | null>({
    queryKey: ["customer", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCustomer(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateCustomer() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createCustomer(input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}
export function useUpdateCustomer() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: CustomerId; input: CustomerInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCustomer(id, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

// ─── Sales Documents ──────────────────────────────────────────────────────────

export function useListDocuments(filter: DocumentFilter = {}) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<SalesDocumentView[]>({
    queryKey: ["documents", JSON.stringify(filter)],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const docs = await actor.listDocuments(filter);
        if (!Array.isArray(docs)) return [];
        return docs
          .map((doc) => normalizeDocumentView(doc))
          .filter((doc): doc is SalesDocumentView => doc !== null);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDocument(id: DocumentId | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<SalesDocumentView | null>({
    queryKey: ["document", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      try {
        const doc = await actor.getDocument(id);
        return doc ? normalizeDocumentView(doc) : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateInvoice() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SalesDocumentInput) => {
      if (!actor) throw new Error("Actor not available");
      const doc = await actor.createInvoice(input);
      const normalized = normalizeDocument(doc);
      if (!normalized) throw new Error("Invalid document returned");
      return normalized;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useCreateProforma() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SalesDocumentInput) => {
      if (!actor) throw new Error("Actor not available");
      const doc = await actor.createProforma(input);
      const normalized = normalizeDocument(doc);
      if (!normalized) throw new Error("Invalid document returned");
      return normalized;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useConvertProformaToInvoice() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proformaId: DocumentId) => {
      if (!actor) throw new Error("Actor not available");
      try {
        const doc = await actor.convertProformaToInvoice(proformaId);
        return doc ? normalizeDocument(doc) : null;
      } catch {
        return null;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useCancelDocument() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: DocumentId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelDocument(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}
export function useConfirmDocument() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: DocumentId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.confirmDocument(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

// ─── Services ─────────────────────────────────────────────────────────────────

export function useListServices() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listServices();
      return result.map(backendServiceToUi);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchServices(term: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Service[]>({
    queryKey: ["services", "search", term],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.searchServices(term);
      return result.map(backendServiceToUi);
    },
    enabled: !!actor && !isFetching && term.length > 0,
  });
}

export function useCreateService() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { description: string; price: number }) => {
      if (!actor) throw new Error("Actor not available");
      const created = await actor.createService(input);
      return backendServiceToUi(created);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

// ─── Dashboard aggregates ─────────────────────────────────────────────────────

export function useDashboardStats() {
  const { data: products = [], isLoading: loadingProducts } = useListProducts();
  const { data: lowStock = [], isLoading: loadingLowStock } =
    useLowStockItems();
  const { data: recentDocs = [], isLoading: loadingDocs } = useListDocuments(
    {},
  );

  const confirmedToday = recentDocs.filter((d) => {
    const today = new Date();
    const docDate = new Date(Number(d.createdAt) / 1_000_000);
    return (
      normalizeDocumentStatus(d.status) === DocumentStatus.Confirmed &&
      docDate.toDateString() === today.toDateString()
    );
  });

  const proformas = recentDocs.filter(
    (d) =>
      normalizeDocumentType(d.docType) === DocumentType.Proforma &&
      normalizeDocumentStatus(d.status) !== DocumentStatus.Cancelled,
  );
  const invoices = recentDocs.filter(
    (d) =>
      normalizeDocumentType(d.docType) === DocumentType.Invoice &&
      normalizeDocumentStatus(d.status) === DocumentStatus.Confirmed,
  );

  return {
    totalProducts: products.length,
    lowStockCount: lowStock.length,
    proformaCount: proformas.length,
    invoiceCount: invoices.length,
    todaySalesCount: confirmedToday.length,
    recentDocuments: recentDocs.slice(0, 10),
    isLoading: loadingProducts || loadingLowStock || loadingDocs,
  };
}
