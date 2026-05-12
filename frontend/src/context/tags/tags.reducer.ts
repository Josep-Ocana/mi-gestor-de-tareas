import type { TagAction, TagState } from "./tags.types";

// REDUCER - función que maneja las acciones
export function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case "SET_TAGS":
      return {
        ...state,
        loading: false,
        error: null,
        tags: action.payload,
      };

    case "CREATE_TAG":
      return {
        ...state,
        loading: false,
        error: null,
        tags: [...state.tags, action.payload],
      };

    case "UPDATE_TAG":
      return {
        ...state,
        loading: false,
        error: null,
        tags: state.tags.map((tag) =>
          tag.id === action.payload.id ? action.payload : tag,
        ),
      };

    case "DELETE_TAG":
      return {
        ...state,
        loading: false,
        error: null,
        tags: state.tags.filter((tag) => tag.id !== action.payload),
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
