import type { TaskAction, TaskState } from "./tasks.types";

// 2. REDUCER
export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_TASKS":
      return {
        ...state,
        loading: false,
        error: null,
        tasks: action.payload,
      };
    case "CREATE_TASK":
      return {
        ...state,
        loading: false,
        error: null,
        tasks: [...state.tasks, action.payload],
      };
    case "UPDATE_TASK":
      return {
        ...state,
        loading: false,
        error: null,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        ),
      };
    case "DELETE_TASK":
      return {
        ...state,
        loading: false,
        error: null,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
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
