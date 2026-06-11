import type { Profile, UpdateProfile } from "../types/profile.types";
import { supabase } from "./supabase/client";

export const updateProfile = async (
  userId: string,
  profile: UpdateProfile,
): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return data.publicUrl;
};
