import type { Session } from "@supabase/supabase-js";
import { createContext, useEffect, useReducer } from "react";
import { updateProfile as updateProfileService } from "../../services/profile.service";
import { supabase } from "../../services/supabase/client";
import type { UpdateProfile } from "../../types/profile.types";
import { authReducer } from "./auth.reducer";
import type { AuthContextType, AuthState } from "./auth.types";

// CONTEXT - createContext
export const AuthContext = createContext<AuthContextType | null>(null);

// PROVIDER - useReducer, useEffect (recuperar sesión), funciones signIn, signOut, signUp
const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true, // true porque al arrancar estamos comprobando la sesión
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // useEffect para recuperar la sesión al arrancar
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error al obtener el perfil:", error);
        return null;
      }
    };

    const syncAuthState = async (session: Session | null) => {
      if (!isMounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (!isMounted) return;
        dispatch({
          type: "SET_USER",
          payload: { user: session.user, profile },
        });
      } else {
        dispatch({ type: "SIGN_OUT" });
      }
    };

    const initializeSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        await syncAuthState(session);
      } catch (error) {
        if (!isMounted) return;
        console.error("Error al recuperar la sesión:", error);
        dispatch({
          type: "SET_ERROR",
          payload: "Error al recuperar la sesión",
        });
      }
    };

    // 1. Comprobar sesión activa al arrancar
    void initializeSession();

    // 2. Escuchar cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuthState(session);
    });

    // 3. Limpiar la suscripción al desmontar
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al iniciar sesión" });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cerrar sesión" });
      console.error(error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        await updateProfileService(data.user.id, { username });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al registrarse" });
      throw error;
    }
  };

  const updateProfile = async (profile: UpdateProfile) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const updateProfile = await updateProfileService(state.user!.id, profile);
      dispatch({ type: "UPDATE_PROFILE", payload: updateProfile });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al actualizar el perfil" });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ state, signIn, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
