import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Copy,
  Eye,
  MoreVertical,
  Send,
  Settings,
  ShieldOff,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AccessStatus } from "../backend.d";
import Badge, { RoleBadge } from "../components/shared/Badge";
import EmptyState from "../components/shared/EmptyState";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import PageHeader from "../components/shared/PageHeader";
import { useEmpresa } from "../context/EmpresaContext";
import {
  useActivateUser,
  useApproveUser,
  useCallerProfile,
  useDeactivateUser,
  useIsAdmin,
  useListApprovedUsers,
  useListPendingUsers,
  useRejectUser,
  useSetUserRole,
} from "../hooks/useBackend";
import { Branch, Role } from "../types";
import type { UserProfile } from "../types";

const ROLE_LABELS: Record<string, string> = {
  Admin: "Administrador",
  Vendor: "Vendedor",
  Technician: "Técnico",
};

const BRANCH_LABELS: Record<string, string> = {
  Puyo: "Puyo",
  ElTopo: "El Topo",
};

function branchLabel(branch: Branch): string {
  const key = Object.keys(BRANCH_LABELS).find((k) => {
    const b = branch as unknown as Record<string, null>;
    return b[k] !== undefined;
  });
  return key ? BRANCH_LABELS[key] : String(branch);
}

function roleKey(role: Role): string {
  const r = role as unknown as Record<string, null>;
  if (r.Admin !== undefined) return "Admin";
  if (r.Vendor !== undefined) return "Vendor";
  if (r.Technician !== undefined) return "Technician";
  return "Vendor";
}

function isSamePrincipal(
  a: UserProfile["principal"],
  b: UserProfile["principal"],
): boolean {
  return a.toString() === b.toString();
}

// ─── Users Tab ──────────────────────────────────────────────────────────────

// ─── Access status helpers ──────────────────────────────────────────────────

function getAccessStatus(
  user: UserProfile,
): "active" | "no_second_device" | "inactive" {
  if (!user.active) return "inactive";
  const pid = user.principal.toString();
  const sinSegundo = localStorage.getItem(`sin_segundo_dispositivo_${pid}`);
  const pendiente = localStorage.getItem(
    `segundo_dispositivo_pendiente_${pid}`,
  );
  if (sinSegundo === "true" || pendiente === "true") return "no_second_device";
  return "active";
}

function AccessStatusBadge({
  status,
}: {
  status: "active" | "no_second_device" | "inactive";
}) {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[oklch(0.55_0.14_150)] bg-[oklch(0.55_0.14_150)]/10 rounded-full px-2 py-0.5">
        <CheckCircle className="w-3.5 h-3.5" />
        Activo
      </span>
    );
  if (status === "no_second_device")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[oklch(0.65_0.17_60)] bg-[oklch(0.65_0.17_60)]/10 rounded-full px-2 py-0.5">
        <AlertTriangle className="w-3.5 h-3.5" />
        Sin 2do dispositivo
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
      <XCircle className="w-3.5 h-3.5" />
      Desactivado
    </span>
  );
}

// ─── User action modals ──────────────────────────────────────────────────────

