import { Button } from "@/components/ui/button";
import { Navigate } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const helpItems = [
  {
    q: "¿Qué hago si el botón no funciona?",
    a: "Asegúrate de tener conexión a internet y recarga la página. Si el problema continúa, prueba con otro navegador como Chrome o Firefox.",
  },
  {
    q: "¿Qué es Internet Identity?",
    a: "Es la llave digital de tu dispositivo. En lugar de una contraseña, usa tu huella, Face ID o el PIN del teléfono para confirmar que eres tú. Es seguro y gratuito.",
  },
  {
    q: "¿Qué pasa si estoy en un dispositivo nuevo?",
    a: "Necesitas agregar ese dispositivo a tu cuenta. Desde un dispositivo que ya reconoces, entra a identity.ic0.app y añade el nuevo dispositivo desde la sección 'Mis dispositivos'.",
  },
  {
    q: "El sistema me dice que no tengo acceso.",
    a: "El acceso al sistema es solo para usuarios autorizados de Equipos ET. Si crees que deberías tener acceso, contacta al administrador del sistema.",
  },
];

export default function LoginPage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);
  const [openItem, setOpenItem] = useState<number | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo card */}
        <div className="bg-card border border-border rounded-lg shadow-elevated overflow-hidden">
          {/* Brand header */}
          <div className="px-8 pt-8 pb-6 text-center bg-primary">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white font-display font-bold text-xl leading-tight">
              EquipInv
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Equipos ET · Sistema de Gestión
            </p>
          </div>

          {/* Login body */}
          <div className="px-8 py-7">
            {/* Welcome heading */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-display font-semibold text-foreground leading-snug">
                ¡Bienvenido a Equipos ET!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tu sistema de gestión de repuestos y mantenimiento
              </p>
            </div>

            {/* How access works */}
            <div className="rounded-lg bg-muted/50 border border-border p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Sin contraseña, sin complicaciones
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Usas tu <strong>huella digital</strong>,{" "}
                    <strong>Face ID</strong> o el PIN de tu dispositivo para
                    entrar. No necesitas recordar ninguna contraseña.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Acceso protegido y seguro para tu cuenta
                </p>
              </div>
            </div>

            {/* Guide label above button */}
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Toca el botón para iniciar con tu dispositivo
              </p>
            </div>

            {/* ── Internet Identity button — DO NOT MODIFY ── */}
            <Button
              type="button"
              data-ocid="login.submit_button"
              onClick={login}
              disabled={isInitializing || isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isInitializing
                ? "Iniciando..."
                : isLoggingIn
                  ? "Autenticando..."
                  : "Iniciar sesión"}
            </Button>
            {/* ── end Internet Identity button ── */}

            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              Solo usuarios autorizados de Equipos ET pueden acceder al sistema.
            </p>

            {/* Collapsible help section */}
            <div className="mt-5 border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                data-ocid="login.help_toggle"
                onClick={() => setHelpOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
              >
                <span>¿Necesitas ayuda para entrar?</span>
                {helpOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {helpOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {helpItems.map((item, i) => (
                    <div key={item.q} className="px-4">
                      <button
                        type="button"
                        data-ocid={`login.help_item.${i + 1}`}
                        onClick={() => setOpenItem(openItem === i ? null : i)}
                        className="w-full flex items-center justify-between py-3 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        <span>{item.q}</span>
                        {openItem === i ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 ml-2" />
                        )}
                      </button>
                      {openItem === i && (
                        <p className="text-xs text-muted-foreground pb-3 leading-relaxed">
                          {item.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Equipos ET.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            Powered by caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
