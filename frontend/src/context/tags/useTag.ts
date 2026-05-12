import { useContext } from "react";
import { TagContext } from "./TagContext";

// HOOK - useTag para consumir el context
export function useTag() {
  const context = useContext(TagContext);
  if (!context) throw new Error("useTag debe usarse dentro de TagProvider");
  return context;
}
