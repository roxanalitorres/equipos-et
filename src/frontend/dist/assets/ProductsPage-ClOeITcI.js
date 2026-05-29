import { r as reactExports, u as useListProducts, a as useSearchProducts, b as useDeleteProduct, c as useListServices, d as useCreateService, j as jsxRuntimeExports, P as PageHeader, L as LoadingSpinner, B as Badge, e as useCreateProduct, f as useUpdateProduct } from "./index-DJt2JjiO.js";
import { u as ue } from "./index-BERNttVy.js";
import { E as EmptyState } from "./EmptyState-2OlWgPCk.js";
import { P as Pencil, M as Modal } from "./Modal-CZ3ExE20.js";
import { T as Table } from "./Table-S5Ktzlj1.js";
import { P as Plus, S as Search } from "./search-B-VMGAoT.js";
import { T as Trash2 } from "./trash-2-Du-SFVPF.js";
const EMPTY_FORM = {
  partNumber: "",
  name: "",
  description: "",
  supplierName: "",
  supplierPartNumber: "",
  costPrice: 0,
  marginPercent: 0,
  minStockAlert: BigInt(0)
};
function sellingPrice(cost, margin) {
  return cost * (1 + margin / 100);
}
function ServiceFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = reactExports.useState({
    descripcion: "",
    precio: 0
  });
  reactExports.useEffect(() => {
    if (open) setForm({ descripcion: "", precio: 0 });
  }, [open]);
  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.descripcion.trim()) {
      ue.error("La descripción es obligatoria");
      return;
    }
    onSaved(form);
    onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      onClose,
      title: "Nuevo Servicio",
      size: "md",
      ocidPrefix: "service_form",
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "service_form.cancel_button",
            onClick: onClose,
            className: "px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            form: "service-form",
            "data-ocid": "service_form.submit_button",
            className: "px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium",
            children: "Guardar servicio"
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "service-form", onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "label",
            {
              htmlFor: "sf-descripcion",
              className: "block text-sm font-medium text-foreground mb-1",
              children: [
                "Descripción ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "sf-descripcion",
              required: true,
              value: form.descripcion,
              onChange: (e) => set("descripcion", e.target.value),
              placeholder: "Ej: Mantenimiento preventivo",
              className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "sf-precio",
              className: "block text-sm font-medium text-foreground mb-1",
              children: "Precio ($)"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "sf-precio",
              type: "number",
              min: "0",
              step: "0.01",
              value: form.precio,
              onChange: (e) => set("precio", Number.parseFloat(e.target.value) || 0),
              className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            }
          )
        ] })
      ] })
    }
  );
}
function fmt(value) {
  return value.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function ProductFormModal({
  open,
  onClose,
  initial,
  editId,
  onSaved
}) {
  const [form, setForm] = reactExports.useState(initial);
  const create = useCreateProduct();
  const update = useUpdateProduct();
  reactExports.useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);
  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editId !== null) {
        await update.mutateAsync({ id: editId, input: form });
        ue.success("Producto actualizado");
      } else {
        await create.mutateAsync(form);
        ue.success("Producto creado");
      }
      onSaved();
      onClose();
    } catch {
      ue.error("Error al guardar el producto");
    }
  }
  const selling = sellingPrice(form.costPrice, form.marginPercent);
  const isPending = create.isPending || update.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      onClose,
      title: editId !== null ? "Editar Producto" : "Nuevo Producto",
      size: "lg",
      ocidPrefix: "product_form",
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "product_form.cancel_button",
            onClick: onClose,
            className: "px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            form: "product-form",
            "data-ocid": "product_form.submit_button",
            disabled: isPending,
            className: "px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors font-medium",
            children: isPending ? "Guardando…" : editId !== null ? "Guardar cambios" : "Crear producto"
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "product-form", onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2", children: "Identificación" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  htmlFor: "pf-partNumber",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: [
                    "Número de parte ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pf-partNumber",
                  "data-ocid": "product_form.input",
                  required: true,
                  value: form.partNumber,
                  onChange: (e) => set("partNumber", e.target.value),
                  placeholder: "Ej: CAT-3456-A",
                  className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  htmlFor: "pf-name",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: [
                    "Nombre ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pf-name",
                  required: true,
                  value: form.name,
                  onChange: (e) => set("name", e.target.value),
                  placeholder: "Ej: Filtro de aceite",
                  className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "pf-description",
                className: "block text-sm font-medium text-foreground mb-1",
                children: "Descripción"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                id: "pf-description",
                value: form.description,
                onChange: (e) => set("description", e.target.value),
                rows: 2,
                placeholder: "Descripción técnica del repuesto",
                className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2", children: "Proveedor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "pf-supplierName",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: "Nombre del proveedor"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pf-supplierName",
                  value: form.supplierName,
                  onChange: (e) => set("supplierName", e.target.value),
                  placeholder: "Ej: Ferreyros S.A.",
                  className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "pf-supplierPN",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: "N° de parte proveedor"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pf-supplierPN",
                  value: form.supplierPartNumber,
                  onChange: (e) => set("supplierPartNumber", e.target.value),
                  placeholder: "Ej: 1R-0739",
                  className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2", children: "Precio y alertas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "pf-costPrice",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: "Precio de costo ($)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pf-costPrice",
                  type: "number",
                  min: "0",
                  step: "0.01",
                  value: form.costPrice,
                  onChange: (e) => set("costPrice", Number.parseFloat(e.target.value) || 0),
                  className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "pf-margin",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: "Margen de ganancia (%)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pf-margin",
                  type: "number",
                  min: "0",
                  step: "0.1",
                  value: form.marginPercent,
                  onChange: (e) => set("marginPercent", Number.parseFloat(e.target.value) || 0),
                  className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "pf-selling",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: "Precio de venta ($)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  id: "pf-selling",
                  className: "px-3 py-2 text-sm border border-border rounded bg-muted/40 text-foreground font-medium",
                  children: [
                    "$",
                    fmt(selling)
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-1/3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "pf-minStock",
                className: "block text-sm font-medium text-foreground mb-1",
                children: "Stock mínimo de alerta"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "pf-minStock",
                type: "number",
                min: "0",
                step: "1",
                value: Number(form.minStockAlert),
                onChange: (e) => set(
                  "minStockAlert",
                  BigInt(Number.parseInt(e.target.value) || 0)
                ),
                className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
function DeleteModal({
  product,
  onClose,
  onConfirm,
  isPending
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open: !!product,
      onClose,
      title: "Eliminar producto",
      size: "sm",
      ocidPrefix: "delete_product",
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "delete_product.cancel_button",
            onClick: onClose,
            className: "px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "delete_product.confirm_button",
            onClick: onConfirm,
            disabled: isPending,
            className: "px-4 py-2 text-sm rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60 transition-colors font-medium",
            children: isPending ? "Eliminando…" : "Eliminar"
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "¿Estás seguro de que deseas eliminar",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: product == null ? void 0 : product.name }),
        (product == null ? void 0 : product.partNumber) ? ` (${product.partNumber})` : "",
        "? Esta acción no se puede deshacer."
      ] })
    }
  );
}
function ProductsPage() {
  const [activeTab, setActiveTab] = reactExports.useState(
    "productos"
  );
  const [search, setSearch] = reactExports.useState("");
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editProduct, setEditProduct] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const { data: allProducts = [], isLoading } = useListProducts();
  const { data: searchResults = [], isLoading: searching } = useSearchProducts(search);
  const deleteProduct = useDeleteProduct();
  const products = search.trim().length > 1 ? searchResults : allProducts;
  const isSearching = search.trim().length > 1 && searching;
  function openCreate() {
    setEditProduct(null);
    setModalOpen(true);
  }
  function openEdit(p) {
    setEditProduct(p);
    setModalOpen(true);
  }
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      ue.success("Producto eliminado");
      setDeleteTarget(null);
    } catch {
      ue.error("Error al eliminar el producto");
    }
  }
  const formInitial = editProduct ? {
    partNumber: editProduct.partNumber,
    name: editProduct.name,
    description: editProduct.description,
    supplierName: editProduct.supplierName,
    supplierPartNumber: editProduct.supplierPartNumber,
    costPrice: editProduct.costPrice,
    marginPercent: editProduct.marginPercent,
    minStockAlert: editProduct.minStockAlert
  } : EMPTY_FORM;
  const { data: services = [], refetch: refetchServices } = useListServices();
  const createServiceMutation = useCreateService();
  const [serviceModalOpen, setServiceModalOpen] = reactExports.useState(false);
  async function handleAddService(service) {
    try {
      await createServiceMutation.mutateAsync({
        description: service.descripcion,
        price: service.precio
      });
      await refetchServices();
      ue.success("Servicio agregado");
    } catch (e) {
      console.error("Error creating service:", e);
      ue.error("Error al guardar el servicio");
    }
  }
  const serviceColumns = [
    {
      key: "codigo",
      header: "Código",
      render: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-medium text-foreground", children: s.codigo })
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground", children: s.descripcion })
    },
    {
      key: "precio",
      header: "Precio",
      headerClassName: "text-right",
      className: "text-right",
      render: (s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-primary tabular-nums", children: [
        "$",
        fmt(s.precio)
      ] })
    }
  ];
  const productColumns = [
    {
      key: "partNumber",
      header: "N° Parte",
      render: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-medium text-foreground", children: p.partNumber })
    },
    {
      key: "name",
      header: "Nombre",
      render: (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground truncate", children: p.name }),
        p.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate max-w-xs", children: p.description })
      ] })
    },
    {
      key: "supplier",
      header: "Proveedor",
      render: (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm truncate", children: p.supplierName || "—" }),
        p.supplierPartNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: p.supplierPartNumber })
      ] })
    },
    {
      key: "costPrice",
      header: "Costo",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm tabular-nums", children: [
        "$",
        fmt(p.costPrice)
      ] })
    },
    {
      key: "margin",
      header: "Margen",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "info", children: [
        p.marginPercent.toFixed(1),
        "%"
      ] })
    },
    {
      key: "selling",
      header: "Precio Venta",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-primary tabular-nums", children: [
        "$",
        fmt(sellingPrice(p.costPrice, p.marginPercent))
      ] })
    },
    {
      key: "minStock",
      header: "Stock Mín.",
      headerClassName: "text-center",
      className: "text-center",
      render: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm tabular-nums text-muted-foreground", children: Number(p.minStockAlert) })
    },
    {
      key: "actions",
      header: "",
      className: "w-16",
      render: (p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": `products.edit_button.${i + 1}`,
            onClick: () => openEdit(p),
            "aria-label": "Editar",
            className: "p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": `products.delete_button.${i + 1}`,
            onClick: () => setDeleteTarget(p),
            "aria-label": "Eliminar",
            className: "p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "products.page", className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: "Catálogo",
        subtitle: "Productos y servicios",
        actions: activeTab === "productos" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": "products.add_button",
            onClick: openCreate,
            className: "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
              "Nuevo producto"
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": "services.add_button",
            onClick: () => setServiceModalOpen(true),
            className: "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
              "Nuevo servicio"
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "catalog.productos.tab",
          onClick: () => setActiveTab("productos"),
          className: `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "productos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "Productos"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "catalog.servicios.tab",
          onClick: () => setActiveTab("servicios"),
          className: `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "servicios" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "Servicios"
        }
      )
    ] }) }),
    activeTab === "productos" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-3 border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "search",
            "data-ocid": "products.search_input",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Buscar por nombre, N° parte o descripción…",
            className: "w-full pl-9 pr-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto bg-background", children: isLoading || isSearching ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex items-center justify-center py-20",
          "data-ocid": "products.loading_state",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {})
        }
      ) : products.length === 0 && search.trim().length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        EmptyState,
        {
          ocid: "products.empty_state",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-6 h-6" }),
          title: "Sin resultados",
          description: `No se encontraron productos para "${search}"`
        }
      ) : products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        EmptyState,
        {
          ocid: "products.empty_state",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-6 h-6" }),
          title: "Sin productos",
          description: "Agrega el primer producto al catálogo.",
          action: {
            label: "Nuevo producto",
            onClick: openCreate,
            ocid: "products.add_button.empty"
          }
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
          products.length,
          " ",
          products.length === 1 ? "producto" : "productos",
          search.trim().length > 1 ? ` para "${search}"` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Table,
          {
            columns: productColumns,
            data: products,
            rowKey: (p) => p.id.toString(),
            ocidPrefix: "products",
            emptyMessage: "Sin productos"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProductFormModal,
        {
          open: modalOpen,
          onClose: () => setModalOpen(false),
          initial: formInitial,
          editId: (editProduct == null ? void 0 : editProduct.id) ?? null,
          onSaved: () => setModalOpen(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DeleteModal,
        {
          product: deleteTarget,
          onClose: () => setDeleteTarget(null),
          onConfirm: handleDelete,
          isPending: deleteProduct.isPending
        }
      )
    ] }),
    activeTab === "servicios" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto bg-background", children: [
      services.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        EmptyState,
        {
          ocid: "services.empty_state",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-6 h-6" }),
          title: "Sin servicios",
          description: "Agrega el primer servicio al catálogo.",
          action: {
            label: "Nuevo servicio",
            onClick: () => setServiceModalOpen(true),
            ocid: "services.add_button.empty"
          }
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
          services.length,
          " ",
          services.length === 1 ? "servicio" : "servicios"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Table,
          {
            columns: serviceColumns,
            data: services,
            rowKey: (s) => s.codigo,
            ocidPrefix: "services",
            emptyMessage: "Sin servicios"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ServiceFormModal,
        {
          open: serviceModalOpen,
          onClose: () => setServiceModalOpen(false),
          onSaved: handleAddService
        }
      )
    ] })
  ] });
}
export {
  ProductsPage as default
};
