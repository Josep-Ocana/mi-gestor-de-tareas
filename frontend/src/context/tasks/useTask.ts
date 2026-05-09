import { useContext } from "react";
import { TaskContext } from "./TaskContext";

// HOOK - useTask para consumir el contexto
export function useTask() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask debe usarse dentro de TaskProvider");
  return context;
}
