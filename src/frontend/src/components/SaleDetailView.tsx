import { DocTypeBadge, StatusBadge } from "@/components/shared/Badge";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { DocumentStatus } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Ban, CheckCheck, FileDown, Pencil, Receipt, X } from "lucide-react";

export interface SaleDetailData {
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

interface SaleDetailViewProps {
  sale: SaleDetailData;
  onClose: () => void;
  onConvertToInvoice?: () => void;
  onEdit?: (sale: SaleDetailData) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SaleDetailView({
  sale,
  onClose,
  onConvertToInvoice,
  onEdit,
  onConfirm,
  onCancel,
}: SaleDetailViewProps) {
  function handleConfirm() {
    if (
      window.confirm(
        "¿Confirmar este documento? Esta acción no se puede deshacer.",
      )
    ) {
      onConfirm?.();
    }
  }

  function handleCancel() {
    if (
      window.confirm(
        "¿Cancelar este documento? Esta acción no se puede deshacer.",
      )
    ) {
      onCancel?.();
    }
  }

  function generatePDF() {
    const doc = new jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 18;

    // ── Header ──────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("EQUIPOS E.T", marginLeft, y);
    y += 8;

    const docTitle = sale.docType === "Invoice" ? "FACTURA" : "PROFORMA";
    doc.setFontSize(14);
    doc.text(docTitle, marginLeft, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Número: ${sale.documentNumber}`, marginLeft, y);
    y += 5;
    doc.text(`Fecha de emisión: ${formatDate(sale.createdAt)}`, marginLeft, y);
    y += 8;

    // Divider line
    doc.setDrawColor(180, 180, 180);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 6;

    // ── Customer data ───────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DATOS DEL CLIENTE", marginLeft, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nombre: ${sale.customerName}`, marginLeft, y);
    y += 5;
    if (sale.customerRuc) {
      doc.text(`RUC/Cédula: ${sale.customerRuc}`, marginLeft, y);
      y += 5;
    }
    y += 3;

    // ── Products / services table ───────────────────────────────────────
    autoTable(doc, {
      startY: y,
      margin: { left: marginLeft, right: marginRight },
      theme: "grid",
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 22 },
        2: { cellWidth: "auto" },
        3: { halign: "right", cellWidth: 20 },
        4: { halign: "right", cellWidth: 28 },
        5: { halign: "right", cellWidth: 28 },
      },
      head: [["#", "Tipo", "Descripción", "Cant.", "Precio Unit.", "Subtotal"]],
      body: sale.lines.map((line, idx) => [
        String(idx + 1),
        "Producto",
        line.nombre,
        String(line.cantidad),
        `$${line.precioUnitario.toFixed(2)}`,
        `$${line.subtotal.toFixed(2)}`,
      ]),
    });

    // Get Y after table
    const finalY =
      (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        ?.finalY ?? y + 20;
    y = finalY + 8;

    // ── Totals (right-aligned) ──────────────────────────────────────────
    const totalsX = pageWidth - marginRight;
    const labelX = pageWidth - marginRight - 55;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", labelX, y);
    doc.text(`$${sale.subtotal.toFixed(2)}`, totalsX, y, { align: "right" });
    y += 6;

    doc.text(`IVA (${sale.ivaPercent}%):`, labelX, y);
    doc.text(`$${sale.ivaAmount.toFixed(2)}`, totalsX, y, { align: "right" });
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.line(labelX, y - 1, totalsX, y - 1);
    doc.text("TOTAL:", labelX, y + 4);
    doc.text(`$${sale.total.toFixed(2)}`, totalsX, y + 4, { align: "right" });
    y += 12;

    // ── Footer ──────────────────────────────────────────────────────────
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Alquiler de maquinaria pesada · Servicio de mantenimiento y reparación · Venta de accesorios y repuestos",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center", maxWidth: contentWidth },
    );

    // ── Save ────────────────────────────────────────────────────────────
    const prefix = sale.docType === "Invoice" ? "FACTURA" : "PROFORMA";
    doc.save(`${prefix}-${sale.documentNumber}.pdf`);
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Documento ${sale.documentNumber}`}
      size="lg"
      ocidPrefix="sale_detail"
      footer={
        <div className="flex items-center gap-2 flex-wrap">
          {sale.status === DocumentStatus.Draft && onConfirm && (
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              data-ocid="sale_detail.confirm_button"
              className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-400"
            >
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Confirmar
            </Button>
          )}
          {sale.status === DocumentStatus.Draft && onCancel && (
            <Button
              type="button"
              size="sm"
              onClick={handleCancel}
              data-ocid="sale_detail.cancel_status_button"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Ban className="w-4 h-4 mr-1.5" />
              Cancelar
            </Button>
          )}
          {sale.status === DocumentStatus.Draft && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(sale)}
              data-ocid="sale_detail.edit_button"
            >
              <Pencil className="w-4 h-4 mr-1.5" />
              Editar
            </Button>
          )}
          {sale.docType === "Proforma" &&
            sale.status === DocumentStatus.Confirmed &&
            onConvertToInvoice && (
              <Button
                type="button"
                size="sm"
                onClick={onConvertToInvoice}
                data-ocid="sale_detail.convert_to_invoice_button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Receipt className="w-4 h-4 mr-1.5" />
                Convertir a Factura
              </Button>
            )}
          <Button
            type="button"
            size="sm"
            onClick={generatePDF}
            data-ocid="sale_detail.download_pdf_button"
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <FileDown className="w-4 h-4 mr-1.5" />
            Descargar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="sale_detail.close_button"
          >
            <X className="w-4 h-4 mr-1.5" />
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Document header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DocTypeBadge docType={sale.docType} />
              <StatusBadge status={sale.status} />
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">
              Fe:{" "}
              <span className="font-medium text-foreground">
                {formatDate(sale.createdAt)}
              </span>
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Cliente
          </p>
          <p className="text-sm font-medium text-foreground">
            {sale.customerName}
          </p>
          {sale.customerRuc && (
            <p className="text-xs text-muted-foreground">
              RUC/Cédula: {sale.customerRuc}
            </p>
          )}
        </div>

        {/* Products table */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Productos
          </p>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    Producto
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    Código
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                    Cantidad
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                    Precio Unit.
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sale.lines.map((line, idx) => (
                  <tr
                    key={line.lineId}
                    className="bg-card hover:bg-accent/20 transition-colors"
                    data-ocid={`sale_detail.line_item.${idx + 1}`}
                  >
                    <td className="px-3 py-2 text-foreground font-medium">
                      {line.nombre}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                      {line.codigo}
                    </td>
                    <td className="px-3 py-2 text-right text-foreground">
                      {line.cantidad}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground">
                      {formatCurrency(line.precioUnitario)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground">
                      {formatCurrency(line.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div
          className="bg-muted/30 border border-border rounded-lg p-4 space-y-2"
          data-ocid="sale_detail.totals"
        >
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-medium text-foreground">
              {formatCurrency(sale.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>IVA ({sale.ivaPercent}%):</span>
            <span className="font-medium text-foreground">
              {formatCurrency(sale.ivaAmount)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-2">
            <span>Total:</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
