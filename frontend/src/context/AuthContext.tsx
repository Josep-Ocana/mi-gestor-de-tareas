import type { User } from "@supabase/supabase-js";
import { createContext, useEffect, useReducer } from "react";
import { supabase } from "../services/supabase/client";

// 1. TYPES - AuthState, AuthAction, AuthContextType
export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "SIGN_OUT" }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

type AuthContextType = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// 2. REDUCER - función que maneja las acciones
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case "SIGN_OUT":
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}
// 3. CONTEXT - createContext
const AuthContext = createContext<AuthContextType | null>(null);

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
// 5. HOOK - useAuth para consumir el contexto
