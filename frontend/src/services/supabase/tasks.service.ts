import type { InsertTask, Task, UpdateTask } from "../../types/task.types";
import { supabase } from "./client";

export const getTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw error;
  return data ?? [];
};

export const getTaskById = async (id: Task["id"]): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createTask = async (task: InsertTask): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTask = async (
  id: Task["id"],
  task: UpdateTask,
): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .update(task)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTask = async (id: Task["id"]): Promise<void> => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
};
