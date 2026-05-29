import type { HTMLAttributes } from "react";
import { DocumentStatus } from "../../types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted"
  | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  success:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40",
  warning:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40",
  muted: "bg-muted text-muted-foreground border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
};

import type React from "react";

export default function Badge({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// Domain-specific badge helpers
// Safely resolve a DocumentStatus whether it arrives as a string enum value
// or as a raw Candid variant object like { Draft: null }.
function resolveStatus(
  status: DocumentStatus | Record<string, unknown>,
): DocumentStatus {
  if (typeof status === "string") return status as DocumentStatus;
  if (status && typeof status === "object") {
    const key = Object.keys(status)[0];
    if (key && Object.values(DocumentStatus).includes(key as DocumentStatus))
      return key as DocumentStatus;
  }
  return DocumentStatus.Draft;
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const resolved = resolveStatus(
    status as DocumentStatus | Record<string, unknown>,
  );
  const map: Record<DocumentStatus, { label: string; variant: BadgeVariant }> =
    {
      [DocumentStatus.Draft]: { label: "Borrador", variant: "muted" },
      [DocumentStatus.Confirmed]: { label: "Confirmado", variant: "success" },
      [DocumentStatus.Converted]: { label: "Convertido", variant: "info" },
      [DocumentStatus.Cancelled]: { label: "Cancelado", variant: "danger" },
    };
  const cfg = map[resolved] ?? {
    label: resolved as string,
    variant: "muted" as BadgeVariant,
  };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    Admin: { label: "Admin", variant: "accent" },
    Vendor: { label: "Vendedor", variant: "default" },
    Technician: { label: "Técnico", variant: "info" },
  };
  const cfg = map[role] ?? { label: role, variant: "muted" as BadgeVariant };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// Resolve DocumentType from either string enum or Candid variant object.
function resolveDocType(docType: string | Record<string, unknown>): string {
  if (typeof docType === "string") return docType;
  if (docType && typeof docType === "object") {
    return Object.keys(docType)[0] ?? "Invoice";
  }
  return "Invoice";
}

export function DocTypeBadge({ docType }: { docType: string }) {
  const resolved = resolveDocType(docType as string | Record<string, unknown>);
  if (resolved === "Proforma") return <Badge variant="warning">Proforma</Badge>;
  return <Badge variant="success">Factura</Badge>;
}

export function StockBadge({
  quantity,
  min,
}: { quantity: bigint; min: bigint }) {
  const q = Number(quantity);
  const m = Number(min);
  if (q === 0) return <Badge variant="danger">{q}</Badge>;
  if (q <= m) return <Badge variant="warning">{q}</Badge>;
  return <Badge variant="success">{q}</Badge>;
}
