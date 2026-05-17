import type { Database } from "./supabase.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type InsertProfile = Database["public"]["Tables"]["profiles"]["Insert"];
export type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"];
