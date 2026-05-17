import type { Project } from "./project.types";
import type { Database } from "./supabase.types";
import type { Tag } from "./tag.types";

// Tipos base extraídos del esquema
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskTag = Database["public"]["Tables"]["task_tags"]["Row"];

// Tipos para insertar
export type InsertTask = Database["public"]["Tables"]["tasks"]["Insert"];

// Tipos para actualizar
export type UpdateTask = Database["public"]["Tables"]["tasks"]["Update"];

// Tipos extendidos con relaciones (para cuando haga joins)
export type TaskWithTags = Task & { tags: Tag[] };
export type TaskWithProject = Task & { project: Project | null };
export type TaskComplete = Task & {
  tags: Tag[];
  project: Project | null;
  subtasks: Task[];
};

// Enums
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
