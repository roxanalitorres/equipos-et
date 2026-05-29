import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Badge, { StockBadge } from "../components/shared/Badge";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Modal from "../components/shared/Modal";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import {
  useAddStock,
  useIsAdmin,
  useListProducts,
  useLocationsByBranch,
  useLocationsByProduct,
  useLowStockItems,
  useRemoveStock,
  useSearchProducts,
  useUpdateProduct,
} from "../hooks/useBackend";
import { Branch, StockAdjustmentReason } from "../types";
import type {
  InventoryLocation,
  LowStockItem,
  Product,
  ProductId,
  ProductInput,
} from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const BRANCHES = [
  { value: Branch.Puyo, label: "Puyo" },
  { value: Branch.El_Topo, label: "El Topo" },
] as const;

const REASONS: { value: StockAdjustmentReason; label: string }[] = [
  { value: StockAdjustmentReason.Purchase, label: "Compra" },
  { value: StockAdjustmentReason.Sale, label: "Venta" },
  { value: StockAdjustmentReason.ServiceUse, label: "Uso en servicio" },
  { value: StockAdjustmentReason.Return, label: "Devolución" },
  { value: StockAdjustmentReason.Correction, label: "Corrección" },
  { value: StockAdjustmentReason.Loss, label: "Pérdida" },
];

type AdjustMode = "add" | "remove";

interface AdjustForm {
  productId: ProductId | null;
  branch: Branch;
  locationLabel: string;
  quantity: number;
  reason: StockAdjustmentReason;
  note: string;
}