function UserDetailModal({
  user,
  onClose,
}: {
  user: UserProfile;
  onClose: () => void;
}) {
  const rKey = roleKey(user.role);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="admin.users.detail.dialog"
    >
      <div
        className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Detalle del usuario
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="admin.users.detail.close_button"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Nombre</span>
            <span className="text-sm font-medium text-foreground">
              {user.name || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Rol</span>
            <span className="text-sm font-medium text-foreground">
              {ROLE_LABELS[rKey] ?? rKey}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Sucursal</span>
            <span className="text-sm font-medium text-foreground">
              {branchLabel(user.branch)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Último acceso</span>
            <span className="text-sm text-muted-foreground italic">
              No disponible
            </span>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="admin.users.detail.cancel_button"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

function SendInstructionsModal({
  user,
  onClose,
}: {
  user: UserProfile;
  onClose: () => void;
}) {
  const message = `Hola ${user.name || "usuario"}, para ingresar al sistema Equipos ET desde un nuevo dispositivo sigue estos pasos:
1. Abre https://identity.ic0.app en una nueva pestaña
2. Inicia sesión con el mismo dispositivo que usas ahora
3. Ve a la sección Mis dispositivos
4. Presiona Agregar nuevo dispositivo
5. Sigue las instrucciones en el nuevo dispositivo
Si tienes dudas contacta al administrador del sistema.`;

  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="admin.users.instructions.dialog"
    >
      <div
        className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Enviar instrucciones de acceso
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="admin.users.instructions.close_button"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Copia este mensaje y envíalo por WhatsApp o correo al usuario.
        </p>
        <div
          className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed mb-4"
          data-ocid="admin.users.instructions.message"
        >
          {message}
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="admin.users.instructions.cancel_button"
          >
            Cerrar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
            data-ocid="admin.users.instructions.copy_button"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar mensaje
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── User Row (legacy, kept for reference) ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _UserRow({
  user,
  isSelf,
  onRoleChange,
  onToggleActive,
  isUpdating,
}: {
  user: UserProfile;
  isSelf: boolean;
  onRoleChange: (userId: UserProfile["principal"], role: Role) => void;
  onToggleActive: (userId: UserProfile["principal"], active: boolean) => void;
  isUpdating: boolean;
}) {
  const rKey = roleKey(user.role);
  const pid = user.principal.toString();

  // Access status with re-render trigger
  const [, forceUpdate] = useState(0);
  const accessStatus = getAccessStatus(user);

  // Toggle "sin segundo dispositivo" in localStorage
  function handleToggleNoSecondDevice() {
    const key = `sin_segundo_dispositivo_${pid}`;
    const current = localStorage.getItem(key) === "true";
    localStorage.setItem(key, String(!current));
    // Also clear onboarding pending flag if admin manually sets active
    if (current) {
      // toggling off: remove both
      localStorage.removeItem(key);
    }
    forceUpdate((n) => n + 1);
  }

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleRoleChange(value: string) {
    const roleMap: Record<string, Role> = {
      Admin: Role.Admin,
      Vendor: Role.Vendor,
      Technician: Role.Technician,
    };
    onRoleChange(user.principal, roleMap[value]);
  }

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/40 transition-colors"
        data-ocid="admin.users.row"
      >
        {/* Nombre / Principal */}
        <td className="px-4 py-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name || "—"}
            </span>
            <span className="text-xs text-muted-foreground font-mono truncate">
              {pid.slice(0, 24)}…
            </span>
          </div>
        </td>

        {/* Cambiar Rol */}
        <td className="px-4 py-3">
          <Select
            value={rKey}
            onValueChange={handleRoleChange}
            disabled={isUpdating}
          >
            <SelectTrigger
              className="h-8 w-36 text-xs"
              data-ocid="admin.users.role.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Administrador</SelectItem>
              <SelectItem value="Vendor">Vendedor</SelectItem>
              <SelectItem value="Technician">Técnico</SelectItem>
            </SelectContent>
          </Select>
        </td>

        {/* Rol badge */}
        <td className="px-4 py-3">
          <RoleBadge role={rKey} />
        </td>

        {/* Sucursal */}
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {branchLabel(user.branch)}
        </td>

        {/* Estado de acceso */}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1.5">
            <AccessStatusBadge status={accessStatus} />
            {/* Toggle for "sin segundo dispositivo" — only visible for active users */}
            {user.active && (
              <button
                type="button"
                onClick={handleToggleNoSecondDevice}
                className={`inline-flex items-center gap-1.5 text-xs rounded px-1.5 py-0.5 transition-colors ${
                  accessStatus === "no_second_device"
                    ? "text-[oklch(0.65_0.17_60)] bg-[oklch(0.65_0.17_60)]/15 hover:bg-[oklch(0.65_0.17_60)]/25"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
                title="Marcar/desmarcar: sin segundo dispositivo"
                data-ocid="admin.users.second_device.toggle"
              >
                <AlertTriangle className="w-3 h-3" />
                {accessStatus === "no_second_device"
                  ? "Quitar advertencia"
                  : "Sin 2do dispositivo"}
              </button>
            )}
          </div>
        </td>

        {/* Acciones — three-dot menu */}
        <td className="px-4 py-3 text-right">
          <div className="relative inline-block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              data-ocid="admin.users.actions.open_modal_button"
              title="Acciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-40 min-w-[180px] rounded-lg border border-border bg-card shadow-lg py-1">
                {/* Ver detalle */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                  onClick={() => {
                    setShowDetail(true);
                    setMenuOpen(false);
                  }}
                  data-ocid="admin.users.actions.detail_button"
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  Ver detalle
                </button>

                {/* Enviar instrucciones */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                  onClick={() => {
                    setShowInstructions(true);
                    setMenuOpen(false);
                  }}
                  data-ocid="admin.users.actions.instructions_button"
                >
                  <Send className="w-4 h-4 text-muted-foreground" />
                  Enviar instrucciones
                </button>

                <div className="border-t border-border my-1" />

                {/* Activar / Desactivar */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isUpdating || isSelf}
                  onClick={() => {
                    onToggleActive(user.principal, !user.active);
                    setMenuOpen(false);
                  }}
                  title={
                    isSelf ? "No puedes desactivar tu propia cuenta" : undefined
                  }
                  data-ocid={
                    user.active
                      ? "admin.users.deactivate_button"
                      : "admin.users.activate_button"
                  }
                >
                  {user.active ? (
                    <>
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-destructive">Desactivar</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[oklch(0.55_0.14_150)]" />
                      <span className="text-[oklch(0.55_0.14_150)]">
                        Activar
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {showDetail && (
        <UserDetailModal user={user} onClose={() => setShowDetail(false)} />
      )}
      {showInstructions && (
        <SendInstructionsModal
          user={user}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </>
  );
}

function AdminGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="admin.users.guide.dialog"
    >
      <div
        className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Guía para administradores
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="admin.users.guide.close_button"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          ¿Qué hacer cuando un usuario no puede ingresar al sistema?
        </p>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              1
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              Pídele al usuario que intente con otro dispositivo registrado.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              2
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              Si no tiene otro dispositivo, el usuario debe ir a{" "}
              <a
                href="https://identity.ic0.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                identity.ic0.app
              </a>{" "}
              desde cualquier dispositivo y usar su código de recuperación.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[oklch(0.65_0.17_60)]/15 text-[oklch(0.65_0.17_60)] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              Si no tiene código de recuperación, Internet Identity no puede
              recuperar la cuenta. Deberás crear un acceso nuevo para ese
              usuario y asignarle el mismo rol y sucursal.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="admin.users.guide.cancel_button"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Approve User Modal ──────────────────────────────────────────────────────

function ApproveUserModal({
  principal,
  onClose,
  onApprove,
  isPending,
  manualMode = false,
}: {
  principal: string;
  onClose: () => void;
  onApprove: (
    name: string,
    role: Role,
    branch: Branch,
    principalOverride?: string,
  ) => void;
  isPending: boolean;
  manualMode?: boolean;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(Role.Vendor);
  const [branch, setBranch] = useState<Branch>(Branch.Puyo);
  const [manualPrincipal, setManualPrincipal] = useState("");

  const effectivePrincipal = manualMode ? manualPrincipal : principal;
  const canSubmit =
    !!name.trim() &&
    !isPending &&
    (manualMode ? !!manualPrincipal.trim() : true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="admin.users.approve.dialog"
    >
      <div
        className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            {manualMode ? "Agregar usuario manualmente" : "Aprobar usuario"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="admin.users.approve.close_button"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        {manualMode ? (
          <div className="mb-4">
            <Label className="text-sm">Principal ID</Label>
            <Input
              value={manualPrincipal}
              onChange={(e) => setManualPrincipal(e.target.value)}
              placeholder="Ej. aaaaa-bbbbb-ccccc-ddddd-eee"
              className="mt-1 font-mono text-xs"
              data-ocid="admin.users.approve.principal.input"
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-4 font-mono truncate">
            Principal: {principal}
          </p>
        )}
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Pérez"
              className="mt-1"
              data-ocid="admin.users.approve.name.input"
            />
          </div>
          <div>
            <Label className="text-sm">Rol</Label>
            <Select
              value={roleKey(role)}
              onValueChange={(v) => {
                const map: Record<string, Role> = {
                  Admin: Role.Admin,
                  Vendor: Role.Vendor,
                  Technician: Role.Technician,
                };
                setRole(map[v]);
              }}
            >
              <SelectTrigger
                className="mt-1"
                data-ocid="admin.users.approve.role.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Administrador</SelectItem>
                <SelectItem value="Vendor">Vendedor</SelectItem>
                <SelectItem value="Technician">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Sucursal</Label>
            <Select
              value={branch}
              onValueChange={(v) => setBranch(v as Branch)}
            >
              <SelectTrigger
                className="mt-1"
                data-ocid="admin.users.approve.branch.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Branch.Puyo}>Puyo</SelectItem>
                <SelectItem value={Branch.El_Topo}>El Topo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="admin.users.approve.cancel_button"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!canSubmit}
            onClick={() =>
              onApprove(
                name.trim(),
                role,
                branch,
                manualMode ? effectivePrincipal : undefined,
              )
            }
            data-ocid="admin.users.approve.confirm_button"
          >
            {isPending ? "Aprobando..." : "Aprobar acceso"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Users Section ───────────────────────────────────────────────────

function PendingUsersSection() {
  const { data: pending = [], isLoading } = useListPendingUsers();
  const approve = useApproveUser();
  const reject = useRejectUser();
  const [selectedPrincipal, setSelectedPrincipal] = useState<string | null>(
    null,
  );

  function handleApprove(name: string, role: Role, branch: Branch) {
    if (!selectedPrincipal) return;
    const p = Principal.fromText(selectedPrincipal);
    approve.mutate(
      { target: p, name, role, branch },
      {
        onSuccess: () => {
          toast.success("Usuario aprobado");
          setSelectedPrincipal(null);
        },
        onError: () => toast.error("Error al aprobar usuario"),
      },
    );
  }

  // tooltip on truncated principal
  const principalCell = (principalStr: string) => (
    <td className="px-4 py-3 max-w-[200px]" title={principalStr}>
      <span className="font-mono text-xs text-muted-foreground block truncate">
        {principalStr}
      </span>
    </td>
  );

  function handleReject(principalStr: string) {
    const p = Principal.fromText(principalStr);
    reject.mutate(p, {
      onSuccess: () => toast.success("Solicitud rechazada"),
      onError: () => toast.error("Error al rechazar solicitud"),
    });
  }

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Solicitudes pendientes
        </h3>
        <LoadingSpinner />
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 gap-3"
        data-ocid="admin.solicitudes.empty_state"
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="text-sm text-muted-foreground">
          No hay solicitudes de acceso pendientes
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4" data-ocid="admin.users.pending.section">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Solicitudes pendientes ({pending.length})
      </h3>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Principal
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Fecha de solicitud
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {pending.map((p, idx) => (
              <tr
                key={p.principal.toString()}
                className="border-b border-border hover:bg-muted/40 transition-colors"
                data-ocid={`admin.users.pending.item.${idx + 1}`}
              >
                {principalCell(p.principal.toString())}
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(Number(p.requestedAt) / 1_000_000).toLocaleString(
                    "es-EC",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        setSelectedPrincipal(p.principal.toString())
                      }
                      data-ocid={`admin.users.pending.approve_button.${idx + 1}`}
                    >
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => {
                        if (
                          window.confirm(
                            "¿Estás seguro de que deseas rechazar esta solicitud? Esta acción no se puede deshacer.",
                          )
                        ) {
                          handleReject(p.principal.toString());
                        }
                      }}
                      data-ocid={`admin.users.pending.reject_button.${idx + 1}`}
                    >
                      Rechazar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPrincipal && (
        <ApproveUserModal
          principal={selectedPrincipal}
          onClose={() => setSelectedPrincipal(null)}
          onApprove={handleApprove}
          isPending={approve.isPending}
        />
      )}
    </div>
  );
}

// ─── Approved Users Section ──────────────────────────────────────────────────

function ApprovedUsersSection({
  callerProfile,
}: {
  callerProfile: UserProfile;
}) {
  const { data: approved = [], isLoading } = useListApprovedUsers();
  const setRole = useSetUserRole();
  const deactivate = useDeactivateUser();
  const activate = useActivateUser();
  const [showGuide, setShowGuide] = useState(false);

  function handleRoleChange(userId: Principal, role: Role) {
    setRole.mutate(
      { userId, role },
      {
        onSuccess: () => toast.success("Rol actualizado"),
        onError: () => toast.error("Error al actualizar rol"),
      },
    );
  }

  function handleToggleActive(userId: Principal, active: boolean) {
    if (active) {
      activate.mutate(userId, {
        onSuccess: () => toast.success("Usuario activado"),
        onError: () => toast.error("Error al activar usuario"),
      });
    } else {
      deactivate.mutate(userId, {
        onSuccess: () => toast.success("Usuario desactivado"),
        onError: () => toast.error("Error al desactivar usuario"),
      });
    }
  }

  const isMutating =
    setRole.isPending || deactivate.isPending || activate.isPending;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.users.loading_state"
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (approved.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Usuarios aprobados
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(true)}
            className="gap-2 text-xs"
            data-ocid="admin.users.guide_button"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Guía para administradores
          </Button>
        </div>
        <EmptyState
          ocid="admin.users.empty_state"
          icon={<Users className="w-6 h-6" />}
          title="Sin usuarios aprobados"
          description="No hay usuarios aprobados en el sistema todavía."
        />
        {showGuide && <AdminGuideModal onClose={() => setShowGuide(false)} />}
      </div>
    );
  }

  return (
    <div data-ocid="admin.users.table">
      {/* Header row: title + guide button */}
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Usuarios aprobados
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowGuide(true)}
          className="gap-2 text-xs"
          data-ocid="admin.users.guide_button"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Guía para administradores
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Nombre / Principal
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cambiar Rol
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Rol
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sucursal
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Estado de acceso
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {approved.map((user, idx) => (
              <ApprovedUserRow
                key={user.principal.toString()}
                user={user}
                isSelf={isSamePrincipal(
                  user.principal,
                  callerProfile.principal,
                )}
                onRoleChange={handleRoleChange}
                onToggleActive={handleToggleActive}
                isUpdating={isMutating}
                data-ocid={`admin.users.item.${idx + 1}`}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showGuide && <AdminGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}

// ─── Approved User Row ───────────────────────────────────────────────────────

function ApprovedUserRow({
  user,
  isSelf,
  onRoleChange,
  onToggleActive,
  isUpdating,
}: {
  user: import("../backend.d").ApprovedUser;
  isSelf: boolean;
  onRoleChange: (userId: Principal, role: Role) => void;
  onToggleActive: (userId: Principal, active: boolean) => void;
  isUpdating: boolean;
}) {
  const rKey = roleKey(user.role);
  const pid = user.principal.toString();
  const isActive = user.status === AccessStatus.Active;

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleRoleChange(value: string) {
    const roleMap: Record<string, Role> = {
      Admin: Role.Admin,
      Vendor: Role.Vendor,
      Technician: Role.Technician,
    };
    onRoleChange(user.principal, roleMap[value]);
  }

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/40 transition-colors"
        data-ocid="admin.users.row"
      >
        {/* Nombre / Principal */}
        <td className="px-4 py-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name || "—"}
            </span>
            <span className="text-xs text-muted-foreground font-mono truncate">
              {pid.slice(0, 24)}…
            </span>
          </div>
        </td>

        {/* Cambiar Rol */}
        <td className="px-4 py-3">
          <Select
            value={rKey}
            onValueChange={handleRoleChange}
            disabled={isUpdating}
          >
            <SelectTrigger
              className="h-8 w-36 text-xs"
              data-ocid="admin.users.role.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Administrador</SelectItem>
              <SelectItem value="Vendor">Vendedor</SelectItem>
              <SelectItem value="Technician">Técnico</SelectItem>
            </SelectContent>
          </Select>
        </td>

        {/* Rol badge */}
        <td className="px-4 py-3">
          <RoleBadge role={rKey} />
        </td>

        {/* Sucursal */}
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {branchLabel(user.branch)}
        </td>

        {/* Estado de acceso */}
        <td className="px-4 py-3">
          {isActive ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[oklch(0.55_0.14_150)] bg-[oklch(0.55_0.14_150)]/10 rounded-full px-2 py-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
              <XCircle className="w-3.5 h-3.5" />
              Inactivo
            </span>
          )}
        </td>

        {/* Acciones — three-dot menu */}
        <td className="px-4 py-3 text-right">
          <div className="relative inline-block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              data-ocid="admin.users.actions.open_modal_button"
              title="Acciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-40 min-w-[180px] rounded-lg border border-border bg-card shadow-lg py-1">
                {/* Ver detalle */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                  onClick={() => {
                    setShowDetail(true);
                    setMenuOpen(false);
                  }}
                  data-ocid="admin.users.actions.detail_button"
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  Ver detalle
                </button>

                {/* Enviar instrucciones */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                  onClick={() => {
                    setShowInstructions(true);
                    setMenuOpen(false);
                  }}
                  data-ocid="admin.users.actions.instructions_button"
                >
                  <Send className="w-4 h-4 text-muted-foreground" />
                  Enviar instrucciones
                </button>

                <div className="border-t border-border my-1" />

                {/* Activar / Desactivar */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isUpdating || isSelf}
                  onClick={() => {
                    onToggleActive(user.principal, !isActive);
                    setMenuOpen(false);
                  }}
                  title={
                    isSelf ? "No puedes desactivar tu propia cuenta" : undefined
                  }
                  data-ocid={
                    isActive
                      ? "admin.users.deactivate_button"
                      : "admin.users.activate_button"
                  }
                >
                  {isActive ? (
                    <>
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-destructive">Desactivar</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[oklch(0.55_0.14_150)]" />
                      <span className="text-[oklch(0.55_0.14_150)]">
                        Activar
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {showDetail && (
        <UserDetailModal
          user={{
            principal: user.principal,
            name: user.name,
            role: user.role,
            branch: user.branch,
            active: isActive,
            createdAt: user.approvedAt,
          }}
          onClose={() => setShowDetail(false)}
        />
      )}
      {showInstructions && (
        <SendInstructionsModal
          user={{
            principal: user.principal,
            name: user.name,
            role: user.role,
            branch: user.branch,
            active: isActive,
            createdAt: user.approvedAt,
          }}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </>
  );
}

function UsersTab({ callerProfile }: { callerProfile: UserProfile }) {
  const approve = useApproveUser();
  const [manualAddOpen, setManualAddOpen] = useState(false);

  function handleManualApprove(
    name: string,
    role: Role,
    branch: Branch,
    principalOverride?: string,
  ) {
    if (!principalOverride?.trim()) return;
    const p = Principal.fromText(principalOverride.trim());
    approve.mutate(
      { target: p, name, role, branch },
      {
        onSuccess: () => {
          toast.success("Usuario agregado correctamente");
          setManualAddOpen(false);
        },
        onError: () => toast.error("Error al agregar usuario"),
      },
    );
  }

  return (
    <div className="space-y-2">
      <div className="px-6 pt-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Usuarios con acceso al sistema
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setManualAddOpen(true)}
          data-ocid="admin.users.add_manual_button"
        >
          + Agregar usuario manualmente
        </Button>
      </div>
      <ApprovedUsersSection callerProfile={callerProfile} />
      {manualAddOpen && (
        <ApproveUserModal
          principal=""
          manualMode
          onClose={() => setManualAddOpen(false)}
          onApprove={handleManualApprove}
          isPending={approve.isPending}
        />
      )}
    </div>
  );
}

function SolicitudesTab() {
  return (
    <div className="p-0">
      <PendingUsersSection />
    </div>
  );
}

// ─── Sistema Tab ──────────────────────────────────────────────────────────────

function SistemaTab() {
  const { logoUrl, setLogoUrl } = useEmpresa();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
  const MAX_BYTES = 2 * 1024 * 1024;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setFileError("Solo se permiten imágenes JPG, PNG o WebP.");
      setPreviewUrl(null);
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("La imagen no debe superar 2MB.");
      setPreviewUrl(null);
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSaveLogo() {
    if (!previewUrl) return;
    setLogoUrl(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    toast.success("Logo actualizado correctamente");
  }

  function handleRemoveLogo() {
    setLogoUrl(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setFileError(null);
  }

  const infoRows = [
    { label: "Versión", value: "1.0.0" },
    { label: "Plataforma", value: "Internet Computer" },
    { label: "Módulo activo", value: "Inventario y Ventas" },
  ];

  const branches = [
    { name: "Puyo", city: "Pastaza", type: "Punto de venta" },
    { name: "El Topo", city: "Pastaza (rural)", type: "Taller central" },
  ];

  return (
    <div className="space-y-6 p-6" data-ocid="admin.sistema.section">
      {/* Logo de la empresa */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Logo de la empresa
        </h3>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo preview / placeholder */}
            <div className="flex-shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa del logo"
                  className="w-20 h-20 rounded-lg object-contain border border-border bg-muted/30"
                  data-ocid="admin.sistema.logo.preview"
                />
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo de la empresa"
                  className="w-20 h-20 rounded-lg object-contain border border-border bg-muted/30"
                  data-ocid="admin.sistema.logo.current"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center"
                  data-ocid="admin.sistema.logo.placeholder"
                >
                  <span className="text-lg font-bold text-muted-foreground select-none">
                    E.T
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                  data-ocid="admin.sistema.logo.input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="admin.sistema.logo.cambiar_button"
                >
                  Cambiar logo
                </Button>
                {previewUrl && selectedFile && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveLogo}
                    data-ocid="admin.sistema.logo.save_button"
                  >
                    Guardar logo
                  </Button>
                )}
                {logoUrl && !previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    data-ocid="admin.sistema.logo.delete_button"
                  >
                    Eliminar logo
                  </Button>
                )}
              </div>

              {fileError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="admin.sistema.logo.error_state"
                >
                  {fileError}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Formatos aceptados: JPG, PNG, WebP. Tamaño máximo: 2 MB.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* App info */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Información de la Aplicación
        </h3>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {infoRows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-3 text-sm ${
                i < infoRows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Branches */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Sucursales Registradas
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className="rounded-lg border border-border bg-card p-4"
              data-ocid="admin.sistema.branch.card"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground text-sm">
                  {branch.name}
                </span>
                <Badge variant="info">{branch.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{branch.city}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Roles info */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Roles del Sistema
        </h3>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {Object.entries(ROLE_LABELS).map(([key, label], i) => (
            <div
              key={key}
              className={`flex items-center justify-between px-4 py-3 text-sm ${
                i < Object.keys(ROLE_LABELS).length - 1
                  ? "border-b border-border"
                  : ""
              }`}
            >
              <span className="text-muted-foreground">{label}</span>
              <RoleBadge role={key} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Bar with pending badge ─────────────────────────────────────────────

function PendingBadgeTabBar() {
  const { data: pendingUsers = [] } = useListPendingUsers();
  const pendingCount = pendingUsers.length;

  const triggerClass =
    "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-sm font-medium";

  return (
    <div className="border-b border-border px-6 bg-card">
      <TabsList className="h-10 bg-transparent p-0 gap-0">
        <TabsTrigger
          value="usuarios"
          className={triggerClass}
          data-ocid="admin.tab.usuarios"
        >
          <Users className="w-4 h-4 mr-1.5" />
          Usuarios
        </TabsTrigger>
        <TabsTrigger
          value="solicitudes"
          className={triggerClass}
          data-ocid="admin.tab.solicitudes"
        >
          Solicitudes
          {pendingCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none w-4 h-4 min-w-[1rem]">
              {pendingCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="sistema"
          className={triggerClass}
          data-ocid="admin.tab.sistema"
        >
          <Settings className="w-4 h-4 mr-1.5" />
          Sistema
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("usuarios");
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: callerProfile, isLoading: profileLoading } = useCallerProfile();

  if (adminLoading || profileLoading) {
    return (
      <div data-ocid="admin.page">
        <PageHeader
          title="Administración"
          subtitle="Gestión de usuarios y configuración del sistema"
        />
        <div
          className="flex items-center justify-center py-24"
          data-ocid="admin.loading_state"
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div data-ocid="admin.page">
        <PageHeader
          title="Administración"
          subtitle="Gestión de usuarios y configuración del sistema"
        />
        <div
          className="flex flex-col items-center justify-center py-24 gap-4"
          data-ocid="admin.error_state"
        >
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldOff className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Acceso denegado
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Necesitas el rol de Administrador para acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="admin.page" className="flex flex-col min-h-0">
      <PageHeader
        title="Administración"
        subtitle="Gestión de usuarios y configuración del sistema"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1"
      >
        <PendingBadgeTabBar />

        <TabsContent value="usuarios" className="mt-0 flex-1">
          {callerProfile ? (
            <UsersTab callerProfile={callerProfile} />
          ) : (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="admin.users.loading_state"
            >
              <LoadingSpinner />
            </div>
          )}
        </TabsContent>

        <TabsContent value="solicitudes" className="mt-0 flex-1">
          <SolicitudesTab />
        </TabsContent>

        <TabsContent value="sistema" className="mt-0">
          <SistemaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
