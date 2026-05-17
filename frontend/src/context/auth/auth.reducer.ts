import type { AuthAction, AuthState } from "./auth.types";

// REDUCER - función que maneja las acciones
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        loading: false,
        error: null,
      };

    case "UPDATE_PROFILE":
      return {
        ...state,
        profile: action.payload,
      };

    case "SIGN_OUT":
      return {
        ...state,
        user: null,
        profile: null,
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
