import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Package,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Badge, { StatusBadge, DocTypeBadge } from "../components/shared/Badge";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import PageHeader from "../components/shared/PageHeader";
import { useDashboardStats, useLowStockItems } from "../hooks/useBackend";
import { useCallerProfile } from "../hooks/useBackend";
import { DocumentStatus, DocumentType } from "../types";
import type { SalesDocument } from "../types";

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;
  ocid?: string;
}

import type React from "react";

function SummaryCard({
  label,
  value,
  sub,
  icon,
  accent,
  ocid,
}: SummaryCardProps) {
  return (
    <div
      data-ocid={ocid}
      className={`bg-card border rounded-lg px-5 py-4 shadow-subtle ${
        accent ? "border-accent/40" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          <p
            className={`text-3xl font-display font-bold leading-tight ${
              accent ? "text-accent" : "text-foreground"
            }`}
          >
            {value}
          </p>
          {sub && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {sub}
            </p>
          )}
        </div>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            accent
              ? "bg-accent/10 text-accent"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Recent document row ──────────────────────────────────────────────────────

function RecentDocRow({ doc, index }: { doc: SalesDocument; index: number }) {
  const date = new Date(Number(doc.createdAt) / 1_000_000).toLocaleDateString(
    "es-EC",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
  return (
    <tr
      data-ocid={`dashboard.recent_docs.item.${index + 1}`}
      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors even:bg-muted/10"
    >
      <td className="px-3 py-2.5">
        <span className="font-mono text-xs text-foreground">
          {doc.documentNumber}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <DocTypeBadge docType={doc.docType} />
      </td>
      <td className="px-3 py-2.5">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">
        ${doc.total.toFixed(2)}
      </td>
      <td className="px-3 py-2.5 text-muted-foreground text-xs">{date}</td>
      <td className="px-3 py-2.5 text-right">
        <Link
          to="/sales"
          search={{ documentId: undefined }}
          data-ocid={`dashboard.recent_docs.view.${index + 1}`}
          className="text-primary text-xs hover:underline"
        >
          Ver
        </Link>
      </td>
    </tr>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: profile } = useCallerProfile();
  const {
    totalProducts,
    lowStockCount,
    proformaCount,
    invoiceCount,
    recentDocuments,
    isLoading,
  } = useDashboardStats();
  const { data: lowStockItems = [] } = useLowStockItems();

  const greeting = profile?.name
    ? `Bienvenido, ${profile.name.split(" ")[0]}`
    : "Panel de Control";

  return (
    <div data-ocid="dashboard.page">
      <PageHeader
        title={greeting}
        subtitle="Resumen general del sistema de inventario y ventas"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="dashboard.refresh.button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Actualizar
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" label="Cargando estadísticas..." />
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Summary cards */}
          <section data-ocid="dashboard.summary.section">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                ocid="dashboard.total_products.card"
                label="Total Productos"
                value={totalProducts}
                sub="en catálogo"
                icon={<Package className="w-4 h-4" />}
              />
              <SummaryCard
                ocid="dashboard.low_stock.card"
                label="Bajo Stock"
                value={lowStockCount}
                sub="artículos por reabastecer"
                icon={<AlertTriangle className="w-4 h-4" />}
                accent={lowStockCount > 0}
              />
              <SummaryCard
                ocid="dashboard.proformas.card"
                label="Proformas"
                value={proformaCount}
                sub="activas"
                icon={<FileText className="w-4 h-4" />}
              />
              <SummaryCard
                ocid="dashboard.invoices.card"
                label="Facturas"
                value={invoiceCount}
                sub="confirmadas"
                icon={<TrendingUp className="w-4 h-4" />}
              />
            </div>
          </section>

          {/* Two-column row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent documents */}
            <section
              data-ocid="dashboard.recent_docs.section"
              className="lg:col-span-2 bg-card border border-border rounded-lg shadow-subtle overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-display font-semibold text-sm text-foreground">
                  Documentos Recientes
                </h2>
                <Link
                  to="/sales"
                  search={{ documentId: undefined }}
                  data-ocid="dashboard.view_all_sales.link"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                {recentDocuments.length === 0 ? (
                  <div
                    data-ocid="dashboard.recent_docs.empty_state"
                    className="py-10 text-center text-muted-foreground text-sm"
                  >
                    No hay documentos registrados aún.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-xs uppercase text-muted-foreground font-semibold tracking-wide">
                        <th className="px-3 py-2.5 text-left">N° Doc.</th>
                        <th className="px-3 py-2.5 text-left">Tipo</th>
                        <th className="px-3 py-2.5 text-left">Estado</th>
                        <th className="px-3 py-2.5 text-right">Total</th>
                        <th className="px-3 py-2.5 text-left">Fecha</th>
                        <th className="px-3 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {recentDocuments.map((doc, i) => (
                        <RecentDocRow
                          key={doc.id.toString()}
                          doc={doc}
                          index={i}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* Low stock alerts */}
            <section
              data-ocid="dashboard.low_stock.section"
              className="bg-card border border-border rounded-lg shadow-subtle overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                  Alertas de Stock
                </h2>
                <Link
                  to="/inventory"
                  data-ocid="dashboard.view_inventory.link"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Inventario <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {lowStockItems.length === 0 ? (
                <div
                  data-ocid="dashboard.low_stock.empty_state"
                  className="py-8 text-center text-sm text-muted-foreground px-4"
                >
                  <span className="text-2xl block mb-2">✓</span>
                  Todo el stock está en niveles normales.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {lowStockItems.slice(0, 8).map((item, i) => (
                    <li
                      key={`${item.productId}-${item.branch}`}
                      data-ocid={`dashboard.low_stock.item.${i + 1}`}
                      className="px-4 py-2.5 flex items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {item.partNumber}
                        </p>
                        <p className="text-sm text-foreground truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.branch === "Puyo" ? "Puyo" : "El Topo"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          Number(item.quantity) === 0 ? "danger" : "warning"
                        }
                      >
                        {Number(item.quantity)} / {Number(item.minStockAlert)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Quick actions */}
          <section data-ocid="dashboard.quick_actions.section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Acciones Rápidas
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="dashboard.new_proforma.button"
                asChild
              >
                <Link to="/sales/new" search={{ type: "proforma" }}>
                  Nueva Proforma
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="dashboard.new_invoice.button"
                asChild
              >
                <Link to="/sales/new" search={{ type: "invoice" }}>
                  Nueva Factura
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="dashboard.products.button"
                asChild
              >
                <Link to="/products">Ver Productos</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="dashboard.inventory.button"
                asChild
              >
                <Link to="/inventory">Ver Inventario</Link>
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
