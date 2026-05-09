import { useContext } from "react";
import { TaskContext } from "./TaskContext";

// 5. HOOK
export function useTask() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask debe usarse dentro de TaskProvider");
  return context;
}
