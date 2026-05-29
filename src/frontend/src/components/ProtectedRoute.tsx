import { Navigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCallerProfile } from "../hooks/useBackend";
import OnboardingModal from "./OnboardingModal";
import LoadingSpinner from "./shared/LoadingSpinner";
import { Button } from "./ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, identity } = useAuth();
  const {
    isLoading: profileLoading,
    isFetched,
    data: profile,
  } = useCallerProfile();

  const isLoading = isInitializing || profileLoading;
  const [timedOut, setTimedOut] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const id = setTimeout(() => setTimedOut(true), 7000);
    return () => clearTimeout(id);
  }, [isLoading]);

  if (isLoading && timedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card border border-border rounded-lg p-8 shadow-elevated text-center space-y-4">
          <div className="flex justify-center">
            <span className="text-4xl">⚠️</span>
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
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando sistema..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // First login — profile setup
  if (isAuthenticated && isFetched && profile === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ProfileSetup />
      </div>
    );
  }

  // Onboarding — shown once per principal after profile is ready
  const principalId = identity?.getPrincipal().toString() ?? "";
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

// ─── Profile Setup (first login) ─────────────────────────────────────────────

import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveCallerProfile } from "../hooks/useBackend";
import { Branch, Role } from "../types";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

function ProfileSetup() {
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerProfile();
  const queryClient = useQueryClient();
  const [name, setName] = React.useState("");
  const [branch, setBranch] = React.useState<Branch>(Branch.Puyo);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!identity) return;
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        branch,
        role: Role.Vendor,
        active: true,
        principal: identity.getPrincipal(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    } catch {
      setError("Error al guardar el perfil. Intente de nuevo.");
    }
  };

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-lg p-8 shadow-elevated">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-foreground">
          Configurar perfil
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Primera vez en el sistema. Complete sus datos.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="setup-name">Nombre completo</Label>
          <Input
            id="setup-name"
            data-ocid="profile_setup.name.input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Ej. Carlos Pérez"
            className="mt-1"
          />
          {error && (
            <p
              data-ocid="profile_setup.name.field_error"
              className="text-destructive text-xs mt-1"
            >
              {error}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="setup-branch">Sucursal</Label>
          <Select value={branch} onValueChange={(v) => setBranch(v as Branch)}>
            <SelectTrigger
              id="setup-branch"
              data-ocid="profile_setup.branch.select"
              className="mt-1"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Branch.Puyo}>Puyo</SelectItem>
              <SelectItem value={Branch.El_Topo}>El Topo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          data-ocid="profile_setup.submit_button"
          className="w-full"
          disabled={saveProfile.isPending}
        >
          {saveProfile.isPending ? "Guardando..." : "Ingresar al sistema"}
        </Button>
      </form>
    </div>
  );
}
