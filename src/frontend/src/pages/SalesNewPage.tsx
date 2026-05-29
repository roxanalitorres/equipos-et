import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import Badge from "../components/shared/Badge";
import PageHeader from "../components/shared/PageHeader";
import {
  useCreateCustomer,
  useCreateInvoice,
  useCreateProforma,
  useListCustomers,
  useListServices,
  useSearchProducts,
} from "../hooks/useBackend";
import { DocumentType } from "../types";
import type {
  Customer,
  CustomerInput,
  Product,
  SalesItemInput,
} from "../types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  product: Product;
  quantity: number;
  tipo?: "Producto" | "Servicio";
}

// ─── Step Indicator ────────────────────────────────────────────────────────────

const STEPS = ["Cliente", "Productos", "Revisión"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8" data-ocid="sales_new.steps">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-smooth ${
                i < current
                  ? "bg-primary text-primary-foreground"
                  : i === current
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                i === current ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-3 mb-4 transition-smooth ${
                i < current ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Step 1: Customer ──────────────────────────────────────────────────────────

function CustomerStep({
  selected,
  onSelect,
}: {
  selected: Customer | null;
  onSelect: (c: Customer) => void;
}) {
  const [mode, setMode] = useState<"search" | "new">("search");
  const [q, setQ] = useState("");
  const { data: customers = [], isLoading } = useListCustomers();
  const createCustomer = useCreateCustomer();
  const [form, setForm] = useState<CustomerInput>({
    name: "",
    taxId: "",
    email: "",
    phone: "",
  });

  const filtered = q.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          (c.taxId?.toLowerCase().includes(q.toLowerCase()) ?? false),
      )
    : customers;

  function handleCreate() {
    if (!form.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    createCustomer.mutate(
      {
        name: form.name,
        taxId: form.taxId || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
      },
      {
        onSuccess: (c) => {
          onSelect(c);
          toast.success("Cliente creado");
        },
        onError: () => toast.error("Error al crear cliente"),
      },
    );
  }

  return (
    <div data-ocid="sales_new.customer.section">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          data-ocid="sales_new.customer_search.tab"
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            mode === "search"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setMode("search")}
        >
          Buscar cliente existente
        </button>
        <button
          type="button"
          data-ocid="sales_new.customer_new.tab"
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            mode === "new"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setMode("new")}
        >
          Nuevo cliente
        </button>
      </div>

      {mode === "search" ? (
        <div>
          <div className="flex items-center gap-2 bg-input rounded-md px-3 h-9 mb-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              data-ocid="sales_new.customer.search_input"
              type="text"
              placeholder="Buscar por nombre o RUC/cédula..."
              className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="border border-border rounded-lg overflow-hidden max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Sin resultados
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id.toString()}
                  type="button"
                  data-ocid={`sales_new.customer.item.${c.id.toString()}`}
                  onClick={() => onSelect(c)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
                    selected?.id === c.id ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.taxId ? `RUC/CI: ${c.taxId}` : "Sin RUC/CI"}
                      {c.phone ? ` · ${c.phone}` : ""}
                    </p>
                  </div>
                  {selected?.id === c.id && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="c-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="c-name"
              data-ocid="sales_new.customer.name.input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Razón social o nombre completo"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="c-taxid">RUC / Cédula</Label>
            <Input
              id="c-taxid"
              data-ocid="sales_new.customer.taxid.input"
              value={form.taxId ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, taxId: e.target.value }))
              }
              placeholder="0912345678001"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              data-ocid="sales_new.customer.email.input"
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="cliente@ejemplo.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="c-phone">Teléfono</Label>
            <Input
              id="c-phone"
              data-ocid="sales_new.customer.phone.input"
              value={form.phone ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="0999123456"
              className="mt-1"
            />
          </div>
          <Button
            type="button"
            data-ocid="sales_new.customer.create_button"
            onClick={handleCreate}
            disabled={createCustomer.isPending || !form.name.trim()}
            size="sm"
          >
            {createCustomer.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            Crear cliente
          </Button>
        </div>
      )}

      {selected && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Check className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {selected.name}
            </p>
            {selected.taxId && (
              <p className="text-xs text-muted-foreground">
                RUC/CI: {selected.taxId}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Products ──────────────────────────────────────────────────────────

const sellingPrice = (p: Product) => p.costPrice * (1 + p.marginPercent / 100);

function ProductsStep({
  items,
  onChange,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"productos" | "servicios">(
    "productos",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: results = [], isFetching } = useSearchProducts(searchTerm);
  const { data: catalogServices = [] } = useListServices();

  function addProduct(p: Product) {
    const existing = items.find((i) => i.product.id === p.id);
    if (existing) {
      onChange(
        items.map((i) =>
          i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      onChange([...items, { product: p, quantity: 1, tipo: "Producto" }]);
    }
    setSearchTerm("");
    setShowDropdown(false);
  }

  function addService(svc: {
    codigo: string;
    descripcion: string;
    precio: number;
  }) {
    const syntheticProduct = {
      id: svc.codigo,
      partNumber: svc.codigo,
      name: svc.descripcion,
      costPrice: svc.precio,
      marginPercent: 0,
    } as unknown as Product;

    const existing = items.find((i) => String(i.product.id) === svc.codigo);
    if (existing) {
      onChange(
        items.map((i) =>
          String(i.product.id) === svc.codigo
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      );
    } else {
      onChange([
        ...items,
        { product: syntheticProduct, quantity: 1, tipo: "Servicio" },
      ]);
    }
    setServiceSearchTerm("");
  }

  function updateQty(idx: number, qty: number) {
    if (qty < 1) return;
    onChange(
      items.map((item, i) => (i === idx ? { ...item, quantity: qty } : item)),
    );
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  const runningSubtotal = items.reduce(
    (sum, i) => sum + sellingPrice(i.product) * i.quantity,
    0,
  );

  const filteredServices = serviceSearchTerm.trim()
    ? catalogServices.filter(
        (s) =>
          s.codigo.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
          s.descripcion.toLowerCase().includes(serviceSearchTerm.toLowerCase()),
      )
    : catalogServices;

  return (
    <div data-ocid="sales_new.products.section">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          data-ocid="sales_new.products_tab"
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            activeTab === "productos"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("productos")}
        >
          Productos
        </button>
        <button
          type="button"
          data-ocid="sales_new.services_tab"
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            activeTab === "servicios"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("servicios")}
        >
          Servicios
        </button>
      </div>

      {activeTab === "productos" ? (
        <>
          {/* Product search */}
          <div className="relative mb-4">
            <div className="flex items-center gap-2 bg-input border border-border rounded-md px-3 h-10">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                data-ocid="sales_new.products.search_input"
                type="text"
                placeholder="Buscar por número de parte o nombre..."
                className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {isFetching && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {showDropdown && searchTerm.length > 1 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 border border-border bg-card rounded-lg shadow-elevated max-h-64 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground text-center">
                    Sin resultados
                  </p>
                ) : (
                  results.map((p) => (
                    <button
                      key={p.id.toString()}
                      type="button"
                      data-ocid={`sales_new.product_result.${p.id.toString()}`}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                      onClick={() => addProduct(p)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PN: {p.partNumber}
                            {p.description ? ` · ${p.description}` : ""}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary flex-shrink-0">
                          ${sellingPrice(p).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Service search */}
          <div className="relative mb-4">
            <div className="flex items-center gap-2 bg-input border border-border rounded-md px-3 h-10">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                data-ocid="sales_new.services.search_input"
                type="text"
                placeholder="Buscar por código o descripción..."
                className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Service list */}
          <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto mb-4">
            {filteredServices.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground text-center">
                Sin resultados
              </p>
            ) : (
              filteredServices.map((svc) => (
                <button
                  key={svc.codigo}
                  type="button"
                  data-ocid={`sales_new.service_result.${svc.codigo}`}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  onClick={() => addService(svc)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {svc.descripcion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código: {svc.codigo}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary flex-shrink-0">
                      ${svc.precio.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Line items */}
      {items.length === 0 ? (
        <div
          data-ocid="sales_new.items.empty_state"
          className="py-12 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm"
        >
          Busque y agregue productos o servicios a este documento
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Producto
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Precio Unit.
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                    Cantidad
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Subtotal
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const price = sellingPrice(item.product);
                  const subtotal = price * item.quantity;
                  const tipo = item.tipo ?? "Producto";
                  return (
                    <tr
                      key={item.product.id.toString()}
                      data-ocid={`sales_new.item.${idx + 1}`}
                      className="border-b border-border last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tipo === "Producto"
                              ? "bg-primary/10 text-primary"
                              : "bg-accent/20 text-accent-foreground"
                          }`}
                        >
                          {tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-foreground text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PN: {item.product.partNumber}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-foreground">
                        ${price.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            data-ocid={`sales_new.item_decrease.${idx + 1}`}
                            className="w-6 h-6 rounded bg-muted hover:bg-muted/70 text-foreground flex items-center justify-center transition-colors"
                            onClick={() => updateQty(idx, item.quantity - 1)}
                          >
                            –
                          </button>
                          <input
                            data-ocid={`sales_new.item_qty.${idx + 1}`}
                            type="number"
                            min={1}
                            className="w-12 text-center text-sm bg-input border border-border rounded h-6 text-foreground"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQty(
                                idx,
                                Number.parseInt(e.target.value, 10) || 1,
                              )
                            }
                          />
                          <button
                            type="button"
                            data-ocid={`sales_new.item_increase.${idx + 1}`}
                            className="w-6 h-6 rounded bg-muted hover:bg-muted/70 text-foreground flex items-center justify-center transition-colors"
                            onClick={() => updateQty(idx, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-foreground">
                        ${subtotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          data-ocid={`sales_new.item_remove.${idx + 1}`}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => removeItem(idx)}
                          aria-label="Eliminar línea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Running subtotal */}
          <div className="mt-3 flex justify-end">
            <div className="bg-muted/40 border border-border rounded-lg px-4 py-2 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "línea" : "líneas"}
              </span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span
                className="text-base font-bold text-primary tabular-nums"
                data-ocid="sales_new.running_subtotal"
              >
                ${runningSubtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 3: Review ────────────────────────────────────────────────────────────

const IVA_OPTIONS = [0, 12, 15];

function ReviewStep({
  customer,
  items,
  docType,
  taxPercent,
  onTaxChange,
}: {
  customer: Customer;
  items: LineItem[];
  docType: DocumentType;
  taxPercent: number;
  onTaxChange: (v: number) => void;
}) {
  const subtotal = items.reduce(
    (sum, i) => sum + sellingPrice(i.product) * i.quantity,
    0,
  );
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  return (
    <div data-ocid="sales_new.review.section" className="space-y-5">
      {/* Customer summary */}
      <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
        <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {customer.name}
          </p>
          {customer.taxId && (
            <p className="text-xs text-muted-foreground">
              RUC/CI: {customer.taxId}
            </p>
          )}
        </div>
        <div className="ml-auto">
          {docType === DocumentType.Proforma ? (
            <Badge variant="warning">Proforma</Badge>
          ) : (
            <Badge variant="success">Factura</Badge>
          )}
        </div>
      </div>

      {/* Items summary */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Producto
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cant.
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Precio
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const price = sellingPrice(item.product);
              return (
                <tr
                  key={item.product.id.toString()}
                  data-ocid={`sales_new.review_item.${idx + 1}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-foreground">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PN: {item.product.partNumber}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    ${price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-foreground">
                    ${(price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals — prominent, large, easy to read */}
      <div
        className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5"
        data-ocid="sales_new.totals.section"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Resumen de totales
        </p>

        <div className="space-y-3">
          {/* Subtotal row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Subtotal
            </span>
            <span
              className="text-lg font-semibold tabular-nums text-foreground"
              data-ocid="sales_new.subtotal_amount"
            >
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {/* IVA row with selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                IVA
              </span>
              <div
                className="flex gap-1.5"
                data-ocid="sales_new.tax_percent.section"
              >
                {IVA_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    data-ocid={`sales_new.tax_option.${v}`}
                    onClick={() => onTaxChange(v)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-smooth ${
                      taxPercent === v
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>
            <span
              className="text-lg font-semibold tabular-nums text-foreground"
              data-ocid="sales_new.tax_amount"
            >
              ${taxAmount.toFixed(2)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-primary/30 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">TOTAL</span>
              <span
                className="text-3xl font-bold tabular-nums text-primary"
                data-ocid="sales_new.total_amount"
              >
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SalesNewPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/sales/new" as never }) as {
    type?: string;
  };
  // Resolve Candid variant objects to string enum values before comparing
  function resolveDocType(v: unknown): string {
    if (typeof v === "string") return v;
    if (v && typeof v === "object")
      return Object.keys(v as Record<string, unknown>)[0] ?? "Proforma";
    return "Proforma";
  }
  const initialType =
    search?.type === "invoice" ? DocumentType.Invoice : DocumentType.Proforma;

  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(12);
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

    const salesItems: SalesItemInput[] = items.map((li) => ({
      productId: li.product.id,
      partNumber: li.product.partNumber,
      name: li.product.name,
      quantity: BigInt(li.quantity),
      unitPrice: sellingPrice(li.product),
    }));

    const input = {
      customerId: customer.id,
      items: salesItems,
      taxPercent,
      docType,
    };

    const mutate =
      resolveDocType(docType) === DocumentType.Proforma
        ? createProforma
        : createInvoice;

    mutate.mutate(input, {
      onSuccess: (doc) => {
        toast.success(
          `${
            docType === DocumentType.Proforma ? "Proforma" : "Factura"
          } ${doc.documentNumber} creada correctamente`,
        );
        // Navigate directly to sales list with the new document auto-opened
        navigate({ to: "/sales", search: { documentId: doc.id.toString() } });
      },
      onError: () => toast.error("Error al crear el documento"),
    });
  }

  return (
    <div data-ocid="sales_new.page">
      <PageHeader
        title="Nuevo Documento"
        subtitle={
          resolveDocType(docType) === DocumentType.Proforma
            ? "Crear proforma"
            : "Crear factura"
        }
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="sales_new.type_proforma.toggle"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                resolveDocType(docType) === DocumentType.Proforma
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setDocType(DocumentType.Proforma)}
            >
              Proforma
            </button>
            <button
              type="button"
              data-ocid="sales_new.type_invoice.toggle"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                resolveDocType(docType) === DocumentType.Invoice
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setDocType(DocumentType.Invoice)}
            >
              Factura
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl mx-auto">
        <StepIndicator current={step} />

        <div className="bg-card border border-border rounded-xl p-6 shadow-subtle">
          {step === 0 && (
            <CustomerStep selected={customer} onSelect={setCustomer} />
          )}
          {step === 1 && <ProductsStep items={items} onChange={setItems} />}
          {step === 2 && customer && (
            <ReviewStep
              customer={customer}
              items={items}
              docType={docType}
              taxPercent={taxPercent}
              onTaxChange={setTaxPercent}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          <Button
            type="button"
            variant="outline"
            data-ocid="sales_new.back_button"
            onClick={
              step === 0
                ? () =>
                    navigate({
                      to: "/sales",
                      search: { documentId: undefined },
                    })
                : handleBack
            }
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {step === 0 ? "Cancelar" : "Anterior"}
          </Button>

          {step < 2 ? (
            <Button
              type="button"
              data-ocid="sales_new.next_button"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              data-ocid="sales_new.submit_button"
              onClick={handleSubmit}
              disabled={isSubmitting || !customer || items.length === 0}
              className="px-8 font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {resolveDocType(docType) === DocumentType.Proforma
                ? "Guardar Proforma"
                : "Registrar Venta"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
