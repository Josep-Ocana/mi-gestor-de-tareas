import type { InsertTag, Tag, UpdateTag } from "../types/tag.types";
import { supabase } from "./supabase/client";

export const getTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase.from("tags").select("*");
  if (error) throw error;
  return data ?? [];
};

export const getTagById = async (id: Tag["id"]): Promise<Tag | null> => {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createTag = async (tag: InsertTag): Promise<Tag> => {
  const { data, error } = await supabase
    .from("tags")
    .insert(tag)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTag = async (
  id: Tag["id"],
  tag: UpdateTag,
): Promise<Tag> => {
  const { data, error } = await supabase
    .from("tags")
    .update(tag)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data!;
};

export const deleteTag = async (id: Tag["id"]): Promise<void> => {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
};
