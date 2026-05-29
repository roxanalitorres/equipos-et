import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import React from "react";
import { useListCustomers } from "../hooks/useBackend";
import type { SalesDocument } from "../types";
import { DocumentStatus, DocumentType } from "../types";
import { DocTypeBadge, StatusBadge } from "./shared/Badge";

interface Props {
  document: SalesDocument;
  onClose: () => void;
}

function formatDate(ts: bigint | null | undefined) {
  if (ts == null) return "—";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function SalesDocumentDetail({ document, onClose }: Props) {
  const { data: customers = [] } = useListCustomers();
  const customer = customers.find((c) => c.id === document.customerId);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Normalise Candid variant objects to string enum values before comparing
  function resolveVariantKey(v: unknown): string {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object")
      return Object.keys(v as Record<string, unknown>)[0] ?? "";
    return "";
  }
  const resolvedStatus = resolveVariantKey(document.status);
  const resolvedDocType = resolveVariantKey(document.docType);

  const statusLabel =
    resolvedStatus === DocumentStatus.Draft
      ? "Borrador"
      : resolvedStatus === DocumentStatus.Confirmed
        ? "Confirmado"
        : resolvedStatus === DocumentStatus.Converted
          ? "Convertido"
          : "Cancelado";

  return (
    <>
      {/* Print styles — injected via a style tag so they apply globally on window.print() */}
      <style>{`
        @media print {
          /* ── Page setup ── */
          @page {
            size: A4 portrait;
            margin: 2cm 2cm;
          }

          /* Hide absolutely everything on the page */
          html, body { margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }

          /* Show only the printable panel and all its children */
          #sales-doc-printable,
          #sales-doc-printable * { visibility: visible !important; }

          #sales-doc-printable {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #fff !important;
            color: #111 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          /* Hide UI chrome inside the printable area */
          .print-hide { display: none !important; visibility: hidden !important; }

          /* ── Company header ── */
          .print-company-name {
            font-size: 20pt !important;
            font-weight: 900 !important;
            color: #000 !important;
            letter-spacing: -0.5pt !important;
          }
          .print-company-sub {
            font-size: 10pt !important;
            color: #555 !important;
            margin-top: 2pt !important;
          }
          .print-company-addr {
            font-size: 9pt !important;
            color: #777 !important;
          }

          /* ── Document type & number ── */
          .print-doc-type {
            font-size: 16pt !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            color: #000 !important;
            letter-spacing: 1pt !important;
          }
          .print-doc-number {
            font-size: 13pt !important;
            font-weight: 700 !important;
            color: #222 !important;
          }

          /* ── Dividers ── */
          .print-divider {
            border-top: 2px solid #000 !important;
            margin: 10pt 0 !important;
          }

          /* ── Customer / date section ── */
          .print-section-title {
            font-size: 8pt !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 1pt !important;
            color: #555 !important;
            margin-bottom: 4pt !important;
          }

          /* ── Items table ── */
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 10pt !important;
          }
          .print-table thead tr {
            border-bottom: 2px solid #000 !important;
          }
          .print-table th {
            font-size: 9pt !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #333 !important;
            padding: 5pt 6pt !important;
            background: none !important;
          }
          .print-table td {
            font-size: 10pt !important;
            color: #111 !important;
            padding: 5pt 6pt !important;
            border-bottom: 1px solid #ddd !important;
          }
          .print-table tbody tr:last-child td {
            border-bottom: 2px solid #000 !important;
          }

          /* ── Totals ── */
          .print-totals-box {
            width: 220pt !important;
            margin-left: auto !important;
            margin-top: 12pt !important;
          }
          .print-totals-row td {
            font-size: 10pt !important;
            padding: 4pt 6pt !important;
            border: none !important;
          }
          .print-totals-divider td {
            border-top: 2px solid #000 !important;
            padding-top: 6pt !important;
          }
          .print-total-label {
            font-size: 13pt !important;
            font-weight: 800 !important;
            color: #000 !important;
          }
          .print-total-final {
            font-size: 16pt !important;
            font-weight: 900 !important;
            color: #000 !important;
            text-align: right !important;
          }

          /* ── Footer ── */
          .print-footer {
            margin-top: 20pt !important;
            padding-top: 8pt !important;
            border-top: 1px solid #ccc !important;
            text-align: center !important;
            font-size: 9pt !important;
            color: #777 !important;
          }
        }
      `}</style>

      <dialog
        open
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 max-w-none w-full h-full m-0"
        data-ocid="sales.document_detail.dialog"
        onClose={onClose}
      >
        {/* Backdrop — hidden on print */}
        <div
          role="button"
          tabIndex={0}
          className="absolute inset-0 bg-foreground/40 print-hide"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          aria-label="Cerrar"
        />

        {/* Modal panel */}
        <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-elevated flex flex-col max-h-[92vh] print:shadow-none print:border-0 print:max-h-none print:rounded-none">
          {/* Screen-only header bar */}
          <div className="print-hide flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-foreground text-base">
                {document.documentNumber}
              </span>
              <DocTypeBadge docType={document.docType} />
              <StatusBadge status={document.status} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="sales.document_detail.print_button"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Imprimir
              </Button>
              <button
                type="button"
                data-ocid="sales.document_detail.close_button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable document body */}
          <div
            id="sales-doc-printable"
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5 print:overflow-visible print:px-0 print:py-0"
          >
            {/* Company header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground leading-tight print-company-name">
                  Equipos ET
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5 print-company-sub">
                  Repuestos y Mantenimiento de Maquinaria Pesada
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 print-company-addr">
                  Puyo, Pastaza · Ecuador
                </p>
                <p className="text-xs text-muted-foreground print-company-addr">
                  Tel: +593 3 288 XXXX
                </p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg text-foreground mt-0.5 print-doc-type">
                  {resolvedDocType === DocumentType.Proforma
                    ? "PROFORMA"
                    : "FACTURA"}
                </p>
                <p className="font-display font-bold text-xl text-primary print-doc-number">
                  #{document.documentNumber}
                </p>
                <div className="mt-1 flex gap-2 justify-end print-hide">
                  <DocTypeBadge docType={document.docType} />
                  <StatusBadge status={document.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estado: {statusLabel}
                </p>
              </div>
            </div>

            <hr className="border-border print-divider" />

            {/* Customer + date metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide print-section-title">
                  Cliente
                </p>
                {customer ? (
                  <>
                    <p className="font-semibold text-foreground">
                      {customer.name}
                    </p>
                    {customer.taxId && (
                      <p className="text-muted-foreground">
                        RUC/CI: {customer.taxId}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="text-muted-foreground">{customer.phone}</p>
                    )}
                    {customer.email && (
                      <p className="text-muted-foreground">{customer.email}</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Cliente #
                    {document.customerId != null
                      ? document.customerId.toString()
                      : "—"}
                  </p>
                )}
              </div>

              <div className="space-y-1 text-right">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide print-section-title">
                  Detalles
                </p>
                <p className="text-muted-foreground">
                  Fecha:{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(document.createdAt)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Estado:{" "}
                  <span className="font-medium text-foreground">
                    {statusLabel}
                  </span>
                </p>
                {document.convertedToInvoiceId && (
                  <p className="text-muted-foreground text-xs">
                    Factura: FAC-
                    {document.convertedToInvoiceId.toString().padStart(4, "0")}
                  </p>
                )}
              </div>
            </div>

            <hr className="border-border print-divider" />

            {/* Line items table */}
            <div>
              <table className="w-full text-sm border-collapse print-table">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="pb-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Descripción
                    </th>
                    <th className="pb-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      N° Parte
                    </th>
                    <th className="pb-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Cantidad
                    </th>
                    <th className="pb-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Precio Unit.
                    </th>
                    <th className="pb-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, idx) => (
                    <tr
                      key={`${item.productId.toString()}-${idx}`}
                      data-ocid={`sales.document_detail.item.${idx + 1}`}
                      className="border-b border-border"
                    >
                      <td className="py-2.5 text-foreground font-medium">
                        {item.name}
                      </td>
                      <td className="py-2.5 text-muted-foreground font-mono text-xs">
                        {item.partNumber}
                      </td>
                      <td className="py-2.5 text-center text-muted-foreground">
                        {Number(item.quantity)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-foreground">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-foreground">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals — visually prominent on screen, clean on print */}
            <div
              className="flex justify-end"
              data-ocid="sales.document_detail.totals.section"
            >
              <div className="w-64 rounded-xl border border-border bg-muted/30 overflow-hidden print-totals-box">
                {/* Subtotal */}
                <div className="flex justify-between items-center px-4 py-2.5 border-b border-border print-totals-row">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span
                    className="text-sm tabular-nums font-semibold text-foreground"
                    data-ocid="sales.document_detail.subtotal_amount"
                  >
                    {formatCurrency(document.subtotal)}
                  </span>
                </div>

                {/* IVA */}
                <div className="flex justify-between items-center px-4 py-2.5 border-b border-border print-totals-row">
                  <span className="text-sm text-muted-foreground">
                    IVA ({document.taxPercent}%)
                  </span>
                  <span
                    className="text-sm tabular-nums font-semibold text-foreground"
                    data-ocid="sales.document_detail.tax_amount"
                  >
                    {formatCurrency(document.taxAmount)}
                  </span>
                </div>

                {/* Total — large, bold, prominent */}
                <div className="flex justify-between items-center px-4 py-4 bg-primary/10 print-totals-divider">
                  <span className="text-base font-bold text-foreground print-total-label">
                    TOTAL
                  </span>
                  <span
                    className="text-2xl font-bold tabular-nums text-primary print-total-final"
                    data-ocid="sales.document_detail.total_amount"
                  >
                    {formatCurrency(document.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Document footer */}
            <div className="pt-4 mt-2 border-t border-border print-footer">
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold">
                  Gracias por su preferencia — Equipos ET
                </p>
                <p>Puyo, Pastaza · Ecuador · Tel: +593 3 288 XXXX</p>
                {resolvedDocType === DocumentType.Proforma && (
                  <p className="italic">
                    Este documento es una proforma y no constituye factura
                    fiscal.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
