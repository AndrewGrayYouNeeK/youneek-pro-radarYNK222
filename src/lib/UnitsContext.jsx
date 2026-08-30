import { createContext, useContext, useMemo, useState } from "react";
import { loadUnits, saveUnits } from "@/lib/units";

const UnitsContext = createContext(null);

export function UnitsProvider({ children }) {
  const [units, setUnitsState] = useState(() => loadUnits());

  const value = useMemo(
    () => ({
      units,
      setUnits: (patch) => {
        setUnitsState((current) => {
          const next = { ...current, ...patch };
          saveUnits(next);
          return next;
        });
      },
    }),
    [units]
  );

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error("useUnits must be used within a UnitsProvider");
  }
  return context;
}
