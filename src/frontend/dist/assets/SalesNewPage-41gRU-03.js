import { g as createLucideIcon, J as useNavigate, K as useSearch, H as DocumentType, r as reactExports, x as useCreateProforma, y as useCreateInvoice, j as jsxRuntimeExports, P as PageHeader, t as Button, M as ArrowRight, N as Check, I as React2, E as useListCustomers, O as useCreateCustomer, a as useSearchProducts, c as useListServices, B as Badge } from "./index-wAMx3mFr.js";
import { I as Input } from "./input-AZuZDtEh.js";
import { L as Label } from "./label-Ca9I-f_m.js";
import { u as ue } from "./index-Dzuo4XyD.js";
import { S as Search, P as Plus } from "./search-Lx-JW2d5.js";
import { T as Trash2 } from "./trash-2-Cu8VV5l4.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
const STEPS = ["Cliente", "Productos", "Revisión"];
function StepIndicator({ current }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0 mb-8", "data-ocid": "sales_new.steps", children: STEPS.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React2.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-smooth ${i < current ? "bg-primary text-primary-foreground" : i === current ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`,
          children: i < current ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }) : i + 1
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `text-xs font-medium whitespace-nowrap ${i === current ? "text-primary" : "text-muted-foreground"}`,
          children: label
        }
      )
    ] }),
    i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `flex-1 h-0.5 mx-3 mb-4 transition-smooth ${i < current ? "bg-primary" : "bg-border"}`
      }
    )
  ] }, label)) });
}
function CustomerStep({
  selected,
  onSelect
}) {
  const [mode, setMode] = reactExports.useState("search");
  const [q, setQ] = reactExports.useState("");
  const { data: customers = [], isLoading } = useListCustomers();
  const createCustomer = useCreateCustomer();
  const [form, setForm] = reactExports.useState({
    name: "",
    taxId: "",
    email: "",
    phone: ""
  });
  const filtered = q.trim() ? customers.filter(
    (c) => {
      var _a;
      return c.name.toLowerCase().includes(q.toLowerCase()) || (((_a = c.taxId) == null ? void 0 : _a.toLowerCase().includes(q.toLowerCase())) ?? false);
    }
  ) : customers;
  function handleCreate() {
    if (!form.name.trim()) {
      ue.error("El nombre es requerido");
      return;
    }
    createCustomer.mutate(
      {
        name: form.name,
        taxId: form.taxId || void 0,
        email: form.email || void 0,
        phone: form.phone || void 0
      },
      {
        onSuccess: (c) => {
          onSelect(c);
          ue.success("Cliente creado");
        },
        onError: () => ue.error("Error al crear cliente")
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "sales_new.customer.section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "sales_new.customer_search.tab",
          className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === "search" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`,
          onClick: () => setMode("search"),
          children: "Buscar cliente existente"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "sales_new.customer_new.tab",
          className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === "new" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`,
          onClick: () => setMode("new"),
          children: "Nuevo cliente"
        }
      )
    ] }),
    mode === "search" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-input rounded-md px-3 h-9 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            "data-ocid": "sales_new.customer.search_input",
            type: "text",
            placeholder: "Buscar por nombre o RUC/cédula...",
            className: "bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground",
            value: q,
            onChange: (e) => setQ(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-lg overflow-hidden max-h-72 overflow-y-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-muted-foreground text-sm", children: "Sin resultados" }) : filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          "data-ocid": `sales_new.customer.item.${c.id.toString()}`,
          onClick: () => onSelect(c),
          className: `w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${(selected == null ? void 0 : selected.id) === c.id ? "bg-primary/10" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm text-foreground truncate", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                c.taxId ? `RUC/CI: ${c.taxId}` : "Sin RUC/CI",
                c.phone ? ` · ${c.phone}` : ""
              ] })
            ] }),
            (selected == null ? void 0 : selected.id) === c.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-primary flex-shrink-0" })
          ]
        },
        c.id.toString()
      )) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "c-name", children: [
          "Nombre ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "c-name",
            "data-ocid": "sales_new.customer.name.input",
            value: form.name,
            onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
            placeholder: "Razón social o nombre completo",
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-taxid", children: "RUC / Cédula" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "c-taxid",
            "data-ocid": "sales_new.customer.taxid.input",
            value: form.taxId ?? "",
            onChange: (e) => setForm((f) => ({ ...f, taxId: e.target.value })),
            placeholder: "0912345678001",
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "c-email",
            "data-ocid": "sales_new.customer.email.input",
            type: "email",
            value: form.email ?? "",
            onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })),
            placeholder: "cliente@ejemplo.com",
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c-phone", children: "Teléfono" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "c-phone",
            "data-ocid": "sales_new.customer.phone.input",
            value: form.phone ?? "",
            onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })),
            placeholder: "0999123456",
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          "data-ocid": "sales_new.customer.create_button",
          onClick: handleCreate,
          disabled: createCustomer.isPending || !form.name.trim(),
          size: "sm",
          children: [
            createCustomer.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Crear cliente"
          ]
        }
      )
    ] }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-primary flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: selected.name }),
        selected.taxId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "RUC/CI: ",
          selected.taxId
        ] })
      ] })
    ] })
  ] });
}
const sellingPrice = (p) => p.costPrice * (1 + p.marginPercent / 100);
function ProductsStep({
  items,
  onChange
}) {
  const [activeTab, setActiveTab] = reactExports.useState(
    "productos"
  );
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = reactExports.useState("");
  const [showDropdown, setShowDropdown] = reactExports.useState(false);
  const { data: results = [], isFetching } = useSearchProducts(searchTerm);
  const { data: catalogServices = [] } = useListServices();
  function addProduct(p) {
    const existing = items.find((i) => i.product.id === p.id);
    if (existing) {
      onChange(
        items.map(
          (i) => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      onChange([...items, { product: p, quantity: 1, tipo: "Producto" }]);
    }
    setSearchTerm("");
    setShowDropdown(false);
  }
  function addService(svc) {
    const syntheticProduct = {
      id: svc.codigo,
      partNumber: svc.codigo,
      name: svc.descripcion,
      costPrice: svc.precio,
      marginPercent: 0
    };
    const existing = items.find((i) => String(i.product.id) === svc.codigo);
    if (existing) {
      onChange(
        items.map(
          (i) => String(i.product.id) === svc.codigo ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      onChange([
        ...items,
        { product: syntheticProduct, quantity: 1, tipo: "Servicio" }
      ]);
    }
    setServiceSearchTerm("");
  }
  function updateQty(idx, qty) {
    if (qty < 1) return;
    onChange(
      items.map((item, i) => i === idx ? { ...item, quantity: qty } : item)
    );
  }
  function removeItem(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }
  const runningSubtotal = items.reduce(
    (sum, i) => sum + sellingPrice(i.product) * i.quantity,
    0
  );
  const filteredServices = serviceSearchTerm.trim() ? catalogServices.filter(
    (s) => s.codigo.toLowerCase().includes(serviceSearchTerm.toLowerCase()) || s.descripcion.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  ) : catalogServices;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "sales_new.products.section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "sales_new.products_tab",
          className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === "productos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`,
          onClick: () => setActiveTab("productos"),
          children: "Productos"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "sales_new.services_tab",
          className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === "servicios" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`,
          onClick: () => setActiveTab("servicios"),
          children: "Servicios"
        }
      )
    ] }),
    activeTab === "productos" ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-input border border-border rounded-md px-3 h-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            "data-ocid": "sales_new.products.search_input",
            type: "text",
            placeholder: "Buscar por número de parte o nombre...",
            className: "bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground",
            value: searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            },
            onFocus: () => setShowDropdown(true)
          }
        ),
        isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin text-muted-foreground" })
      ] }),
      showDropdown && searchTerm.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-20 top-full left-0 right-0 mt-1 border border-border bg-card rounded-lg shadow-elevated max-h-64 overflow-y-auto", children: results.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-3 text-sm text-muted-foreground text-center", children: "Sin resultados" }) : results.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": `sales_new.product_result.${p.id.toString()}`,
          className: "w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0",
          onClick: () => addProduct(p),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm text-foreground truncate", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "PN: ",
                p.partNumber,
                p.description ? ` · ${p.description}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-primary flex-shrink-0", children: [
              "$",
              sellingPrice(p).toFixed(2)
            ] })
          ] })
        },
        p.id.toString()
      )) })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-input border border-border rounded-md px-3 h-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            "data-ocid": "sales_new.services.search_input",
            type: "text",
            placeholder: "Buscar por código o descripción...",
            className: "bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground",
            value: serviceSearchTerm,
            onChange: (e) => setServiceSearchTerm(e.target.value)
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto mb-4", children: filteredServices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-3 text-sm text-muted-foreground text-center", children: "Sin resultados" }) : filteredServices.map((svc) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": `sales_new.service_result.${svc.codigo}`,
          className: "w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0",
          onClick: () => addService(svc),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm text-foreground truncate", children: svc.descripcion }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Código: ",
                svc.codigo
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-primary flex-shrink-0", children: [
              "$",
              svc.precio.toFixed(2)
            ] })
          ] })
        },
        svc.codigo
      )) })
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "sales_new.items.empty_state",
        className: "py-12 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm",
        children: "Busque y agregue productos o servicios a este documento"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/50 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Producto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Precio Unit." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28", children: "Cantidad" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Subtotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-10" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: items.map((item, idx) => {
          const price = sellingPrice(item.product);
          const subtotal = price * item.quantity;
          const tipo = item.tipo ?? "Producto";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              "data-ocid": `sales_new.item.${idx + 1}`,
              className: "border-b border-border last:border-0 hover:bg-muted/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${tipo === "Producto" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"}`,
                    children: tipo
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground text-sm", children: item.product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "PN: ",
                    item.product.partNumber
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 text-right tabular-nums font-semibold text-foreground", children: [
                  "$",
                  price.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `sales_new.item_decrease.${idx + 1}`,
                      className: "w-6 h-6 rounded bg-muted hover:bg-muted/70 text-foreground flex items-center justify-center transition-colors",
                      onClick: () => updateQty(idx, item.quantity - 1),
                      children: "–"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      "data-ocid": `sales_new.item_qty.${idx + 1}`,
                      type: "number",
                      min: 1,
                      className: "w-12 text-center text-sm bg-input border border-border rounded h-6 text-foreground",
                      value: item.quantity,
                      onChange: (e) => updateQty(
                        idx,
                        Number.parseInt(e.target.value, 10) || 1
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `sales_new.item_increase.${idx + 1}`,
                      className: "w-6 h-6 rounded bg-muted hover:bg-muted/70 text-foreground flex items-center justify-center transition-colors",
                      onClick: () => updateQty(idx, item.quantity + 1),
                      children: "+"
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 text-right tabular-nums font-semibold text-foreground", children: [
                  "$",
                  subtotal.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": `sales_new.item_remove.${idx + 1}`,
                    className: "text-muted-foreground hover:text-destructive transition-colors",
                    onClick: () => removeItem(idx),
                    "aria-label": "Eliminar línea",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                ) })
              ]
            },
            item.product.id.toString()
          );
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 border border-border rounded-lg px-4 py-2 flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          items.length,
          " ",
          items.length === 1 ? "línea" : "líneas"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Subtotal:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "text-base font-bold text-primary tabular-nums",
            "data-ocid": "sales_new.running_subtotal",
            children: [
              "$",
              runningSubtotal.toFixed(2)
            ]
          }
        )
      ] }) })
    ] })
  ] });
}
const IVA_OPTIONS = [0, 12, 15];
function ReviewStep({
  customer,
  items,
  docType,
  taxPercent,
  onTaxChange
}) {
  const subtotal = items.reduce(
    (sum, i) => sum + sellingPrice(i.product) * i.quantity,
    0
  );
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "sales_new.review.section", className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/30 rounded-lg p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-muted-foreground flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: customer.name }),
        customer.taxId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "RUC/CI: ",
          customer.taxId
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: docType === DocumentType.Proforma ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "warning", children: "Proforma" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Factura" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/50 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Producto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Cant." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Precio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Subtotal" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: items.map((item, idx) => {
        const price = sellingPrice(item.product);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            "data-ocid": `sales_new.review_item.${idx + 1}`,
            className: "border-b border-border last:border-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: item.product.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "PN: ",
                  item.product.partNumber
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-center text-muted-foreground", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 text-right tabular-nums", children: [
                "$",
                price.toFixed(2)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 text-right tabular-nums font-semibold text-foreground", children: [
                "$",
                (price * item.quantity).toFixed(2)
              ] })
            ]
          },
          item.product.id.toString()
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5",
        "data-ocid": "sales_new.totals.section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4", children: "Resumen de totales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "text-lg font-semibold tabular-nums text-foreground",
                  "data-ocid": "sales_new.subtotal_amount",
                  children: [
                    "$",
                    subtotal.toFixed(2)
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "IVA" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "flex gap-1.5",
                    "data-ocid": "sales_new.tax_percent.section",
                    children: IVA_OPTIONS.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `sales_new.tax_option.${v}`,
                        onClick: () => onTaxChange(v),
                        className: `px-2.5 py-1 rounded-md text-xs font-bold transition-smooth ${taxPercent === v ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}`,
                        children: [
                          v,
                          "%"
                        ]
                      },
                      v
                    ))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "text-lg font-semibold tabular-nums text-foreground",
                  "data-ocid": "sales_new.tax_amount",
                  children: [
                    "$",
                    taxAmount.toFixed(2)
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t-2 border-primary/30 pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-bold text-foreground", children: "TOTAL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "text-3xl font-bold tabular-nums text-primary",
                  "data-ocid": "sales_new.total_amount",
                  children: [
                    "$",
                    total.toFixed(2)
                  ]
                }
              )
            ] }) })
          ] })
        ]
      }
    )
  ] });
}
function SalesNewPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/sales/new" });
  function resolveDocType(v) {
    if (typeof v === "string") return v;
    if (v && typeof v === "object")
      return Object.keys(v)[0] ?? "Proforma";
    return "Proforma";
  }
  const initialType = (search == null ? void 0 : search.type) === "invoice" ? DocumentType.Invoice : DocumentType.Proforma;
  const [docType, setDocType] = reactExports.useState(initialType);
  const [step, setStep] = reactExports.useState(0);
  const [customer, setCustomer] = reactExports.useState(null);
  const [items, setItems] = reactExports.useState([]);
  const [taxPercent, setTaxPercent] = reactExports.useState(12);
  const createProforma = useCreateProforma();
  const createInvoice = useCreateInvoice();
  const isSubmitting = createProforma.isPending || createInvoice.isPending;
  function canProceed() {
    if (step === 0) return !!customer;
    if (step === 1) return items.length > 0;
    return true;
  }
  function handleNext() {
    if (step < 2) setStep((s) => s + 1);
  }
  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }
  function handleSubmit() {
    if (!customer || items.length === 0) return;
    const salesItems = items.map((li) => ({
      productId: li.product.id,
      partNumber: li.product.partNumber,
      name: li.product.name,
      quantity: BigInt(li.quantity),
      unitPrice: sellingPrice(li.product)
    }));
    const input = {
      customerId: customer.id,
      items: salesItems,
      taxPercent,
      docType
    };
    const mutate = resolveDocType(docType) === DocumentType.Proforma ? createProforma : createInvoice;
    mutate.mutate(input, {
      onSuccess: (doc) => {
        ue.success(
          `${docType === DocumentType.Proforma ? "Proforma" : "Factura"} ${doc.documentNumber} creada correctamente`
        );
        navigate({ to: "/sales", search: { documentId: doc.id.toString() } });
      },
      onError: () => ue.error("Error al crear el documento")
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "sales_new.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: "Nuevo Documento",
        subtitle: resolveDocType(docType) === DocumentType.Proforma ? "Crear proforma" : "Crear factura",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "sales_new.type_proforma.toggle",
              className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${resolveDocType(docType) === DocumentType.Proforma ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`,
              onClick: () => setDocType(DocumentType.Proforma),
              children: "Proforma"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "sales_new.type_invoice.toggle",
              className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${resolveDocType(docType) === DocumentType.Invoice ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`,
              onClick: () => setDocType(DocumentType.Invoice),
              children: "Factura"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { current: step }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-6 shadow-subtle", children: [
        step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerStep, { selected: customer, onSelect: setCustomer }),
        step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(ProductsStep, { items, onChange: setItems }),
        step === 2 && customer && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReviewStep,
          {
            customer,
            items,
            docType,
            taxPercent,
            onTaxChange: setTaxPercent
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            "data-ocid": "sales_new.back_button",
            onClick: step === 0 ? () => navigate({
              to: "/sales",
              search: { documentId: void 0 }
            }) : handleBack,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }),
              step === 0 ? "Cancelar" : "Anterior"
            ]
          }
        ),
        step < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            "data-ocid": "sales_new.next_button",
            onClick: handleNext,
            disabled: !canProceed(),
            children: [
              "Siguiente",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            size: "lg",
            "data-ocid": "sales_new.submit_button",
            onClick: handleSubmit,
            disabled: isSubmitting || !customer || items.length === 0,
            className: "px-8 font-semibold",
            children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 mr-2" }),
              resolveDocType(docType) === DocumentType.Proforma ? "Guardar Proforma" : "Registrar Venta"
            ]
          }
        )
      ] })
    ] })
  ] });
}
export {
  SalesNewPage as default
};
