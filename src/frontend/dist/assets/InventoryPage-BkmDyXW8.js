import { g as createLucideIcon, r as reactExports, h as useLowStockItems, u as useListProducts, i as useIsAdmin, j as jsxRuntimeExports, P as PageHeader, L as LoadingSpinner, B as Badge, T as TriangleAlert, R as RefreshCw, k as Branch, a as useSearchProducts, X, S as StockBadge, l as useLocationsByBranch, W as Warehouse, m as StockAdjustmentReason, n as useAddStock, o as useRemoveStock, f as useUpdateProduct, p as useLocationsByProduct } from "./index-DJt2JjiO.js";
import { u as ue } from "./index-BERNttVy.js";
import { M as Modal, P as Pencil } from "./Modal-CZ3ExE20.js";
import { T as Table } from "./Table-S5Ktzlj1.js";
import { P as Plus, S as Search } from "./search-B-VMGAoT.js";
import { C as CircleCheck } from "./circle-check-BzaX4e2q.js";
import { C as CircleX } from "./circle-x-BzQ4zilu.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode);
const BRANCHES = [
  { value: Branch.Puyo, label: "Puyo" },
  { value: Branch.El_Topo, label: "El Topo" }
];
const REASONS = [
  { value: StockAdjustmentReason.Purchase, label: "Compra" },
  { value: StockAdjustmentReason.Sale, label: "Venta" },
  { value: StockAdjustmentReason.ServiceUse, label: "Uso en servicio" },
  { value: StockAdjustmentReason.Return, label: "Devolución" },
  { value: StockAdjustmentReason.Correction, label: "Corrección" },
  { value: StockAdjustmentReason.Loss, label: "Pérdida" }
];
const EMPTY_ADJUST_FORM = {
  productId: null,
  branch: Branch.Puyo,
  locationLabel: "",
  quantity: 1,
  reason: StockAdjustmentReason.Purchase,
  note: ""
};
function fmt(value) {
  return value.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function sellingPrice(cost, margin) {
  return cost * (1 + margin / 100);
}
function AdjustModal({ open, mode, onClose }) {
  var _a;
  const [form, setForm] = reactExports.useState(EMPTY_ADJUST_FORM);
  const { data: products = [] } = useListProducts();
  const addStock = useAddStock();
  const removeStock = useRemoveStock();
  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function handleClose() {
    setForm(EMPTY_ADJUST_FORM);
    onClose();
  }
  async function handleSubmit(e) {
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
          note: form.note
        });
        ue.success("Stock agregado correctamente");
      } else {
        await removeStock.mutateAsync({
          productId: form.productId,
          branch: form.branch,
          quantity: qty,
          reason: form.reason,
          note: form.note
        });
        ue.success("Stock retirado correctamente");
      }
      handleClose();
    } catch {
      ue.error("Error al ajustar el stock");
    }
  }
  const isPending = addStock.isPending || removeStock.isPending;
  const isAdd = mode === "add";
  const title = isAdd ? "Agregar Stock" : "Retirar Stock";
  const submitLabel = isPending ? "Guardando…" : isAdd ? "Agregar" : "Retirar";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      onClose: handleClose,
      title,
      size: "md",
      ocidPrefix: "adjust_stock",
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "adjust_stock.cancel_button",
            onClick: handleClose,
            className: "px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            form: "adjust-form",
            "data-ocid": "adjust_stock.submit_button",
            disabled: isPending || !form.productId,
            className: `px-4 py-2 text-sm rounded font-medium disabled:opacity-60 transition-colors ${isAdd ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`,
            children: submitLabel
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "adjust-form", onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "label",
            {
              htmlFor: "adj-product",
              className: "block text-sm font-medium text-foreground mb-1",
              children: [
                "Producto ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "adj-product",
              "data-ocid": "adjust_stock.select",
              required: true,
              value: ((_a = form.productId) == null ? void 0 : _a.toString()) ?? "",
              onChange: (e) => set("productId", e.target.value ? BigInt(e.target.value) : null),
              className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Seleccionar producto…" }),
                products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id.toString(), children: [
                  p.partNumber,
                  " — ",
                  p.name
                ] }, p.id.toString()))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: "adj-branch",
                className: "block text-sm font-medium text-foreground mb-1",
                children: [
                  "Sucursal ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                id: "adj-branch",
                value: form.branch,
                onChange: (e) => set("branch", e.target.value),
                className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                children: BRANCHES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.value, children: b.label }, b.value))
              }
            )
          ] }),
          isAdd && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "adj-location",
                className: "block text-sm font-medium text-foreground mb-1",
                children: "Ubicación"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "adj-location",
                value: form.locationLabel,
                onChange: (e) => set("locationLabel", e.target.value),
                placeholder: "Ej: Estante A-3",
                className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: "adj-qty",
                className: "block text-sm font-medium text-foreground mb-1",
                children: [
                  "Cantidad ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "adj-qty",
                type: "number",
                min: "1",
                step: "1",
                required: true,
                value: form.quantity,
                onChange: (e) => set(
                  "quantity",
                  Math.max(1, Number.parseInt(e.target.value) || 1)
                ),
                className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: "adj-reason",
                className: "block text-sm font-medium text-foreground mb-1",
                children: [
                  "Motivo ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                id: "adj-reason",
                value: form.reason,
                onChange: (e) => set("reason", e.target.value),
                className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                children: REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r.value, children: r.label }, r.value))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "adj-note",
              className: "block text-sm font-medium text-foreground mb-1",
              children: "Nota"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "adj-note",
              value: form.note,
              onChange: (e) => set("note", e.target.value),
              rows: 2,
              placeholder: "Observaciones adicionales…",
              className: "w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            }
          )
        ] })
      ] })
    }
  );
}
const EMPTY_PRODUCT_FORM = {
  partNumber: "",
  name: "",
  description: "",
  supplierName: "",
  supplierPartNumber: "",
  costPrice: 0,
  marginPercent: 0,
  minStockAlert: BigInt(0)
};
function EditProductModal({ product, onClose }) {
  const open = product !== null;
  const update = useUpdateProduct();
  const initial = product ? {
    partNumber: product.partNumber,
    name: product.name,
    description: product.description,
    supplierName: product.supplierName,
    supplierPartNumber: product.supplierPartNumber,
    costPrice: product.costPrice,
    marginPercent: product.marginPercent,
    minStockAlert: product.minStockAlert
  } : EMPTY_PRODUCT_FORM;
  const [form, setForm] = reactExports.useState(initial);
  reactExports.useEffect(() => {
    if (open) {
      setForm(
        product ? {
          partNumber: product.partNumber,
          name: product.name,
          description: product.description,
          supplierName: product.supplierName,
          supplierPartNumber: product.supplierPartNumber,
          costPrice: product.costPrice,
          marginPercent: product.marginPercent,
          minStockAlert: product.minStockAlert
        } : EMPTY_PRODUCT_FORM
      );
    }
  }, [open, product]);
  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!product) return;
    try {
      await update.mutateAsync({ id: product.id, input: form });
      ue.success("Producto actualizado");
      onClose();
    } catch {
      ue.error("Error al guardar el producto");
    }
  }
  const selling = sellingPrice(form.costPrice, form.marginPercent);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      onClose,
      title: "Editar Producto",
      size: "lg",
      ocidPrefix: "inventory_edit_product",
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "inventory_edit_product.cancel_button",
            onClick: onClose,
            className: "px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            form: "inv-edit-product-form",
            "data-ocid": "inventory_edit_product.submit_button",
            disabled: update.isPending,
            className: "px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors font-medium",
            children: update.isPending ? "Guardando…" : "Guardar cambios"
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          id: "inv-edit-product-form",
          onSubmit: handleSubmit,
          className: "space-y-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2", children: "Identificación" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "label",
                    {
                      htmlFor: "inv-pf-partNumber",
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
                      id: "inv-pf-partNumber",
                      "data-ocid": "inventory_edit_product.input",
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
                      htmlFor: "inv-pf-name",
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
                      id: "inv-pf-name",
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
                    htmlFor: "inv-pf-description",
                    className: "block text-sm font-medium text-foreground mb-1",
                    children: "Descripción"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    id: "inv-pf-description",
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
                      htmlFor: "inv-pf-supplierName",
                      className: "block text-sm font-medium text-foreground mb-1",
                      children: "Nombre del proveedor"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "inv-pf-supplierName",
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
                      htmlFor: "inv-pf-supplierPN",
                      className: "block text-sm font-medium text-foreground mb-1",
                      children: "N° de parte proveedor"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "inv-pf-supplierPN",
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
                      htmlFor: "inv-pf-costPrice",
                      className: "block text-sm font-medium text-foreground mb-1",
                      children: "Precio de costo ($)"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "inv-pf-costPrice",
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
                      htmlFor: "inv-pf-margin",
                      className: "block text-sm font-medium text-foreground mb-1",
                      children: "Margen de ganancia (%)"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "inv-pf-margin",
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
                      htmlFor: "inv-pf-selling",
                      className: "block text-sm font-medium text-foreground mb-1",
                      children: "Precio de venta ($)"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      id: "inv-pf-selling",
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
                    htmlFor: "inv-pf-minStock",
                    className: "block text-sm font-medium text-foreground mb-1",
                    children: "Stock mínimo de alerta"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    id: "inv-pf-minStock",
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
          ]
        }
      )
    }
  );
}
function SearchResultCard({ product, index }) {
  const { data: locations = [], isLoading } = useLocationsByProduct(product.id);
  const byBranch = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const loc of locations) {
      const b = loc.branch;
      if (!map.has(b)) map.set(b, []);
      map.get(b).push(loc);
    }
    return map;
  }, [locations]);
  function totalForBranch(branch) {
    return (byBranch.get(branch) ?? []).reduce(
      (sum, l) => sum + Number(l.quantity),
      0
    );
  }
  const total = totalForBranch(Branch.Puyo) + totalForBranch(Branch.El_Topo);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": `inventory.search_result.${index}`,
      className: "px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-0",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground block truncate", children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: product.partNumber }),
            product.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground block truncate max-w-sm", children: product.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground tabular-nums", children: isLoading ? "…" : total })
          ] })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: BRANCHES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-7 w-28 rounded bg-muted/40 animate-pulse"
          },
          b.value
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: BRANCHES.map((b) => {
          const branchLocs = byBranch.get(b.value) ?? [];
          const qty = branchLocs.reduce(
            (sum, l) => sum + Number(l.quantity),
            0
          );
          const hasStock = qty > 0;
          const locationLabels = branchLocs.filter((l) => l.locationLabel).map((l) => l.locationLabel).join(", ");
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `inventory.search_result_branch.${index}.${b.value.toLowerCase()}`,
              className: `inline-flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs ${hasStock ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/10" : "border-border bg-muted/30"}`,
              children: [
                hasStock ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3 text-muted-foreground flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `font-medium ${hasStock ? "text-emerald-800 dark:text-emerald-300" : "text-muted-foreground"}`,
                    children: b.label
                  }
                ),
                hasStock ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `font-bold tabular-nums ${hasStock ? "text-emerald-800 dark:text-emerald-300" : "text-muted-foreground"}`,
                      children: [
                        qty,
                        " uds."
                      ]
                    }
                  ),
                  locationLabels && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-2.5 h-2.5" }),
                    locationLabels
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sin stock" })
              ]
            },
            b.value
          );
        }) })
      ]
    }
  );
}
function InventorySearch() {
  const [query, setQuery] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(false);
  const wrapperRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const term = query.trim();
  const { data: results = [], isLoading } = useSearchProducts(term);
  reactExports.useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  function handleChange(e) {
    setQuery(e.target.value);
    setOpen(e.target.value.trim().length >= 2);
  }
  function handleClear() {
    var _a;
    setQuery("");
    setOpen(false);
    (_a = inputRef.current) == null ? void 0 : _a.focus();
  }
  const showPanel = open && term.length >= 2;
  const showEmpty = showPanel && !isLoading && results.length === 0;
  const showResults = showPanel && results.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: wrapperRef, className: "relative w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          type: "search",
          "data-ocid": "inventory.search_input",
          value: query,
          onChange: handleChange,
          onFocus: () => {
            if (term.length >= 2) setOpen(true);
          },
          placeholder: "Buscar repuesto por nombre, N° de parte o descripción…",
          className: "w-full pl-10 pr-10 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow",
          autoComplete: "off"
        }
      ),
      query && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "inventory.search_clear_button",
          onClick: handleClear,
          "aria-label": "Limpiar búsqueda",
          className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
        }
      )
    ] }),
    showPanel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "inventory.search_panel",
        className: "absolute z-30 top-full mt-1.5 left-0 right-0 rounded-lg border border-border bg-card shadow-elevated overflow-hidden",
        children: [
          isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "inventory.search_loading_state",
              className: "flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }),
                "Buscando…"
              ]
            }
          ),
          showEmpty && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "inventory.search_empty_state",
              className: "flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 flex-shrink-0" }),
                "No se encontraron productos para “",
                term,
                "”"
              ]
            }
          ),
          showResults && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30", children: [
              results.length,
              " ",
              results.length === 1 ? "resultado" : "resultados",
              " — disponibilidad por sucursal"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-80 overflow-y-auto", children: results.map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              SearchResultCard,
              {
                product,
                index: i + 1
              },
              product.id.toString()
            )) })
          ] })
        ]
      }
    )
  ] });
}
function LowStockBar({ items }) {
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10 px-4 py-3",
      "data-ocid": "inventory.low_stock_alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 dark:text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-amber-800 dark:text-amber-300", children: [
            items.length,
            " ",
            items.length === 1 ? "producto" : "productos",
            " con stock bajo"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": `inventory.low_stock_item.${i + 1}`,
            className: "inline-flex items-center gap-1.5 rounded border border-amber-200 dark:border-amber-800/40 bg-card px-2 py-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-medium text-foreground", children: item.partNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: item.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StockBadge, { quantity: item.quantity, min: item.minStockAlert }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                item.branch === Branch.El_Topo ? "El Topo" : item.branch,
                ")"
              ] })
            ]
          },
          `${item.productId}-${item.branch}-${i}`
        )) })
      ]
    }
  );
}
function BranchSection({
  branch,
  label,
  lowStockIds,
  productMap,
  index,
  isAdmin,
  onEdit
}) {
  const { data: locations = [], isLoading } = useLocationsByBranch(branch);
  const columns = [
    {
      key: "location",
      header: "Ubicación",
      render: (loc) => loc.locationLabel ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3 text-muted-foreground flex-shrink-0" }),
        loc.locationLabel
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" })
    },
    {
      key: "product",
      header: "Producto",
      render: (loc) => {
        const productKey = `${loc.productId.toString()}-${branch}`;
        const isLow = lowStockIds.has(productKey);
        const product = productMap.get(loc.productId.toString());
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          isLow && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm truncate block", children: product ? product.name : loc.productId.toString() }),
            product && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground truncate block", children: product.partNumber })
          ] })
        ] });
      }
    },
    {
      key: "quantity",
      header: "Cantidad",
      headerClassName: "text-right",
      className: "text-right",
      render: (loc) => {
        const productKey = `${loc.productId.toString()}-${branch}`;
        const isLow = lowStockIds.has(productKey);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-sm font-semibold tabular-nums ${isLow ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`,
            children: Number(loc.quantity)
          }
        );
      }
    },
    {
      key: "updated",
      header: "Actualizado",
      className: "text-right text-xs text-muted-foreground",
      headerClassName: "text-right",
      render: (loc) => new Date(Number(loc.updatedAt) / 1e6).toLocaleDateString(
        "es-EC",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      )
    },
    ...isAdmin ? [
      {
        key: "actions",
        header: "",
        className: "w-10",
        render: (loc, i) => {
          const product = productMap.get(loc.productId.toString());
          if (!product) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": `inventory.${branch.toLowerCase()}.edit_button.${i + 1}`,
              onClick: () => onEdit(product),
              "aria-label": `Editar ${product.name}`,
              className: "p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
            }
          );
        }
      }
    ] : []
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      "data-ocid": `inventory.branch_section.${index}`,
      className: "rounded-lg border border-border overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between px-4 py-3 bg-card border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-foreground text-sm", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "muted", children: [
            locations.length,
            " ubicaciones"
          ] })
        ] }) }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-10 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) }) : locations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "py-8 text-center text-sm text-muted-foreground bg-background",
            "data-ocid": `inventory.branch_empty.${index}`,
            children: "Sin ubicaciones registradas para esta sucursal."
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Table,
          {
            columns,
            data: locations,
            rowKey: (loc) => `${loc.productId}-${loc.locationLabel}`,
            ocidPrefix: `inventory.${branch.toLowerCase()}`,
            emptyMessage: "Sin stock",
            className: "bg-background"
          }
        )
      ]
    }
  );
}
function InventoryPage() {
  const [adjustMode, setAdjustMode] = reactExports.useState(null);
  const [editProduct, setEditProduct] = reactExports.useState(null);
  const { data: lowStockItems = [], isLoading: loadingLowStock } = useLowStockItems();
  const { data: products = [] } = useListProducts();
  const { data: isAdmin = false } = useIsAdmin();
  const lowStockIds = new Set(
    lowStockItems.map((i) => `${i.productId.toString()}-${i.branch}`)
  );
  const productMap = reactExports.useMemo(
    () => new Map(products.map((p) => [p.id.toString(), p])),
    [products]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "inventory.page", className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: "Inventario",
        subtitle: "Stock por sucursal y ubicación",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "inventory.remove_stock_button",
              onClick: () => setAdjustMode("remove"),
              className: "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4" }),
                "Retirar stock"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "inventory.add_stock_button",
              onClick: () => setAdjustMode("add"),
              className: "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                "Agregar stock"
              ]
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InventorySearch, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs text-muted-foreground", children: "Busca en ambas sucursales (Puyo y El Topo) para ver disponibilidad y ubicación física." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto bg-background", children: loadingLowStock ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex items-center justify-center py-20",
        "data-ocid": "inventory.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { label: "Cargando inventario…" })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LowStockBar, { items: lowStockItems }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 flex-wrap", children: lowStockItems.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "warning", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3 mr-1" }),
        lowStockItems.length,
        " alerta",
        lowStockItems.length > 1 ? "s" : "",
        " de stock bajo"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3 h-3 mr-1" }),
        "Stock al día"
      ] }) }),
      BRANCHES.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        BranchSection,
        {
          branch: b.value,
          label: b.label,
          lowStockIds,
          productMap,
          index: i + 1,
          isAdmin,
          onEdit: setEditProduct
        },
        b.value
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AdjustModal,
      {
        open: adjustMode !== null,
        mode: adjustMode ?? "add",
        onClose: () => setAdjustMode(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditProductModal,
      {
        product: editProduct,
        onClose: () => setEditProduct(null)
      }
    )
  ] });
}
export {
  InventoryPage as default
};
