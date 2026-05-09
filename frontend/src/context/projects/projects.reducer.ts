import type { ProjectAction, ProjectState } from "./projects.types";

// REDUCER - función que maneja las acciones
export function projectReducer(
  state: ProjectState,
  action: ProjectAction,
): ProjectState {
  switch (action.type) {
    case "SET_PROJECTS":
      return {
        ...state,
        loading: false,
        error: null,
        projects: action.payload,
      };
    case "CREATE_PROJECT":
      return {
        ...state,
        loading: false,
        error: null,
        projects: [...state.projects, action.payload],
      };
    case "UPDATE_PROJECT":
      return {
        ...state,
        loading: false,
        error: null,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project,
        ),
      };
    case "DELETE_PROJECT":
      return {
        ...state,
        loading: false,
        error: null,
        projects: state.projects.filter(
          (project) => project.id !== action.payload,
        ),
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
