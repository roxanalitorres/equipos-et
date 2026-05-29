import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import React from "react";
import { useEmpresa } from "../context/EmpresaContext";
import { useAuth } from "../hooks/useAuth";
import { useCallerProfile } from "../hooks/useBackend";
import { useBranch } from "../hooks/useBranch";
import { Branch } from "../types";
import DeviceBanner from "./DeviceBanner";

const NAV_ITEMS = [
  { label: "Inicio", path: "/", icon: LayoutDashboard },
  { label: "Catálogo", path: "/products", icon: Package },
  { label: "Inventario", path: "/inventory", icon: Warehouse },
  { label: "Clientes", path: "/customers", icon: Users },
  { label: "Ventas", path: "/sales", icon: FileText },
  { label: "Administración", path: "/admin", icon: ShieldCheck },
];

const BRANCH_LABELS: Record<Branch, string> = {
  [Branch.Puyo]: "Puyo",
  [Branch.El_Topo]: "El Topo",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();
  const { data: profile } = useCallerProfile();
  const { activeBranch, setActiveBranch } = useBranch();
  const { logoUrl } = useEmpresa();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-20 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-56 flex flex-col
          bg-[oklch(var(--sidebar))] border-r border-[oklch(var(--sidebar-border))]
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[oklch(var(--sidebar-border))]">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo de la empresa"
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <span className="text-[oklch(var(--sidebar-foreground))] font-display font-bold text-sm leading-tight">
              EQUIPOS E.T
            </span>
          )}
          <button
            type="button"
            className="ml-auto lg:hidden text-[oklch(var(--sidebar-foreground)/0.7)] hover:text-[oklch(var(--sidebar-foreground))]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 py-3 overflow-y-auto"
          aria-label="Navegación principal"
        >
          <ul className="space-y-0.5 px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium
                      transition-colors duration-150
                      ${
                        isActive
                          ? "bg-[oklch(var(--sidebar-primary))] text-[oklch(var(--sidebar-primary-foreground))]"
                          : "text-[oklch(var(--sidebar-foreground)/0.8)] hover:bg-[oklch(var(--sidebar-foreground)/0.08)] hover:text-[oklch(var(--sidebar-foreground))]"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Device banner — self-contained, reads principalId from useAuth */}
        <DeviceBanner />

        {/* User info + logout */}
        <div className="px-3 py-3 border-t border-[oklch(var(--sidebar-border))]">
          {profile && (
            <p className="text-[oklch(var(--sidebar-foreground)/0.6)] text-xs px-2 mb-2 truncate">
              {profile.name}
            </p>
          )}
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-sm text-[oklch(var(--sidebar-foreground)/0.7)] hover:bg-[oklch(var(--sidebar-foreground)/0.08)] hover:text-[oklch(var(--sidebar-foreground))] transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-card border-b border-border shadow-subtle px-4 h-14 flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Branch selector */}
          <div className="relative">
            <button
              type="button"
              data-ocid="header.branch_selector.toggle"
              onClick={() => setBranchMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-input bg-background hover:bg-muted text-sm font-medium text-foreground transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(var(--chart-1))]" />
              {activeBranch === "all"
                ? "Todas las sucursales"
                : BRANCH_LABELS[activeBranch]}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {branchMenuOpen && (
              <div
                data-ocid="header.branch_selector.dropdown_menu"
                className="absolute top-full mt-1 left-0 w-48 bg-card border border-border rounded shadow-elevated z-10"
              >
                {[
                  { value: "all" as const, label: "Todas las sucursales" },
                  { value: Branch.Puyo, label: "Puyo" },
                  { value: Branch.El_Topo, label: "El Topo" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    data-ocid={`header.branch.${opt.value}`}
                    onClick={() => {
                      setActiveBranch(opt.value);
                      setBranchMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t last:rounded-b ${
                      activeBranch === opt.value
                        ? "text-primary font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* User badge */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
              {profile?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="hidden sm:block text-foreground font-medium truncate max-w-32">
              {profile?.name ?? "—"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
