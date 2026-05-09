import type {
  InsertProject,
  Project,
  UpdateProject,
} from "../types/project.types";
import { supabase } from "./supabase/client";

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from("projects").select("*");
  if (error) throw error;
  return data ?? [];
};

export const getProjectById = async (
  id: Project["id"],
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};
export const createProject = async (
  project: InsertProject,
): Promise<Project> => {
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data;
};
export const updateProject = async (
  id: Project["id"],
  project: UpdateProject,
): Promise<Project> => {
  const { data, error } = await supabase
    .from("projects")
    .update(project)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data!;
};

export const deleteProject = async (id: Project["id"]): Promise<void> => {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
};
