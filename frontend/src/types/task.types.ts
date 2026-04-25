import type { Database } from "./supabase.types";

// Tipos base extraídos del esquema
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskTag = Database["public"]["Tables"]["task_tags"]["Row"];

// Tipos para insertar
export type InsertTask = Database["public"]["Tables"]["tasks"]["Insert"];
export type InsertProject = Database["public"]["Tables"]["projects"]["Insert"];
export type InsertTag = Database["public"]["Tables"]["tags"]["Insert"];

// Tipos para actualizar
export type UpdateTask = Database["public"]["Tables"]["tasks"]["Update"];
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"];

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
