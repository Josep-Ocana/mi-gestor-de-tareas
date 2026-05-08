import { useContext } from "react";
import { AuthContext } from "./AuthContext";

// 5. HOOK - useAuth para consumir el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
