import type React from "react";
import { createContext, useContext, useState } from "react";
import type { Branch } from "../types";

type ActiveBranch = Branch | "all";

interface BranchContextValue {
  activeBranch: ActiveBranch;
  setActiveBranch: (branch: ActiveBranch) => void;
}

const BranchContext = createContext<BranchContextValue>({
  activeBranch: "all",
  setActiveBranch: () => {},
});

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [activeBranch, setActiveBranch] = useState<ActiveBranch>("all");
  return (
    <BranchContext.Provider value={{ activeBranch, setActiveBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  return useContext(BranchContext);
}
