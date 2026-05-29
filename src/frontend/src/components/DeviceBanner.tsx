import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import SecondDeviceGuideModal from "./SecondDeviceGuideModal";

export default function DeviceBanner() {
  const { identity } = useAuth();
  const principalId = identity?.getPrincipal().toString() ?? "";
  const [guideOpen, setGuideOpen] = useState(false);
  // refreshKey forces a re-read from localStorage after modal closes
  const [_refreshKey, setRefreshKey] = useState(0);

  if (!principalId) return null;

  const isPending =
    localStorage.getItem(`segundo_dispositivo_pendiente_${principalId}`) ===
    "true";

  if (!isPending) return null;

  return (
    <>
      <div
        data-ocid="device_banner.panel"
        className="mx-3 my-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-amber-800"
      >
        <p className="text-xs leading-snug mb-2">
          Aún no tienes un segundo dispositivo registrado. Si pierdes acceso a
          este dispositivo, no podrás ingresar al sistema.
        </p>
        <button
          type="button"
          data-ocid="device_banner.open_guide_button"
          className="text-xs font-semibold underline text-amber-900 hover:text-amber-700 transition-colors"
          onClick={() => setGuideOpen(true)}
        >
          Ver cómo agregar un dispositivo
        </button>
      </div>

      <SecondDeviceGuideModal
        principalId={principalId}
        isOpen={guideOpen}
        onClose={() => {
          setGuideOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </>
  );
}
