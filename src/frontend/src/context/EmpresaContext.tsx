import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const LOGO_KEY = "empresa_logo";

interface EmpresaContextValue {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}

const EmpresaContext = createContext<EmpresaContextValue>({
  logoUrl: null,
  setLogoUrl: () => {},
});

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrlState] = useState<string | null>(() =>
    localStorage.getItem(LOGO_KEY),
  );

  const setLogoUrl = (url: string | null) => {
    if (url === null) {
      localStorage.removeItem(LOGO_KEY);
    } else {
      localStorage.setItem(LOGO_KEY, url);
    }
    setLogoUrlState(url);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOGO_KEY) {
        setLogoUrlState(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <EmpresaContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa(): EmpresaContextValue {
  return useContext(EmpresaContext);
}
