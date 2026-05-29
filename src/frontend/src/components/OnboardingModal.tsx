import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";

export interface OnboardingModalProps {
  principalId: string;
  onComplete: () => void;
}

export default function OnboardingModal({
  principalId,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [didAddDevice, setDidAddDevice] = useState<boolean | null>(null);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const goToStep3 = (added: boolean) => {
    setDidAddDevice(added);
    if (!added) {
      localStorage.setItem(
        `segundo_dispositivo_pendiente_${principalId}`,
        "true",
      );
    }
    // Mark onboarding as completed when reaching step 3
    localStorage.setItem(`onboarding_completado_${principalId}`, "true");
    setStep(3);
  };

  const steps = [
    { label: "Bienvenida" },
    { label: "Protege tu acceso" },
    { label: "¡Listo!" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50"
      data-ocid="onboarding.dialog"
    >
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
        {/* Progress bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            {steps.map((s, i) => {
              const num = i + 1;
              const isActive = num === step;
              const isDone = num < step;
              return (
                <React.Fragment key={s.label}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isDone
                          ? "bg-[oklch(var(--success,62%_0.2_145))] text-white"
                          : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? "✓" : num}
                    </div>
                    <span
                      className={`text-[10px] leading-none whitespace-nowrap ${
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mb-4 transition-colors ${
                        num < step ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div
            className="px-6 py-8 flex flex-col items-center text-center gap-4"
            data-ocid="onboarding.step1.panel"
          >
            <span className="text-6xl" role="img" aria-label="Bienvenida">
              👋
            </span>
            <h2 className="text-2xl font-display font-bold text-foreground">
              ¡Bienvenido a Equipos E.T!
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
              Ya tienes acceso al sistema. Te mostramos cómo proteger tu cuenta
              en dos pasos rápidos.
            </p>
            <Button
              type="button"
              data-ocid="onboarding.step1.next_button"
              className="mt-2 px-8"
              onClick={() => setStep(2)}
            >
              Siguiente →
            </Button>
          </div>
        )}

        {/* Step 2 — Protect access */}
        {step === 2 && (
          <div
            className="px-6 py-6 flex flex-col gap-5"
            data-ocid="onboarding.step2.panel"
          >
            <h2 className="text-xl font-display font-bold text-foreground">
              ¿Quieres agregar un segundo dispositivo?
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Si algún día pierdes o cambias tu celular o computadora, podrías
              perder el acceso al sistema. Para evitarlo puedes registrar un
              segundo dispositivo — por ejemplo, tu celular{" "}
              <span className="font-semibold">Y</span> tu laptop.
            </p>

            {/* Yellow note */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
              <span className="font-semibold">💡 Nota:</span> Esto es opcional.
              Puedes hacerlo ahora o en cualquier momento desde tu perfil.
            </div>

            {/* Accordion */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                data-ocid="onboarding.step2.accordion_toggle"
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setAccordionOpen((v) => !v)}
                aria-expanded={accordionOpen}
              >
                <span>Ver cómo hacerlo</span>
                {accordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {accordionOpen && (
                <div className="px-4 pb-4 pt-1 bg-muted/30">
                  <ol className="space-y-2 text-sm text-foreground list-decimal list-inside">
                    <li>
                      Abre{" "}
                      <a
                        href="https://identity.ic0.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        https://identity.ic0.app
                      </a>{" "}
                      en una nueva pestaña
                    </li>
                    <li>
                      Inicia sesión con el mismo dispositivo que usas ahora
                    </li>
                    <li>
                      Ve a la sección{" "}
                      <span className="font-medium">Mis dispositivos</span>
                    </li>
                    <li>
                      Presiona{" "}
                      <span className="font-medium">
                        Agregar nuevo dispositivo
                      </span>
                    </li>
                    <li>Sigue las instrucciones en el nuevo dispositivo</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                type="button"
                data-ocid="onboarding.step2.done_button"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => goToStep3(true)}
              >
                Ya lo hice
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="onboarding.step2.skip_button"
                className="flex-1"
                onClick={() => goToStep3(false)}
              >
                Omitir por ahora
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div
            className="px-6 py-8 flex flex-col items-center text-center gap-4"
            data-ocid="onboarding.step3.panel"
          >
            <span className="text-6xl" role="img" aria-label="Listo">
              ✅
            </span>
            <h2 className="text-2xl font-display font-bold text-foreground">
              ¡Todo listo!
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
              {didAddDevice
                ? "Tu cuenta está protegida. Puedes ingresar desde cualquier dispositivo registrado."
                : "Recuerda que puedes agregar un segundo dispositivo cuando quieras desde tu perfil en el menú superior."}
            </p>
            <Button
              type="button"
              data-ocid="onboarding.step3.enter_button"
              className="mt-2 px-8"
              onClick={onComplete}
            >
              Ir al sistema
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
