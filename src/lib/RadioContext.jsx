import { createContext, useContext } from "react";

const RadioContext = createContext(null);

export function RadioProvider({ children }) {
  return <RadioContext.Provider value={null}>{children}</RadioContext.Provider>;
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) throw new Error("useRadio must be used within RadioProvider");
  return context;
}
