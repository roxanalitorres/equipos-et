import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export interface SecondDeviceGuideModalProps {
  principalId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SecondDeviceGuideModal({
  principalId,
  isOpen,
  onClose,
}: SecondDeviceGuideModalProps) {
  const [accordionOpen, setAccordionOpen] = useState(false);

  if (!isOpen) return null;

  const handleDone = () => {
    localStorage.removeItem(`segundo_dispositivo_pendiente_${principalId}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50"
      data-ocid="second_device_guide.dialog"
    >
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-xl font-display font-bold text-foreground">
            ¿Quieres agregar un segundo dispositivo?
          </h2>
          <button
            type="button"
            data-ocid="second_device_guide.close_button"
            aria-label="Cerrar"
            className="text-muted-foreground hover:text-foreground transition-colors ml-4 flex-shrink-0"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t border-border" />

        <div className="px-6 py-5 flex flex-col gap-5">
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
              data-ocid="second_device_guide.accordion_toggle"
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
                  <li>Inicia sesión con el mismo dispositivo que usas ahora</li>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              data-ocid="second_device_guide.done_button"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleDone}
            >
              Ya lo hice
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="second_device_guide.skip_button"
              className="flex-1"
              onClick={onClose}
            >
              Omitir por ahora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
