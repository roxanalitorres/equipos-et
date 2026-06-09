import { Navigate } from "@tanstack/react-router";
import { AlertCircle, Check, Clock, Copy, Lock } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useCallerProfile,
  useIsInitialized,
  useRequestAccess,
} from "../hooks/useBackend";
import OnboardingModal from "./OnboardingModal";
import LoadingSpinner from "./shared/LoadingSpinner";
import { Button } from "./ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, identity, logout } = useAuth();
  const {
    isLoading: profileLoading,
    isFetched,
    data: profile,
    error: profileError,
    refetch: refetchProfile,
  } = useCallerProfile();
  const { isLoading: initLoading } = useIsInitialized();
  const requestAccess = useRequestAccess();

  const isLoading = isInitializing || profileLoading || initLoading;
  const [timedOut, setTimedOut] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const principalId = identity?.getPrincipal().toText() ?? "";

  useEffect(() => {
    if (!isLoading) return;
    const id = setTimeout(() => setTimedOut(true), 7000);
    return () => clearTimeout(id);
  }, [isLoading]);

  // Auto-request access when profile is null (not found or pending)
  useEffect(() => {
    if (
      isAuthenticated &&
      isFetched &&
      profile === null &&
      !profileError &&
      !accessRequested &&
      !requestAccess.isPending
    ) {
      setAccessRequested(true);
      requestAccess.mutate(undefined);
    }
  }, [
    isAuthenticated,
    isFetched,
    profile,
    profileError,
    accessRequested,
    requestAccess,
  ]);

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const handleVerificarEstado = async () => {
    setIsVerifying(true);
    await refetchProfile();
    setIsVerifying(false);
  };

  const handleRetry = async () => {
    setIsVerifying(true);
    await refetchProfile();
    setIsVerifying(false);
  };

  // ── Loading with timeout ──────────────────────────────────────────────────
  if (isLoading && timedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card border border-border rounded-lg p-8 shadow-elevated text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-amber-500" />
          </div>
          <h1 className="text-lg font-display font-semibold text-foreground">
            No se pudo conectar al sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            El sistema tardó demasiado en cargar. Por favor verifica tu conexión
            a internet e intenta recargar la página.
          </p>
          <Button
            type="button"
            data-ocid="system_error.reload_button"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando sistema..." />
      </div>
    );
  }

  // ── Not authenticated ─────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // ── Connection error (profileError, after actor is ready) ─────────────────
  if (profileError && isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card border border-border rounded-lg p-8 shadow-elevated text-center space-y-5">
          <div className="flex justify-center">
            <AlertCircle className="h-14 w-14 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-display font-semibold text-foreground">
              Error de conexión
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No se pudo verificar tu acceso. Por favor intenta nuevamente.
            </p>
          </div>
          <Button
            type="button"
            data-ocid="connection_error.retry_button"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleRetry}
            disabled={isVerifying}
          >
            {isVerifying ? "Verificando..." : "Reintentar"}
          </Button>
        </div>
      </div>
    );
  }

  // ── Profile not found / pending approval ──────────────────────────────────
  if (isFetched && (profile === null || profile === undefined)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-elevated space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-200">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-display font-semibold text-foreground">
                Acceso pendiente de aprobación
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tu cuenta fue registrada correctamente. Un administrador debe
                aprobar tu acceso antes de que puedas ingresar al sistema. Esto
                puede tomar algunos minutos.
              </p>
            </div>
          </div>

          {/* Principal ID section */}
          {principalId && (
            <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Tu identificador (para dárselo al administrador):
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-foreground break-all leading-relaxed">
                  {principalId}
                </code>
                <button
                  type="button"
                  data-ocid="pending_access.copy_principal_button"
                  onClick={handleCopyPrincipal}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              type="button"
              data-ocid="pending_access.verify_button"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleVerificarEstado}
              disabled={isVerifying}
            >
              {isVerifying ? "Verificando..." : "Verificar estado"}
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="pending_access.logout_button"
              className="w-full"
              onClick={logout}
            >
              Cerrar sesión
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-center text-muted-foreground">
            Si ya fuiste aprobado y este mensaje sigue apareciendo, presiona{" "}
            <span className="font-medium">Verificar estado</span>.
          </p>
        </div>
      </div>
    );
  }

  // ── Inactive account ──────────────────────────────────────────────────────
  if (profile && profile.active === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-elevated space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200">
              <Lock className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-display font-semibold text-foreground">
                Cuenta desactivada
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tu acceso al sistema ha sido desactivado. Contacta al
                administrador para más información.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            data-ocid="inactive_account.logout_button"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={logout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  // ── Approved + active → onboarding gate ──────────────────────────────────
  const onboardingKey = `onboarding_completado_${principalId}`;
  const alreadyCompleted = Boolean(
    principalId && localStorage.getItem(onboardingKey) === "true",
  );

  if (principalId && !alreadyCompleted && !onboardingDone) {
    return (
      <OnboardingModal
        principalId={principalId}
        onComplete={() => {
          localStorage.setItem(onboardingKey, "true");
          setOnboardingDone(true);
        }}
      />
    );
  }

  return <>{children}</>;
}
