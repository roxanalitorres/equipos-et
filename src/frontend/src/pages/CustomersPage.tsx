import PageHeader from "@/components/shared/PageHeader";
import Table from "@/components/shared/Table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useCreateCustomer, useListCustomers } from "../hooks/useBackend";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  nombre: string;
  rucCedula: string;
  telefono: string;
  email: string;
  direccion: string;
}

interface CustomerForm {
  nombre: string;
  rucCedula: string;
  telefono: string;
  email: string;
  direccion: string;
}

// ─── Sample data ───────────────────────────────────────────────────────────────

const EMPTY_FORM: CustomerForm = {
  nombre: "",
  rucCedula: "",
  telefono: "",
  email: "",
  direccion: "",
};

// ─── Customer Modal ─────────────────────────────────────────────────────────────

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: CustomerForm) => void;
}

function CustomerModal({ open, onClose, onSave }: CustomerModalProps) {
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [touched, setTouched] = useState(false);

  function handleChange(field: keyof CustomerForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!form.nombre.trim()) return;
    onSave(form);
    setForm(EMPTY_FORM);
    setTouched(false);
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setTouched(false);
    onClose();
  }

  const nombreError = touched && !form.nombre.trim();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent data-ocid="customer.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Nuevo cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="c-nombre">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="c-nombre"
              data-ocid="customer.nombre.input"
              placeholder="Nombre completo o razón social"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className={nombreError ? "border-destructive" : ""}
            />
            {nombreError && (
              <p
                data-ocid="customer.nombre.field_error"
                className="text-xs text-destructive"
              >
                El nombre es requerido
              </p>
            )}
          </div>

          {/* RUC / Cédula */}
          <div className="space-y-1.5">
            <Label htmlFor="c-ruc">RUC / Cédula</Label>
            <Input
              id="c-ruc"
              data-ocid="customer.ruc.input"
              placeholder="0000000000001"
              value={form.rucCedula}
              onChange={(e) => handleChange("rucCedula", e.target.value)}
            />
          </div>

          {/* Teléfono + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-telefono">Teléfono</Label>
              <Input
                id="c-telefono"
                data-ocid="customer.telefono.input"
                placeholder="0999000000"
                value={form.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Correo</Label>
              <Input
                id="c-email"
                data-ocid="customer.email.input"
                type="email"
                placeholder="correo@empresa.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-1.5">
            <Label htmlFor="c-direccion">Dirección</Label>
            <Input
              id="c-direccion"
              data-ocid="customer.direccion.input"
              placeholder="Calle, sector o referencia"
              value={form.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="customer.cancel_button"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button type="submit" data-ocid="customer.submit_button">
              Crear cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Customers Page ─────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const { data: backendCustomers = [], isLoading } = useListCustomers();
  const createCustomer = useCreateCustomer();

  const customers: Customer[] = backendCustomers.map((c) => ({
    id: String(c.id),
    nombre: c.name,
    rucCedula: c.taxId ?? "",
    telefono: c.phone ?? "",
    email: c.email ?? "",
    direccion: "",
  }));

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.rucCedula.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  async function handleSave(form: CustomerForm) {
    await createCustomer.mutateAsync({
      name: form.nombre,
      taxId: form.rucCedula || undefined,
      phone: form.telefono || undefined,
      email: form.email || undefined,
    });
    setModalOpen(false);
  }

  return (
    <div
      data-ocid="customers.page"
      className="flex flex-col min-h-[calc(100vh-4rem)]"
    >
      <PageHeader
        title="Clientes"
        subtitle={`${customers.length} ${
          customers.length === 1 ? "cliente registrado" : "clientes registrados"
        }${isLoading ? " (cargando...)" : ""}`}
        actions={
          <Button
            type="button"
            size="sm"
            data-ocid="customers.add.primary_button"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nuevo cliente
          </Button>
        }
      />

      <div className="flex-1 p-6 bg-background space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="customers.search_input"
            placeholder="Buscar por nombre, RUC, teléfono o correo…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table<Customer>
            columns={[
              {
                key: "nombre",
                header: "Nombre",
                render: (row) => (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-xs">
                      {row.nombre[0]?.toUpperCase() ?? (
                        <Users className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="font-medium text-foreground truncate">
                      {row.nombre}
                    </span>
                  </div>
                ),
              },
              {
                key: "rucCedula",
                header: "RUC / Cédula",
                render: (row) =>
                  row.rucCedula ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {row.rucCedula}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  ),
              },
              {
                key: "telefono",
                header: "Teléfono",
                render: (row) => (
                  <span className="text-sm">
                    {row.telefono || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>
                ),
              },
              {
                key: "email",
                header: "Email",
                render: (row) =>
                  row.email ? (
                    <a
                      href={`mailto:${row.email}`}
                      className="text-sm text-primary hover:underline truncate block max-w-[220px]"
                    >
                      {row.email}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  ),
              },
            ]}
            data={filtered}
            rowKey={(row) => row.id}
            ocidPrefix="customers"
            emptyMessage={
              search
                ? `No hay clientes que coincidan con "${search}"`
                : "Aún no hay clientes registrados."
            }
          />
        </div>
      </div>

      {/* New customer modal */}
      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
