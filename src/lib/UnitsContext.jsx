import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_UNITS } from "@/lib/weather/units";

const STORAGE_KEY = "ynk_units_v1";
const UnitsContext = createContext(null);

function loadUnits() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return { ...DEFAULT_UNITS, ...(parsed || {}) };
  } catch {
    return { ...DEFAULT_UNITS };
  }
}

export function UnitsProvider({ children }) {
  const [units, setUnitsState] = useState(loadUnits);

  const value = useMemo(() => {
    const setUnits = (patch) => {
      setUnitsState((current) => {
        const next = { ...current, ...patch };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    };
    return { units, setUnits };
  }, [units]);

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (!context) {
    return { units: DEFAULT_UNITS, setUnits: () => {} };
  }
  return context;
}
