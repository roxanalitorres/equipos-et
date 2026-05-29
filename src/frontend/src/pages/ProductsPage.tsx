import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Badge from "../components/shared/Badge";
import EmptyState from "../components/shared/EmptyState";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Modal from "../components/shared/Modal";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import {
  useCreateProduct,
  useCreateService,
  useDeleteProduct,
  useListProducts,
  useListServices,
  useSearchProducts,
  useUpdateProduct,
} from "../hooks/useBackend";
import type { Product, ProductId, ProductInput } from "../types";

// Local UI service type (mirrors backend Service shape)
interface UIService {
  codigo: string;
  descripcion: string;
  precio: number;
}

const EMPTY_FORM: ProductInput = {
  partNumber: "",
  name: "",
  description: "",
  supplierName: "",
  supplierPartNumber: "",
  costPrice: 0,
  marginPercent: 0,
  minStockAlert: BigInt(0),
};

function sellingPrice(cost: number, margin: number): number {
  return cost * (1 + margin / 100);
}

// ─── Service Form Modal ───────────────────────────────────────────────────────

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (service: Omit<UIService, "codigo">) => void;
}

function ServiceFormModal({ open, onClose, onSaved }: ServiceFormModalProps) {
  const [form, setForm] = useState<Omit<UIService, "codigo">>({
    descripcion: "",
    precio: 0,
  });

  useEffect(() => {
    if (open) setForm({ descripcion: "", precio: 0 });
  }, [open]);

  function set<K extends keyof Omit<UIService, "codigo">>(
    key: K,
    value: Omit<UIService, "codigo">[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descripcion.trim()) {
      toast.error("La descripción es obligatoria");
      return;
    }
    onSaved(form);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo Servicio"
      size="md"
      ocidPrefix="service_form"
      footer={
        <>
          <button
            type="button"
            data-ocid="service_form.cancel_button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="service-form"
            data-ocid="service_form.submit_button"
            className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Guardar servicio
          </button>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="sf-descripcion"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Descripción <span className="text-destructive">*</span>
          </label>
          <input
            id="sf-descripcion"
            required
            value={form.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            placeholder="Ej: Mantenimiento preventivo"
            className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="sf-precio"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Precio ($)
          </label>
          <input
            id="sf-precio"
            type="number"
            min="0"
            step="0.01"
            value={form.precio}
            onChange={(e) =>
              set("precio", Number.parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </form>
    </Modal>
  );
}

function fmt(value: number): string {
  return value.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: ProductInput;
  editId: ProductId | null;
  onSaved: () => void;
}

function ProductFormModal({
  open,
  onClose,
  initial,
  editId,
  onSaved,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductInput>(initial);
  const create = useCreateProduct();
  const update = useUpdateProduct();

  // Sync form data whenever open changes or initial values update
  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editId !== null) {
        await update.mutateAsync({ id: editId, input: form });
        toast.success("Producto actualizado");
      } else {
        await create.mutateAsync(form);
        toast.success("Producto creado");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Error al guardar el producto");
    }
  }

  const selling = sellingPrice(form.costPrice, form.marginPercent);
  const isPending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId !== null ? "Editar Producto" : "Nuevo Producto"}
      size="lg"
      ocidPrefix="product_form"
      footer={
        <>
          <button
            type="button"
            data-ocid="product_form.cancel_button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            data-ocid="product_form.submit_button"
            disabled={isPending}
            className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors font-medium"
          >
            {isPending
              ? "Guardando…"
              : editId !== null
                ? "Guardar cambios"
                : "Crear producto"}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Identificación */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Identificación
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="pf-partNumber"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Número de parte <span className="text-destructive">*</span>
              </label>
              <input
                id="pf-partNumber"
                data-ocid="product_form.input"
                required
                value={form.partNumber}
                onChange={(e) => set("partNumber", e.target.value)}
                placeholder="Ej: CAT-3456-A"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="pf-name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                id="pf-name"
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
              htmlFor="pf-description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Descripción
            </label>
            <textarea
              id="pf-description"
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
                htmlFor="pf-supplierName"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Nombre del proveedor
              </label>
              <input
                id="pf-supplierName"
                value={form.supplierName}
                onChange={(e) => set("supplierName", e.target.value)}
                placeholder="Ej: Ferreyros S.A."
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="pf-supplierPN"
                className="block text-sm font-medium text-foreground mb-1"
              >
                N° de parte proveedor
              </label>
              <input
                id="pf-supplierPN"
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
                htmlFor="pf-costPrice"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Precio de costo ($)
              </label>
              <input
                id="pf-costPrice"
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
                htmlFor="pf-margin"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Margen de ganancia (%)
              </label>
              <input
                id="pf-margin"
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
                htmlFor="pf-selling"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Precio de venta ($)
              </label>
              <div
                id="pf-selling"
                className="px-3 py-2 text-sm border border-border rounded bg-muted/40 text-foreground font-medium"
              >
                ${fmt(selling)}
              </div>
            </div>
          </div>
          <div className="w-1/3">
            <label
              htmlFor="pf-minStock"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Stock mínimo de alerta
            </label>
            <input
              id="pf-minStock"
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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function DeleteModal({
  product,
  onClose,
  onConfirm,
  isPending,
}: DeleteModalProps) {
  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title="Eliminar producto"
      size="sm"
      ocidPrefix="delete_product"
      footer={
        <>
          <button
            type="button"
            data-ocid="delete_product.cancel_button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-ocid="delete_product.confirm_button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60 transition-colors font-medium"
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        ¿Estás seguro de que deseas eliminar{" "}
        <span className="font-semibold text-foreground">{product?.name}</span>
        {product?.partNumber ? ` (${product.partNumber})` : ""}? Esta acción no
        se puede deshacer.
      </p>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<"productos" | "servicios">(
    "productos",
  );

  // ── Product state ──
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: allProducts = [], isLoading } = useListProducts();
  const { data: searchResults = [], isLoading: searching } =
    useSearchProducts(search);
  const deleteProduct = useDeleteProduct();

  const products = search.trim().length > 1 ? searchResults : allProducts;
  const isSearching = search.trim().length > 1 && searching;

  function openCreate() {
    setEditProduct(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Producto eliminado");
      setDeleteTarget(null);
    } catch {
      toast.error("Error al eliminar el producto");
    }
  }

  const formInitial: ProductInput = editProduct
    ? {
        partNumber: editProduct.partNumber,
        name: editProduct.name,
        description: editProduct.description,
        supplierName: editProduct.supplierName,
        supplierPartNumber: editProduct.supplierPartNumber,
        costPrice: editProduct.costPrice,
        marginPercent: editProduct.marginPercent,
        minStockAlert: editProduct.minStockAlert,
      }
    : EMPTY_FORM;

  // ── Service state ──
  const { data: services = [], refetch: refetchServices } = useListServices();
  const createServiceMutation = useCreateService();
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  async function handleAddService(service: Omit<UIService, "codigo">) {
    try {
      await createServiceMutation.mutateAsync({
        description: service.descripcion,
        price: service.precio,
      });
      await refetchServices();
      toast.success("Servicio agregado");
    } catch (e) {
      console.error("Error creating service:", e);
      toast.error("Error al guardar el servicio");
    }
  }

  const serviceColumns = [
    {
      key: "codigo",
      header: "Código",
      render: (s: UIService) => (
        <span className="font-mono text-xs font-medium text-foreground">
          {s.codigo}
        </span>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (s: UIService) => (
        <span className="text-sm text-foreground">{s.descripcion}</span>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      headerClassName: "text-right",
      className: "text-right",
      render: (s: UIService) => (
        <span className="text-sm font-semibold text-primary tabular-nums">
          ${fmt(s.precio)}
        </span>
      ),
    },
  ];

  const productColumns = [
    {
      key: "partNumber",
      header: "N° Parte",
      render: (p: Product) => (
        <span className="font-mono text-xs font-medium text-foreground">
          {p.partNumber}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nombre",
      render: (p: Product) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{p.name}</p>
          {p.description && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {p.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Proveedor",
      render: (p: Product) => (
        <div className="min-w-0">
          <p className="text-sm truncate">{p.supplierName || "—"}</p>
          {p.supplierPartNumber && (
            <p className="text-xs text-muted-foreground font-mono">
              {p.supplierPartNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "costPrice",
      header: "Costo",
      headerClassName: "text-right",
      className: "text-right",
      render: (p: Product) => (
        <span className="text-sm tabular-nums">${fmt(p.costPrice)}</span>
      ),
    },
    {
      key: "margin",
      header: "Margen",
      headerClassName: "text-right",
      className: "text-right",
      render: (p: Product) => (
        <Badge variant="info">{p.marginPercent.toFixed(1)}%</Badge>
      ),
    },
    {
      key: "selling",
      header: "Precio Venta",
      headerClassName: "text-right",
      className: "text-right",
      render: (p: Product) => (
        <span className="text-sm font-semibold text-primary tabular-nums">
          ${fmt(sellingPrice(p.costPrice, p.marginPercent))}
        </span>
      ),
    },
    {
      key: "minStock",
      header: "Stock Mín.",
      headerClassName: "text-center",
      className: "text-center",
      render: (p: Product) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {Number(p.minStockAlert)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-16",
      render: (p: Product, i: number) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            data-ocid={`products.edit_button.${i + 1}`}
            onClick={() => openEdit(p)}
            aria-label="Editar"
            className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-ocid={`products.delete_button.${i + 1}`}
            onClick={() => setDeleteTarget(p)}
            aria-label="Eliminar"
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div data-ocid="products.page" className="flex flex-col h-full">
      <PageHeader
        title="Catálogo"
        subtitle="Productos y servicios"
        actions={
          activeTab === "productos" ? (
            <button
              type="button"
              data-ocid="products.add_button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo producto
            </button>
          ) : (
            <button
              type="button"
              data-ocid="services.add_button"
              onClick={() => setServiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo servicio
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="px-6 border-b border-border bg-card">
        <div className="flex gap-1">
          <button
            type="button"
            data-ocid="catalog.productos.tab"
            onClick={() => setActiveTab("productos")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "productos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Productos
          </button>
          <button
            type="button"
            data-ocid="catalog.servicios.tab"
            onClick={() => setActiveTab("servicios")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "servicios"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Servicios
          </button>
        </div>
      </div>

      {/* Productos Tab */}
      {activeTab === "productos" && (
        <>
          {/* Search bar */}
          <div className="px-6 py-3 border-b border-border bg-card">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                data-ocid="products.search_input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, N° parte o descripción…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-background">
            {isLoading || isSearching ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="products.loading_state"
              >
                <LoadingSpinner />
              </div>
            ) : products.length === 0 && search.trim().length > 1 ? (
              <EmptyState
                ocid="products.empty_state"
                icon={<Search className="w-6 h-6" />}
                title="Sin resultados"
                description={`No se encontraron productos para "${search}"`}
              />
            ) : products.length === 0 ? (
              <EmptyState
                ocid="products.empty_state"
                icon={<Plus className="w-6 h-6" />}
                title="Sin productos"
                description="Agrega el primer producto al catálogo."
                action={{
                  label: "Nuevo producto",
                  onClick: openCreate,
                  ocid: "products.add_button.empty",
                }}
              />
            ) : (
              <div className="px-6 py-4">
                <p className="text-xs text-muted-foreground mb-3">
                  {products.length}{" "}
                  {products.length === 1 ? "producto" : "productos"}
                  {search.trim().length > 1 ? ` para "${search}"` : ""}
                </p>
                <Table
                  columns={productColumns}
                  data={products}
                  rowKey={(p) => p.id.toString()}
                  ocidPrefix="products"
                  emptyMessage="Sin productos"
                />
              </div>
            )}
          </div>

          {/* Product Form Modal */}
          <ProductFormModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            initial={formInitial}
            editId={editProduct?.id ?? null}
            onSaved={() => setModalOpen(false)}
          />

          {/* Delete Confirm Modal */}
          <DeleteModal
            product={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            isPending={deleteProduct.isPending}
          />
        </>
      )}

      {/* Servicios Tab */}
      {activeTab === "servicios" && (
        <div className="flex-1 overflow-auto bg-background">
          {services.length === 0 ? (
            <EmptyState
              ocid="services.empty_state"
              icon={<Plus className="w-6 h-6" />}
              title="Sin servicios"
              description="Agrega el primer servicio al catálogo."
              action={{
                label: "Nuevo servicio",
                onClick: () => setServiceModalOpen(true),
                ocid: "services.add_button.empty",
              }}
            />
          ) : (
            <div className="px-6 py-4">
              <p className="text-xs text-muted-foreground mb-3">
                {services.length}{" "}
                {services.length === 1 ? "servicio" : "servicios"}
              </p>
              <Table
                columns={serviceColumns}
                data={services}
                rowKey={(s) => s.codigo}
                ocidPrefix="services"
                emptyMessage="Sin servicios"
              />
            </div>
          )}

          <ServiceFormModal
            open={serviceModalOpen}
            onClose={() => setServiceModalOpen(false)}
            onSaved={handleAddService}
          />
        </div>
      )}
    </div>
  );
}