const EMPTY_ADJUST_FORM: AdjustForm = {
  productId: null,
  branch: Branch.Puyo,
  locationLabel: "",
  quantity: 1,
  reason: StockAdjustmentReason.Purchase,
  note: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return value.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function sellingPrice(cost: number, margin: number): number {
  return cost * (1 + margin / 100);
}

// ─── Stock Adjustment Modal ───────────────────────────────────────────────────

interface AdjustModalProps {
  open: boolean;
  mode: AdjustMode;
  onClose: () => void;
}

function AdjustModal({ open, mode, onClose }: AdjustModalProps) {
  const [form, setForm] = useState<AdjustForm>(EMPTY_ADJUST_FORM);
  const { data: products = [] } = useListProducts();
  const addStock = useAddStock();
  const removeStock = useRemoveStock();

  function set<K extends keyof AdjustForm>(key: K, value: AdjustForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    setForm(EMPTY_ADJUST_FORM);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId) return;
    const qty = BigInt(form.quantity);
    try {
      if (mode === "add") {
        await addStock.mutateAsync({
          productId: form.productId,
          branch: form.branch,
          locationLabel: form.locationLabel,
          quantity: qty,
          reason: form.reason,
          note: form.note,
        });
        toast.success("Stock agregado correctamente");
      } else {
        await removeStock.mutateAsync({
          productId: form.productId,
          branch: form.branch,
          quantity: qty,
          reason: form.reason,
          note: form.note,
        });
        toast.success("Stock retirado correctamente");
      }
      handleClose();
    } catch {
      toast.error("Error al ajustar el stock");
    }
  }

  const isPending = addStock.isPending || removeStock.isPending;
  const isAdd = mode === "add";
  const title = isAdd ? "Agregar Stock" : "Retirar Stock";
  const submitLabel = isPending ? "Guardando…" : isAdd ? "Agregar" : "Retirar";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="md"
      ocidPrefix="adjust_stock"
      footer={
        <>
          <button
            type="button"
            data-ocid="adjust_stock.cancel_button"
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="adjust-form"
            data-ocid="adjust_stock.submit_button"
            disabled={isPending || !form.productId}
            className={`px-4 py-2 text-sm rounded font-medium disabled:opacity-60 transition-colors ${
              isAdd
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }`}
          >
            {submitLabel}
          </button>
        </>
      }
    >
      <form id="adjust-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="adj-product"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Producto <span className="text-destructive">*</span>
          </label>
          <select
            id="adj-product"
            data-ocid="adjust_stock.select"
            required
            value={form.productId?.toString() ?? ""}
            onChange={(e) =>
              set("productId", e.target.value ? BigInt(e.target.value) : null)
            }
            className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Seleccionar producto…</option>
            {products.map((p) => (
              <option key={p.id.toString()} value={p.id.toString()}>
                {p.partNumber} — {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="adj-branch"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Sucursal <span className="text-destructive">*</span>
            </label>
            <select
              id="adj-branch"
              value={form.branch}
              onChange={(e) => set("branch", e.target.value as Branch)}
              className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {BRANCHES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          {isAdd && (
            <div>
              <label
                htmlFor="adj-location"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Ubicación
              </label>
              <input
                id="adj-location"
                value={form.locationLabel}
                onChange={(e) => set("locationLabel", e.target.value)}
                placeholder="Ej: Estante A-3"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="adj-qty"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Cantidad <span className="text-destructive">*</span>
            </label>
            <input
              id="adj-qty"
              type="number"
              min="1"
              step="1"
              required
              value={form.quantity}
              onChange={(e) =>
                set(
                  "quantity",
                  Math.max(1, Number.parseInt(e.target.value) || 1),
                )
              }
              className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="adj-reason"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Motivo <span className="text-destructive">*</span>
            </label>
            <select
              id="adj-reason"
              value={form.reason}
              onChange={(e) =>
                set("reason", e.target.value as StockAdjustmentReason)
              }
              className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="adj-note"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Nota
          </label>
          <textarea
            id="adj-note"
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            rows={2}
            placeholder="Observaciones adicionales…"
            className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit Product Modal ───────────────────────────────────────────────────────

const EMPTY_PRODUCT_FORM: ProductInput = {
  partNumber: "",
  name: "",
  description: "",
  supplierName: "",
  supplierPartNumber: "",
  costPrice: 0,
  marginPercent: 0,
  minStockAlert: BigInt(0),
};

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function EditProductModal({ product, onClose }: EditProductModalProps) {
  const open = product !== null;
  const update = useUpdateProduct();

  const initial: ProductInput = product
    ? {
        partNumber: product.partNumber,
        name: product.name,
        description: product.description,
        supplierName: product.supplierName,
        supplierPartNumber: product.supplierPartNumber,
        costPrice: product.costPrice,
        marginPercent: product.marginPercent,
        minStockAlert: product.minStockAlert,
      }
    : EMPTY_PRODUCT_FORM;

  const [form, setForm] = useState<ProductInput>(initial);

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              partNumber: product.partNumber,
              name: product.name,
              description: product.description,
              supplierName: product.supplierName,
              supplierPartNumber: product.supplierPartNumber,
              costPrice: product.costPrice,
              marginPercent: product.marginPercent,
              minStockAlert: product.minStockAlert,
            }
          : EMPTY_PRODUCT_FORM,
      );
    }
  }, [open, product]);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    try {
      await update.mutateAsync({ id: product.id, input: form });
      toast.success("Producto actualizado");
      onClose();
    } catch {
      toast.error("Error al guardar el producto");
    }
  }

  const selling = sellingPrice(form.costPrice, form.marginPercent);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Producto"
      size="lg"
      ocidPrefix="inventory_edit_product"
      footer={
        <>
          <button
            type="button"
            data-ocid="inventory_edit_product.cancel_button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="inv-edit-product-form"
            data-ocid="inventory_edit_product.submit_button"
            disabled={update.isPending}
            className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors font-medium"
          >
            {update.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </>
      }
    >
      <form
        id="inv-edit-product-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Identificación */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Identificación
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="inv-pf-partNumber"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Número de parte <span className="text-destructive">*</span>
              </label>
              <input
                id="inv-pf-partNumber"
                data-ocid="inventory_edit_product.input"
                required
                value={form.partNumber}
                onChange={(e) => set("partNumber", e.target.value)}
                placeholder="Ej: CAT-3456-A"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="inv-pf-name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                id="inv-pf-name"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej: Filtro de aceite"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="inv-pf-description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Descripción
            </label>
            <textarea
              id="inv-pf-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Descripción técnica del repuesto"
              className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </fieldset>

        {/* Proveedor */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Proveedor
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="inv-pf-supplierName"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Nombre del proveedor
              </label>
              <input
                id="inv-pf-supplierName"
                value={form.supplierName}
                onChange={(e) => set("supplierName", e.target.value)}
                placeholder="Ej: Ferreyros S.A."
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="inv-pf-supplierPN"
                className="block text-sm font-medium text-foreground mb-1"
              >
                N° de parte proveedor
              </label>
              <input
                id="inv-pf-supplierPN"
                value={form.supplierPartNumber}
                onChange={(e) => set("supplierPartNumber", e.target.value)}
                placeholder="Ej: 1R-0739"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </fieldset>

        {/* Precios */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Precio y alertas
          </legend>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="inv-pf-costPrice"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Precio de costo ($)
              </label>
              <input
                id="inv-pf-costPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={(e) =>
                  set("costPrice", Number.parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="inv-pf-margin"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Margen de ganancia (%)
              </label>
              <input
                id="inv-pf-margin"
                type="number"
                min="0"
                step="0.1"
                value={form.marginPercent}
                onChange={(e) =>
                  set("marginPercent", Number.parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="inv-pf-selling"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Precio de venta ($)
              </label>
              <div
                id="inv-pf-selling"
                className="px-3 py-2 text-sm border border-border rounded bg-muted/40 text-foreground font-medium"
              >
                ${fmt(selling)}
              </div>
            </div>
          </div>
          <div className="w-1/3">
            <label
              htmlFor="inv-pf-minStock"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Stock mínimo de alerta
            </label>
            <input
              id="inv-pf-minStock"
              type="number"
              min="0"
              step="1"
              value={Number(form.minStockAlert)}
              onChange={(e) =>
                set(
                  "minStockAlert",
                  BigInt(Number.parseInt(e.target.value) || 0),
                )
              }
              className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

// ─── Search Result Card ───────────────────────────────────────────────────────

interface SearchResultCardProps {
  product: Product;
  index: number;
}

function SearchResultCard({ product, index }: SearchResultCardProps) {
  const { data: locations = [], isLoading } = useLocationsByProduct(product.id);

  const byBranch = useMemo(() => {
    const map = new Map<Branch, InventoryLocation[]>();
    for (const loc of locations) {
      const b = loc.branch as Branch;
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(loc);
    }
    return map;
  }, [locations]);

  function totalForBranch(branch: Branch): number {
    return (byBranch.get(branch) ?? []).reduce(
      (sum, l) => sum + Number(l.quantity),
      0,
    );
  }

  const total = totalForBranch(Branch.Puyo) + totalForBranch(Branch.El_Topo);

  return (
    <div
      data-ocid={`inventory.search_result.${index}`}
      className="px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-0"
    >
      {/* Product header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <span className="text-sm font-semibold text-foreground block truncate">
            {product.name}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {product.partNumber}
          </span>
          {product.description && (
            <span className="text-xs text-muted-foreground block truncate max-w-sm">
              {product.description}
            </span>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="text-xs text-muted-foreground">Total</span>
          <p className="text-sm font-bold text-foreground tabular-nums">
            {isLoading ? "…" : total}
          </p>
        </div>
      </div>

      {/* Branch availability */}
      {isLoading ? (
        <div className="flex gap-2">
          {BRANCHES.map((b) => (
            <div
              key={b.value}
              className="h-7 w-28 rounded bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {BRANCHES.map((b) => {
            const branchLocs = byBranch.get(b.value) ?? [];
            const qty = branchLocs.reduce(
              (sum, l) => sum + Number(l.quantity),
              0,
            );
            const hasStock = qty > 0;
            const locationLabels = branchLocs
              .filter((l) => l.locationLabel)
              .map((l) => l.locationLabel)
              .join(", ");

            return (
              <div
                key={b.value}
                data-ocid={`inventory.search_result_branch.${index}.${b.value.toLowerCase()}`}
                className={`inline-flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs ${
                  hasStock
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/10"
                    : "border-border bg-muted/30"
                }`}
              >
                {hasStock ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={`font-medium ${hasStock ? "text-emerald-800 dark:text-emerald-300" : "text-muted-foreground"}`}
                >
                  {b.label}
                </span>
                {hasStock ? (
                  <>
                    <span
                      className={`font-bold tabular-nums ${hasStock ? "text-emerald-800 dark:text-emerald-300" : "text-muted-foreground"}`}
                    >
                      {qty} uds.
                    </span>
                    {locationLabels && (
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <MapPin className="w-2.5 h-2.5" />
                        {locationLabels}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">Sin stock</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Inventory Search Bar ─────────────────────────────────────────────────────

function InventorySearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const term = query.trim();
  const { data: results = [], isLoading } = useSearchProducts(term);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(e.target.value.trim().length >= 2);
  }

  function handleClear() {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  const showPanel = open && term.length >= 2;
  const showEmpty = showPanel && !isLoading && results.length === 0;
  const showResults = showPanel && results.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          data-ocid="inventory.search_input"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (term.length >= 2) setOpen(true);
          }}
          placeholder="Buscar repuesto por nombre, N° de parte o descripción…"
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            data-ocid="inventory.search_clear_button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results panel */}
      {showPanel && (
        <div
          data-ocid="inventory.search_panel"
          className="absolute z-30 top-full mt-1.5 left-0 right-0 rounded-lg border border-border bg-card shadow-elevated overflow-hidden"
        >
          {/* Loading */}
          {isLoading && (
            <div
              data-ocid="inventory.search_loading_state"
              className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground"
            >
              <LoadingSpinner size="sm" />
              Buscando…
            </div>
          )}

          {/* Empty */}
          {showEmpty && (
            <div
              data-ocid="inventory.search_empty_state"
              className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              No se encontraron productos para &ldquo;{term}&rdquo;
            </div>
          )}

          {/* Results */}
          {showResults && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
                {results.length}{" "}
                {results.length === 1 ? "resultado" : "resultados"} —
                disponibilidad por sucursal
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((product, i) => (
                  <SearchResultCard
                    key={product.id.toString()}
                    product={product}
                    index={i + 1}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Low Stock Alert Bar ──────────────────────────────────────────────────────

function LowStockBar({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10 px-4 py-3"
      data-ocid="inventory.low_stock_alert"
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {items.length} {items.length === 1 ? "producto" : "productos"} con
          stock bajo
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div
            key={`${item.productId}-${item.branch}-${i}`}
            data-ocid={`inventory.low_stock_item.${i + 1}`}
            className="inline-flex items-center gap-1.5 rounded border border-amber-200 dark:border-amber-800/40 bg-card px-2 py-1"
          >
            <span className="font-mono text-xs font-medium text-foreground">
              {item.partNumber}
            </span>
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <StockBadge quantity={item.quantity} min={item.minStockAlert} />
            <span className="text-xs text-muted-foreground">
              ({item.branch === Branch.El_Topo ? "El Topo" : item.branch})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Branch Section ───────────────────────────────────────────────────────────

interface BranchSectionProps {
  branch: Branch;
  label: string;
  lowStockIds: Set<string>;
  productMap: Map<string, Product>;
  index: number;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
}

function BranchSection({
  branch,
  label,
  lowStockIds,
  productMap,
  index,
  isAdmin,
  onEdit,
}: BranchSectionProps) {
  const { data: locations = [], isLoading } = useLocationsByBranch(branch);

  const columns = [
    {
      key: "location",
      header: "Ubicación",
      render: (loc: InventoryLocation) =>
        loc.locationLabel ? (
          <span className="inline-flex items-center gap-1 text-sm">
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            {loc.locationLabel}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "product",
      header: "Producto",
      render: (loc: InventoryLocation) => {
        const productKey = `${loc.productId.toString()}-${branch}`;
        const isLow = lowStockIds.has(productKey);
        const product = productMap.get(loc.productId.toString());
        return (
          <div className="flex items-center gap-2 min-w-0">
            {isLow && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-sm truncate block">
                {product ? product.name : loc.productId.toString()}
              </span>
              {product && (
                <span className="font-mono text-xs text-muted-foreground truncate block">
                  {product.partNumber}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "quantity",
      header: "Cantidad",
      headerClassName: "text-right",
      className: "text-right",
      render: (loc: InventoryLocation) => {
        const productKey = `${loc.productId.toString()}-${branch}`;
        const isLow = lowStockIds.has(productKey);
        return (
          <span
            className={`text-sm font-semibold tabular-nums ${
              isLow ? "text-amber-600 dark:text-amber-400" : "text-foreground"
            }`}
          >
            {Number(loc.quantity)}
          </span>
        );
      },
    },
    {
      key: "updated",
      header: "Actualizado",
      className: "text-right text-xs text-muted-foreground",
      headerClassName: "text-right",
      render: (loc: InventoryLocation) =>
        new Date(Number(loc.updatedAt) / 1_000_000).toLocaleDateString(
          "es-EC",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          },
        ),
    },
    ...(isAdmin
      ? [
          {
            key: "actions",
            header: "",
            className: "w-10",
            render: (loc: InventoryLocation, i: number) => {
              const product = productMap.get(loc.productId.toString());
              if (!product) return null;
              return (
                <button
                  type="button"
                  data-ocid={`inventory.${branch.toLowerCase()}.edit_button.${i + 1}`}
                  onClick={() => onEdit(product)}
                  aria-label={`Editar ${product.name}`}
                  className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <section
      data-ocid={`inventory.branch_section.${index}`}
      className="rounded-lg border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-sm">
            {label}
          </h2>
          <Badge variant="muted">{locations.length} ubicaciones</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 bg-background">
          <LoadingSpinner size="sm" />
        </div>
      ) : locations.length === 0 ? (
        <div
          className="py-8 text-center text-sm text-muted-foreground bg-background"
          data-ocid={`inventory.branch_empty.${index}`}
        >
          Sin ubicaciones registradas para esta sucursal.
        </div>
      ) : (
        <Table
          columns={columns}
          data={locations}
          rowKey={(loc) => `${loc.productId}-${loc.locationLabel}`}
          ocidPrefix={`inventory.${branch.toLowerCase()}`}
          emptyMessage="Sin stock"
          className="bg-background"
        />
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [adjustMode, setAdjustMode] = useState<AdjustMode | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const { data: lowStockItems = [], isLoading: loadingLowStock } =
    useLowStockItems();
  const { data: products = [] } = useListProducts();
  const { data: isAdmin = false } = useIsAdmin();

  const lowStockIds = new Set(
    lowStockItems.map((i) => `${i.productId.toString()}-${i.branch}`),
  );

  const productMap = useMemo(
    () => new Map<string, Product>(products.map((p) => [p.id.toString(), p])),
    [products],
  );

  return (
    <div data-ocid="inventory.page" className="flex flex-col h-full">
      <PageHeader
        title="Inventario"
        subtitle="Stock por sucursal y ubicación"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="inventory.remove_stock_button"
              onClick={() => setAdjustMode("remove")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Minus className="w-4 h-4" />
              Retirar stock
            </button>
            <button
              type="button"
              data-ocid="inventory.add_stock_button"
              onClick={() => setAdjustMode("add")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar stock
            </button>
          </div>
        }
      />

      {/* Search bar */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <InventorySearch />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Busca en ambas sucursales (Puyo y El Topo) para ver disponibilidad y
          ubicación física.
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-background">
        {loadingLowStock ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="inventory.loading_state"
          >
            <LoadingSpinner label="Cargando inventario…" />
          </div>
        ) : (
          <div className="px-6 py-4 space-y-5">
            {/* Low stock alert */}
            <LowStockBar items={lowStockItems} />

            {/* Summary row */}
            <div className="flex items-center gap-3 flex-wrap">
              {lowStockItems.length > 0 ? (
                <Badge variant="warning">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {lowStockItems.length} alerta
                  {lowStockItems.length > 1 ? "s" : ""} de stock bajo
                </Badge>
              ) : (
                <Badge variant="success">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Stock al día
                </Badge>
              )}
            </div>

            {BRANCHES.map((b, i) => (
              <BranchSection
                key={b.value}
                branch={b.value}
                label={b.label}
                lowStockIds={lowStockIds}
                productMap={productMap}
                index={i + 1}
                isAdmin={isAdmin}
                onEdit={setEditProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      <AdjustModal
        open={adjustMode !== null}
        mode={adjustMode ?? "add"}
        onClose={() => setAdjustMode(null)}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
      />
    </div>
  );
}
