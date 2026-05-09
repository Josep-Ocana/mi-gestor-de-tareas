import type { Database } from "./supabase.types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type InsertProject = Database["public"]["Tables"]["projects"]["Insert"];
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"];
