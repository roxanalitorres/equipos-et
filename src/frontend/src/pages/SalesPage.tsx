import SaleDetailView from "@/components/SaleDetailView";
import { DocTypeBadge, StatusBadge } from "@/components/shared/Badge";
import Modal from "@/components/shared/Modal";
import PageHeader from "@/components/shared/PageHeader";
import Table from "@/components/shared/Table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCancelDocument,
  useConfirmDocument,
  useConvertProformaToInvoice,
  useCreateInvoice,
  useCreateProforma,
  useListCustomers,
  useListDocuments,
  useListProducts,
  useListServices,
  useSearchProducts,
} from "@/hooks/useBackend";
import { DocumentStatus } from "@/types";
import type { SalesDocument } from "@/types";
import { DocumentType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Hash,
  ListFilter,
  Package,
  Plus,
  Printer,
  Receipt,
  Search,
  Tag,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface Customer {
  id: string;
  nombre: string;
  rucCedula: string;
  telefono: string;
  email: string;
  direccion: string;
}

interface SavedSaleDetail {
  id: string;
  documentNumber: string;
  docType: "Proforma" | "Invoice";
  status: DocumentStatus;
  createdAt: string;
  customerName: string;
  customerRuc: string;
  lines: Array<{
    lineId: string;
    codigo: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  ivaPercent: number;
  ivaAmount: number;
  total: number;
}

interface SaleRecord {
  id: string;
  documentNumber: string;
  docType: "Proforma" | "Invoice";
  status: DocumentStatus;
  createdAt: string;
  customerName: string;
  total: number;
}

// Sales data is now loaded from backend via useListDocuments hook

function docToSaleDetailData(doc: SalesDocument): SavedSaleDetail {
  const createdAtStr =
    typeof doc.createdAt === "bigint"
      ? new Date(Number(doc.createdAt) / 1_000_000).toISOString().split("T")[0]
      : String(doc.createdAt ?? "");
  const customerName =
    ((doc as unknown as Record<string, unknown>).customerName as string) ||
    `Cliente ${String(doc.customerId ?? "")}`;
  const customerRuc =
    ((doc as unknown as Record<string, unknown>).customerRuc as string) || "";
  return {
    id: String(doc.id),
    documentNumber: doc.documentNumber,
    docType: doc.docType as "Proforma" | "Invoice",
    status: doc.status,
    createdAt: createdAtStr,
    customerName,
    customerRuc,
    lines: (doc.items ?? []).map((item, idx) => ({
      lineId: String(idx),
      codigo: item.partNumber ?? "",
      nombre: item.name ?? "",
      cantidad:
        typeof item.quantity === "number"
          ? item.quantity
          : Number(item.quantity ?? 1),
      precioUnitario:
        typeof item.unitPrice === "number"
          ? item.unitPrice
          : Number(item.unitPrice ?? 0),
      subtotal:
        typeof item.subtotal === "number"
          ? item.subtotal
          : Number(item.subtotal ?? 0),
    })),
    subtotal: Number(doc.subtotal ?? 0),
    ivaPercent: Number(doc.taxPercent ?? 0),
    ivaAmount: Number(doc.taxAmount ?? 0),
    total: Number(doc.total ?? 0),
  };
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function formatTotal(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Stepper steps config ────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Cliente" },
  { id: 2, label: "Productos" },
  { id: 3, label: "Revisión" },
];

// ─── Order line type helpers ─────────────────────────────────────────────

// ─── Order line type ─────────────────────────────────────────────────────
interface OrderLine {
  lineId: string;
  productId: string;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  tipo?: "producto" | "servicio";
}

export default function SalesPage() {
  const queryClient = useQueryClient();
  const {
    data: backendDocuments = [],
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useListDocuments();
  const salesData = useMemo(
    () =>
      backendDocuments.map((doc) => ({
        id: String(doc.id),
        documentNumber: doc.documentNumber ?? "",
        docType: (doc.docType ?? "Proforma") as "Proforma" | "Invoice",
        status: (doc.status ?? DocumentStatus.Draft) as DocumentStatus,
        createdAt:
          typeof doc.createdAt === "bigint"
            ? new Date(Number(doc.createdAt) / 1_000_000)
                .toISOString()
                .split("T")[0]
            : String(doc.createdAt ?? new Date().toISOString().split("T")[0]),
        customerName:
          doc.customerName ?? `Cliente ${String(doc.customerId ?? "")}`,
        total: Number(doc.total ?? 0),
      })),
    [backendDocuments],
  );

  const createProformaMutation = useCreateProforma();
  const createInvoiceMutation = useCreateInvoice();
  const confirmMutation = useConfirmDocument();
  const cancelMutation = useCancelDocument();
  const convertMutation = useConvertProformaToInvoice();

  // ── Filter state ─────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState<"" | "Proforma" | "Invoice">("");
  const [filterStatus, setFilterStatus] = useState<"" | DocumentStatus>("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterDocNumber, setFilterDocNumber] = useState("");

  // ── Nueva Venta modal state ───────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const {
    data: rawCustomers = [],
    isLoading: customersLoading,
    refetch: refetchCustomers,
  } = useListCustomers();
  const customers = useMemo(
    () =>
      rawCustomers.map((c) => ({
        id: String(c.id),
        nombre: c.name ?? "",
        rucCedula: c.taxId ?? "",
        telefono: c.phone ?? "",
        email: c.email ?? "",
        direccion: "",
      })),
    [rawCustomers],
  );
  const [localNewCustomers, setLocalNewCustomers] = useState<Customer[]>([]);
  const allCustomers = useMemo(
    () => [...customers, ...localNewCustomers],
    [customers, localNewCustomers],
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showNewForm, setShowNewForm] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newRuc, setNewRuc] = useState("");
  const [newTelefono, setNewTelefono] = useState("");

  // ── Step 2 state ─────────────────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("");
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [activeTab, setActiveTab] = useState<"productos" | "servicios">(
    "productos",
  );
  const [serviceSearch, setServiceSearch] = useState("");

  // ── Step 3 state ─────────────────────────────────────────────────────────
  const [ivaPercent, setIvaPercent] = useState<number>(12);
  const [docTypeSel, setDocTypeSel] = useState<"Proforma" | "Invoice">(
    "Proforma",
  );
  const [detailSale, setDetailSale] = useState<SavedSaleDetail | null>(null);
  const [editingSale, setEditingSale] = useState<SavedSaleDetail | null>(null);
  const [detailsMap, setDetailsMap] = useState<Record<string, SavedSaleDetail>>(
    {},
  );

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return allCustomers;
    return allCustomers.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.rucCedula.toLowerCase().includes(q),
    );
  }, [allCustomers, customerSearch]);

  const {
    data: allProducts = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useListProducts();
  const { data: searchedProducts = [] } = useSearchProducts(productSearch);
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (q.length < 2) {
      if (!q) return allProducts;
      return allProducts.filter(
        (p) =>
          (p.partNumber ?? "").toLowerCase().includes(q) ||
          (p.name ?? "").toLowerCase().includes(q),
      );
    }
    return searchedProducts.filter(
      (p) =>
        (p.partNumber ?? "").toLowerCase().includes(q) ||
        (p.name ?? "").toLowerCase().includes(q),
    );
  }, [productSearch, allProducts, searchedProducts]);

  const {
    data: catalogServices = [],
    isLoading: servicesLoading,
    refetch: refetchServices,
  } = useListServices();
  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return catalogServices;
    return catalogServices.filter(
      (s) =>
        s.codigo.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q),
    );
  }, [serviceSearch, catalogServices]);

  const orderTotal = useMemo(
    () => orderLines.reduce((sum, l) => sum + l.cantidad * l.precioUnitario, 0),
    [orderLines],
  );

  const step3Subtotal = orderLines.reduce(
    (sum, l) => sum + l.cantidad * l.precioUnitario,
    0,
  );
  const step3IvaAmount = step3Subtotal * (ivaPercent / 100);
  const step3Total = step3Subtotal + step3IvaAmount;

  async function openModal() {
    // Invalidate cached lists so fresh data is fetched when the stepper opens
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["customers"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["services"] }),
    ]);
    await Promise.all([
      refetchCustomers(),
      refetchProducts(),
      refetchServices(),
    ]);
    setModalOpen(true);
    setCurrentStep(1);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setShowNewForm(false);
    setNewNombre("");
    setNewRuc("");
    setNewTelefono("");
    setProductSearch("");
    setActiveTab("productos");
    setServiceSearch("");
    setOrderLines([]);
    setIvaPercent(12);
    setDocTypeSel("Proforma");
    setDetailSale(null);
    setEditingSale(null);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSale(null);
  }

  function openModalForEdit(sale: SavedSaleDetail) {
    setEditingSale(sale);
    setSelectedCustomer({
      id: `${sale.id}_customer`,
      nombre: sale.customerName,
      rucCedula: sale.customerRuc,
      telefono: "",
      email: "",
      direccion: "",
    });
    setOrderLines(
      sale.lines.map((l) => ({
        lineId: l.lineId,
        productId: `unknown-${l.lineId}`,
        codigo: l.codigo,
        nombre: l.nombre,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        tipo: "producto" as const,
      })),
    );
    setIvaPercent(sale.ivaPercent);
    setDocTypeSel(sale.docType);
    setCurrentStep(1);
    setModalOpen(true);
    setCustomerSearch("");
    setShowNewForm(false);
    setNewNombre("");
    setNewRuc("");
    setNewTelefono("");
    setProductSearch("");
    setActiveTab("productos");
    setServiceSearch("");
    setDetailSale(null);
  }

  function handleSelectCustomer(c: Customer) {
    setSelectedCustomer(c);
    setShowNewForm(false);
  }

  function handleAddNewCustomer() {
    if (!newNombre.trim()) return;
    const fresh: Customer = {
      id: String(Date.now()),
      nombre: newNombre.trim(),
      rucCedula: newRuc.trim(),
      telefono: newTelefono.trim(),
      email: "",
      direccion: "",
    };
    setLocalNewCustomers((prev) => [...prev, fresh]);
    setSelectedCustomer(fresh);
    setShowNewForm(false);
    setNewNombre("");
    setNewRuc("");
    setNewTelefono("");
  }

  function handleAddProductLine(product: {
    id: string | bigint;
    partNumber?: string;
    name?: string;
    costPrice?: number;
    marginPercent?: number;
  }) {
    const pid = String(product.id);
    const costPrice = product.costPrice ?? 0;
    const marginPercent = product.marginPercent ?? 0;
    const sellingPrice = costPrice * (1 + marginPercent / 100);
    setOrderLines((prev) => {
      const exists = prev.find((l) => l.productId === pid);
      if (exists) return prev;
      return [
        ...prev,
        {
          lineId: `${pid}-${Date.now()}`,
          productId: pid,
          codigo: product.partNumber ?? "",
          nombre: product.name ?? "",
          cantidad: 1,
          precioUnitario: sellingPrice,
          tipo: "producto" as const,
        },
      ];
    });
  }

  function handleAddServiceLine(service: {
    codigo: string;
    descripcion: string;
    precio: number;
  }) {
    setOrderLines((prev) => [
      ...prev,
      {
        lineId: `srv-${Date.now()}`,
        productId: service.codigo,
        codigo: service.codigo,
        nombre: service.descripcion,
        cantidad: 1,
        precioUnitario: service.precio,
        tipo: "servicio" as const,
      },
    ]);
  }

  function handleLineChange(
    lineId: string,
    field: "cantidad" | "precioUnitario",
    value: string,
  ) {
    setOrderLines((prev) =>
      prev.map((l) =>
        l.lineId === lineId
          ? {
              ...l,
              [field]: Math.max(
                field === "cantidad" ? 1 : 0,
                Number.parseFloat(value) || 0,
              ),
            }
          : l,
      ),
    );
  }

  function handleDeleteLine(lineId: string) {
    setOrderLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }

  function handleSiguiente() {
    if (currentStep === 1 && selectedCustomer) {
      setCurrentStep(2);
    } else if (currentStep === 2 && orderLines.length > 0) {
      // Save lines to stepper state and advance to Step 3
      setCurrentStep(3);
    }
  }

  async function handleGuardar() {
    if (!selectedCustomer) return;

    const customerId = BigInt(
      selectedCustomer.id.replace(/[^0-9]/g, "") || "0",
    );
    const docType =
      docTypeSel === "Proforma" ? DocumentType.Proforma : DocumentType.Invoice;
    const items = orderLines.map((l) => ({
      partNumber: l.codigo,
      name: l.nombre,
      productId: BigInt(l.productId.replace(/[^0-9]/g, "") || "0"),
      quantity: BigInt(Math.max(1, Math.round(l.cantidad))),
      unitPrice: l.precioUnitario,
    }));
    const input = { taxPercent: ivaPercent, customerId, items, docType };

    try {
      let savedDoc: SalesDocument | null = null;
      if (docTypeSel === "Invoice") {
        savedDoc = await createInvoiceMutation.mutateAsync(input);
      } else {
        savedDoc = await createProformaMutation.mutateAsync(input);
      }
      await refetchSales();
      if (savedDoc) {
        const detail = docToSaleDetailData({
          ...savedDoc,
          customerName: selectedCustomer.nombre,
          customerRuc: selectedCustomer.rucCedula,
        } as SalesDocument & { customerName: string; customerRuc: string });
        setDetailSale(detail);
      }
      setModalOpen(false);
      setEditingSale(null);
    } catch (e) {
      console.error("Error saving document:", e);
    }
  }

  function handleRowClick(sale: SaleRecord) {
    const cached = detailsMap[sale.id];
    if (cached) {
      setDetailSale(cached);
      return;
    }
    // Build a minimal detail from the list record; items will be empty until loaded
    const detail: SavedSaleDetail = {
      id: sale.id,
      documentNumber: sale.documentNumber,
      docType: sale.docType,
      status: sale.status,
      createdAt: sale.createdAt,
      customerName: sale.customerName,
      customerRuc: "",
      lines: [],
      subtotal: sale.total,
      ivaPercent: 0,
      ivaAmount: 0,
      total: sale.total,
    };
    // Try to get full document from backend data
    const backendDoc = backendDocuments.find((d) => String(d.id) === sale.id);
    if (backendDoc) {
      setDetailSale(
        docToSaleDetailData(
          backendDoc as SalesDocument & {
            customerName: string;
            customerRuc: string;
          },
        ),
      );
    } else {
      setDetailSale(detail);
    }
  }

  async function handleConvertToInvoice() {
    if (
      !detailSale ||
      detailSale.docType !== "Proforma" ||
      detailSale.status !== DocumentStatus.Confirmed
    )
      return;

    try {
      const newDoc = await convertMutation.mutateAsync(BigInt(detailSale.id));
      await refetchSales();
      if (newDoc && newDoc.id != null) {
        const detail = docToSaleDetailData(
          newDoc as SalesDocument & {
            customerName: string;
            customerRuc: string;
          },
        );
        setDetailsMap((prev) => ({ ...prev, [String(newDoc.id)]: detail }));
        setDetailSale(detail);
      }
    } catch (e) {
      console.error("Error converting to invoice:", e);
    }
  }

  async function handleConfirmSale() {
    if (!detailSale) return;
    try {
      await confirmMutation.mutateAsync(BigInt(detailSale.id));
      await refetchSales();
      const updated = { ...detailSale, status: DocumentStatus.Confirmed };
      setDetailsMap((prev) => ({ ...prev, [detailSale.id]: updated }));
      setDetailSale(updated);
    } catch (e) {
      console.error("Error confirming:", e);
    }
  }

  async function handleCancelSale() {
    if (!detailSale) return;
    try {
      await cancelMutation.mutateAsync(BigInt(detailSale.id));
      await refetchSales();
      const updated = { ...detailSale, status: DocumentStatus.Cancelled };
      setDetailsMap((prev) => ({ ...prev, [detailSale.id]: updated }));
      setDetailSale(updated);
    } catch (e) {
      console.error("Error cancelling:", e);
    }
  }

  const filteredData = useMemo(() => {
    return salesData.filter((sale) => {
      if (filterType !== "" && sale.docType !== filterType) return false;
      if (filterStatus !== "" && sale.status !== filterStatus) return false;
      if (filterFrom !== "" && sale.createdAt < filterFrom) return false;
      if (filterTo !== "" && sale.createdAt > filterTo) return false;
      if (
        filterDocNumber.trim() !== "" &&
        !sale.documentNumber
          .toLowerCase()
          .includes(filterDocNumber.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    salesData,
    filterType,
    filterStatus,
    filterFrom,
    filterTo,
    filterDocNumber,
  ]);

  const hasActiveFilters =
    filterType !== "" ||
    filterStatus !== "" ||
    filterFrom !== "" ||
    filterTo !== "" ||
    filterDocNumber.trim() !== "";

  function clearFilters() {
    setFilterType("");
    setFilterStatus("");
    setFilterFrom("");
    setFilterTo("");
    setFilterDocNumber("");
  }

  return (
    <div
      data-ocid="sales.page"
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <PageHeader
        title="Ventas"
        subtitle="Proformas y facturas"
        actions={
          <Button
            type="button"
            size="sm"
            onClick={openModal}
            data-ocid="sales.new_sale_button"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nueva venta
          </Button>
        }
      />

      {/* ── Nueva Venta Modal ──────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSale ? "Editar Venta" : "Nueva Venta"}
        size="lg"
        ocidPrefix="nueva_venta"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={
                currentStep > 1
                  ? () => setCurrentStep((s) => s - 1)
                  : closeModal
              }
              data-ocid="nueva_venta.cancel_button"
            >
              {currentStep > 1 ? "← Atrás" : "Cancelar"}
            </Button>
            {currentStep < 3 && (
              <Button
                type="button"
                size="sm"
                disabled={
                  currentStep === 1
                    ? !selectedCustomer
                    : orderLines.length === 0
                }
                onClick={handleSiguiente}
                data-ocid="nueva_venta.siguiente_button"
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                type="button"
                size="sm"
                onClick={handleGuardar}
                data-ocid="nueva_venta.guardar_button"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                Guardar
              </Button>
            )}
          </>
        }
      >
        {/* Stepper indicator */}
        <div className="flex items-center gap-0 mb-6">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-border mx-2 mb-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1 ───────────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div data-ocid="nueva_venta.step1_panel">
            {/* Selected customer banner */}
            {selectedCustomer && (
              <div
                data-ocid="nueva_venta.selected_customer_banner"
                className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-md bg-primary/10 border border-primary/30 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">
                  Cliente seleccionado:
                </span>
                <span className="text-foreground truncate">
                  {selectedCustomer.nombre}
                </span>
                {selectedCustomer.rucCedula && (
                  <span className="text-muted-foreground ml-auto flex-shrink-0">
                    {selectedCustomer.rucCedula}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="ml-1 text-muted-foreground hover:text-foreground flex-shrink-0"
                  aria-label="Deseleccionar cliente"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Toggle: search list vs new form */}
            {!showNewForm ? (
              <>
                {/* Search input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    data-ocid="nueva_venta.customer_search_input"
                    type="text"
                    placeholder="Buscar cliente por nombre o RUC..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                    autoFocus
                  />
                </div>

                {/* Customer list */}
                <div
                  data-ocid="nueva_venta.customer_list"
                  className="border border-border rounded-md overflow-hidden divide-y divide-border max-h-52 overflow-y-auto"
                >
                  {customersLoading ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Cargando clientes...
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No se encontraron clientes.
                    </div>
                  ) : (
                    filteredCustomers.map((c, i) => (
                      <button
                        key={c.id}
                        type="button"
                        data-ocid={`nueva_venta.customer_item.${i + 1}`}
                        onClick={() => handleSelectCustomer(c)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50 ${
                          selectedCustomer?.id === c.id
                            ? "bg-primary/10 hover:bg-primary/15"
                            : "bg-card"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {c.nombre}
                          </p>
                          {c.rucCedula && (
                            <p className="text-xs text-muted-foreground">
                              RUC/Cédula: {c.rucCedula}
                            </p>
                          )}
                          {c.telefono && (
                            <p className="text-xs text-muted-foreground">
                              Tel: {c.telefono}
                            </p>
                          )}
                        </div>
                        {selectedCustomer?.id === c.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Toggle to create new */}
                <button
                  type="button"
                  data-ocid="nueva_venta.show_new_customer_button"
                  onClick={() => setShowNewForm(true)}
                  className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  ¿No encuentras al cliente? Crear nuevo cliente
                </button>
              </>
            ) : (
              /* Mini-form for new customer */
              <div
                data-ocid="nueva_venta.new_customer_form"
                className="border border-border rounded-md p-4 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">
                    Nuevo cliente
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Volver al listado
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="new-customer-nombre"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Nombre <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="new-customer-nombre"
                      data-ocid="nueva_venta.new_customer_nombre_input"
                      type="text"
                      placeholder="Nombre o razón social"
                      value={newNombre}
                      onChange={(e) => setNewNombre(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="new-customer-ruc"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      RUC / Cédula
                    </label>
                    <Input
                      id="new-customer-ruc"
                      data-ocid="nueva_venta.new_customer_ruc_input"
                      type="text"
                      placeholder="Ej. 1234567890"
                      value={newRuc}
                      onChange={(e) => setNewRuc(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="new-customer-telefono"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Teléfono
                    </label>
                    <Input
                      id="new-customer-telefono"
                      data-ocid="nueva_venta.new_customer_telefono_input"
                      type="text"
                      placeholder="Ej. 0991234567"
                      value={newTelefono}
                      onChange={(e) => setNewTelefono(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!newNombre.trim()}
                    onClick={handleAddNewCustomer}
                    data-ocid="nueva_venta.add_new_customer_button"
                    className="self-end"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    Agregar cliente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2 ───────────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div data-ocid="nueva_venta.step2_panel">
            {/* Tabs */}
            <div className="flex gap-0 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("productos")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                  activeTab === "productos"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-green-600 border-green-600 hover:bg-green-50"
                }`}
              >
                Productos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("servicios")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b transition-colors ${
                  activeTab === "servicios"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-green-600 border-green-600 hover:bg-green-50"
                }`}
              >
                Servicios
              </button>
            </div>

            {/* Product search */}
            {activeTab === "productos" && (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    data-ocid="nueva_venta.product_search_input"
                    type="text"
                    placeholder="Buscar producto por código o nombre..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                    autoFocus
                  />
                </div>

                {/* Catalog list */}
                <div
                  data-ocid="nueva_venta.product_catalog_list"
                  className="border border-border rounded-md overflow-hidden divide-y divide-border max-h-44 overflow-y-auto mb-4"
                >
                  {productsLoading ? (
                    <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                      Cargando productos...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                      No se encontraron productos.
                    </div>
                  ) : (
                    filteredProducts.map((p, i) => {
                      const alreadyAdded = orderLines.some(
                        (l) => l.productId === String(p.id),
                      );
                      return (
                        <button
                          key={String(p.id)}
                          type="button"
                          data-ocid={`nueva_venta.product_item.${i + 1}`}
                          onClick={() => handleAddProductLine(p)}
                          disabled={alreadyAdded}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                            alreadyAdded
                              ? "bg-muted/60 opacity-60 cursor-not-allowed"
                              : "hover:bg-accent/50 bg-card"
                          }`}
                        >
                          <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-xs text-muted-foreground w-36 flex-shrink-0">
                            {p.partNumber}
                          </span>
                          <span className="flex-1 min-w-0 font-medium text-foreground truncate">
                            {p.name}
                          </span>
                          <span className="text-sm font-semibold text-foreground flex-shrink-0">
                            $
                            {(
                              p.costPrice *
                              (1 + p.marginPercent / 100)
                            ).toFixed(2)}
                          </span>
                          {alreadyAdded && (
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* Service search */}
            {activeTab === "servicios" && (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    data-ocid="nueva_venta.service_search_input"
                    type="text"
                    placeholder="Buscar servicio por código o descripción..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                    autoFocus
                  />
                </div>

                {/* Service catalog list */}
                <div
                  data-ocid="nueva_venta.service_catalog_list"
                  className="border border-border rounded-md overflow-hidden divide-y divide-border max-h-44 overflow-y-auto mb-4"
                >
                  {servicesLoading ? (
                    <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                      Cargando servicios...
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                      No se encontraron servicios.
                    </div>
                  ) : (
                    filteredServices.map((s, i) => (
                      <button
                        key={s.codigo}
                        type="button"
                        data-ocid={`nueva_venta.service_item.${i + 1}`}
                        onClick={() => handleAddServiceLine(s)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 bg-card"
                      >
                        <span className="font-mono text-xs text-muted-foreground w-24 flex-shrink-0">
                          {s.codigo}
                        </span>
                        <span className="flex-1 min-w-0 font-medium text-foreground truncate">
                          {s.descripcion}
                        </span>
                        <span className="text-sm font-semibold text-foreground flex-shrink-0">
                          ${s.precio.toFixed(2)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Order lines table */}
            {orderLines.length > 0 ? (
              <div data-ocid="nueva_venta.order_lines_panel">
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Líneas de venta
                </p>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          Tipo
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          Producto
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground w-20">
                          Cantidad
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground w-28">
                          Precio unit.
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground w-24">
                          Subtotal
                        </th>
                        <th className="px-3 py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orderLines.map((line, idx) => (
                        <tr
                          key={line.lineId}
                          className="bg-card hover:bg-accent/20 transition-colors"
                          data-ocid={`nueva_venta.order_line.${idx + 1}`}
                        >
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                (line.tipo || "producto") === "producto"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {(line.tipo || "producto") === "producto"
                                ? "Producto"
                                : "Servicio"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-foreground truncate max-w-[180px]">
                              {line.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {line.codigo}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              data-ocid={`nueva_venta.order_line_qty.${idx + 1}`}
                              type="number"
                              min="1"
                              value={line.cantidad}
                              onChange={(e) =>
                                handleLineChange(
                                  line.lineId,
                                  "cantidad",
                                  e.target.value,
                                )
                              }
                              className="h-7 text-sm text-center w-16 mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              data-ocid={`nueva_venta.order_line_price.${idx + 1}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.precioUnitario}
                              onChange={(e) =>
                                handleLineChange(
                                  line.lineId,
                                  "precioUnitario",
                                  e.target.value,
                                )
                              }
                              className="h-7 text-sm text-right w-24 ml-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground tabular-nums">
                            ${(line.cantidad * line.precioUnitario).toFixed(2)}
                          </td>
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              data-ocid={`nueva_venta.delete_line_button.${idx + 1}`}
                              onClick={() => handleDeleteLine(line.lineId)}
                              aria-label="Eliminar línea"
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Running total */}
                <div
                  data-ocid="nueva_venta.order_total_summary"
                  className="flex justify-end mt-2 px-2"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {orderLines.length} línea
                      {orderLines.length !== 1 ? "s" : ""} —
                    </span>
                    <span className="font-semibold text-foreground">
                      Total: ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                data-ocid="nueva_venta.order_lines_empty"
                className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-md text-center"
              >
                <Package className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Haz clic en un producto o servicio para agregarlo
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Revisión ─────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div data-ocid="nueva_venta.step3_panel" className="space-y-6">
            {/* Customer summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-700 mb-2">
                Cliente Seleccionado
              </h3>
              <p className="text-sm font-medium text-gray-800">
                {selectedCustomer?.nombre}
              </p>
              <p className="text-xs text-gray-500">
                RUC/Cédula: {selectedCustomer?.rucCedula}
              </p>
            </div>

            {/* Products table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Productos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Producto
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Código
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                        Cant.
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                        P. Unit.
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderLines.map((line) => (
                      <tr key={line.lineId}>
                        <td className="px-3 py-2 text-gray-800">
                          {line.nombre}
                        </td>
                        <td className="px-3 py-2 text-gray-500">
                          {line.codigo}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-800">
                          {line.cantidad}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-800">
                          ${line.precioUnitario.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-800">
                          ${(line.cantidad * line.precioUnitario).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selectors row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="step3-doc-type"
                >
                  Tipo de Documento
                </label>
                <select
                  value={docTypeSel}
                  onChange={(e) =>
                    setDocTypeSel(e.target.value as "Proforma" | "Invoice")
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-ocid="nueva_venta.doc_type_select"
                  id="step3-doc-type"
                >
                  <option value="Proforma">Proforma</option>
                  <option value="Invoice">Factura</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="step3-iva"
                >
                  IVA
                </label>
                <select
                  value={ivaPercent}
                  onChange={(e) => setIvaPercent(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-ocid="nueva_venta.iva_select"
                  id="step3-iva"
                >
                  <option value={0}>0%</option>
                  <option value={12}>12%</option>
                  <option value={15}>15%</option>
                </select>
              </div>
            </div>

            {/* Totals */}
            <div
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2"
              data-ocid="nueva_venta.step3_totals"
            >
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">${step3Subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA ({ivaPercent}%):</span>
                <span className="font-medium">
                  ${step3IvaAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span>${step3Total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex-1 p-6 bg-background">
        {/* ── Sale Detail View ────────────────────────────────────────────── */}
        {detailSale && (
          <SaleDetailView
            sale={detailSale}
            onClose={() => setDetailSale(null)}
            onConvertToInvoice={handleConvertToInvoice}
            onEdit={openModalForEdit}
            onConfirm={handleConfirmSale}
            onCancel={handleCancelSale}
          />
        )}

        {/* Filters bar */}
        <div
          data-ocid="sales.filters_panel"
          className="mb-4 bg-card border border-border rounded-lg p-4"
        >
          <div className="flex flex-wrap gap-3 items-end">
            {/* Tipo */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label
                htmlFor="filter-type"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
              >
                <Tag className="w-3 h-3" />
                Tipo
              </label>
              <select
                id="filter-type"
                data-ocid="sales.filter_type_select"
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "" | "Proforma" | "Invoice")
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="">Todos</option>
                <option value="Proforma">Proforma</option>
                <option value="Invoice">Factura</option>
              </select>
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1 min-w-[175px]">
              <label
                htmlFor="filter-status"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
              >
                <ListFilter className="w-3 h-3" />
                Estado
              </label>
              <select
                id="filter-status"
                data-ocid="sales.filter_status_select"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as "" | DocumentStatus)
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="">Todos</option>
                <option value={DocumentStatus.Draft}>Borrador</option>
                <option value={DocumentStatus.Confirmed}>Confirmado</option>
                <option value={DocumentStatus.Converted}>Convertido</option>
                <option value={DocumentStatus.Cancelled}>Cancelado</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div className="flex flex-col gap-1 min-w-[145px]">
              <label
                htmlFor="filter-date-from"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
              >
                <CalendarDays className="w-3 h-3" />
                Desde
              </label>
              <Input
                id="filter-date-from"
                data-ocid="sales.filter_date_from_input"
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="flex flex-col gap-1 min-w-[145px]">
              <label
                htmlFor="filter-date-to"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
              >
                <CalendarDays className="w-3 h-3" />
                Hasta
              </label>
              <Input
                id="filter-date-to"
                data-ocid="sales.filter_date_to_input"
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Número de documento */}
            <div className="flex flex-col gap-1 min-w-[160px] flex-1">
              <label
                htmlFor="filter-docnumber"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
              >
                <Hash className="w-3 h-3" />
                Número de documento
              </label>
              <Input
                id="filter-docnumber"
                data-ocid="sales.filter_docnumber_input"
                type="text"
                placeholder="Ej. PRO-001"
                value={filterDocNumber}
                onChange={(e) => setFilterDocNumber(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <div className="flex flex-col justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-ocid="sales.clear_filters_button"
                  className="h-9 text-muted-foreground hover:text-foreground"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <p className="mt-2 text-xs text-muted-foreground">
              Mostrando {filteredData.length} de {salesData.length} documentos
            </p>
          )}
          {salesLoading && (
            <p className="mt-2 text-xs text-muted-foreground">
              Cargando documentos...
            </p>
          )}
        </div>
        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table<SaleRecord>
            columns={[
              {
                key: "documentNumber",
                header: "Número",
                render: (row) => (
                  <span className="font-mono font-medium text-foreground">
                    {row.documentNumber}
                  </span>
                ),
              },
              {
                key: "docType",
                header: "Tipo",
                render: (row) => <DocTypeBadge docType={row.docType} />,
              },
              {
                key: "status",
                header: "Estado",
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: "createdAt",
                header: "Fecha",
                render: (row) => (
                  <span className="text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </span>
                ),
              },
              {
                key: "customerName",
                header: "Cliente",
                render: (row) => (
                  <span className="truncate max-w-[220px] block">
                    {row.customerName}
                  </span>
                ),
              },
              {
                key: "total",
                header: "Total",
                headerClassName: "text-right",
                className: "text-right tabular-nums font-medium",
                render: (row) => formatTotal(row.total),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (row) => (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRowClick(row)}
                    data-ocid={`sales.view_detail_button.${row.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            data={filteredData}
            rowKey={(row) => row.id}
            ocidPrefix="sales"
            emptyMessage="No hay documentos que coincidan con los filtros."
          />
        </div>
      </div>
    </div>
  );
}
