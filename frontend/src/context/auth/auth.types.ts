import type { User } from "@supabase/supabase-js";
import type { Profile } from "../../types/profile.types";

// TYPES - AuthState, AuthAction, AuthContextType
export type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
};

export type AuthAction =
  | { type: "SET_USER"; payload: { user: User; profile: Profile | null } }
  | { type: "UPDATE_PROFILE"; payload: Profile }
  | { type: "SIGN_OUT" }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type AuthContextType = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
