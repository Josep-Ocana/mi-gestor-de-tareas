import type { User } from "@supabase/supabase-js";

// 1. TYPES - AuthState, AuthAction, AuthContextType
export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "SIGN_OUT" }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type AuthContextType = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
