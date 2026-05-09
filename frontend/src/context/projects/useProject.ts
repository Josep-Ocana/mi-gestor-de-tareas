import { useContext } from "react";
import { ProjectContext } from "./ProjectContext";

// HOOK - useProject para consumir el contexto
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context)
    throw new Error("useProject debe usarse dentro de ProjectProvider");
  return context;
}
