import { createContext, useEffect, useReducer } from "react";
import { supabase } from "../../services/supabase/client";
import { authReducer } from "./auth.reducer";
import type { AuthContextType, AuthState } from "./auth.types";

// 3. CONTEXT - createContext
export const AuthContext = createContext<AuthContextType | null>(null);

// 4. PROVIDER - useReducer, useEffect (recuperar sesión), funciones signIn, signOut, signUp
const initialState: AuthState = {
  user: null,
  loading: true, // true porque al arrancar estamos comprobando la sesión
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // useEffect para recuperar la sesión al arrancar
  useEffect(() => {
    // 1. Comprobar sesión activa al arrancar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch({ type: "SET_USER", payload: session.user });
      } else {
        dispatch({ type: "SIGN_OUT" });
      }
    });

    // 2. Escuchar cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch({ type: "SET_USER", payload: session.user });
      } else {
        dispatch({ type: "SIGN_OUT" });
      }
    });

    // 3. Limpiar la siscripción al desmontar
    return () => subscription.unsubscribe();
  }, []);

  // funciones signIn, signOut, signUp
  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) dispatch({ type: "SET_USER", payload: data.user });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al iniciar sesión" });
      console.error(error);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      dispatch({ type: "SET_LOADING" });

      await supabase.auth.signOut();
      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cerrar sesión" });
      console.error(error);
    }
  };

  // Registrarse
  const signUp = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING" });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) dispatch({ type: "SET_USER", payload: data.user });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al registrarse" });
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
