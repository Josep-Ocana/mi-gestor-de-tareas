import { createContext, useContext, useEffect, useReducer } from "react";
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTasks as fetchTasks,
  updateTask as updateTaskService,
} from "../services/supabase/tasks.service";
import type { InsertTask, Task, UpdateTask } from "../types/task.types";

// 1.TYPES - TaskState, TaskAction, TaskContextType
export type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "CREATE_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: Task["id"] }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

type TaskContextType = {
  state: TaskState;
  getTasks: () => Promise<void>;
  createTask: (task: InsertTask) => Promise<void>;
  updateTask: (id: Task["id"], task: UpdateTask) => Promise<void>;
  deleteTask: (id: Task["id"]) => Promise<void>;
};

// 2. REDUCER
function taskReducer(state: TaskState, action: TaskAction): TaskState {
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

// 3. CONTEXT
const TaskContext = createContext<TaskContextType | null>(null);

// 4. PROVIDER
const initialState: TaskState = {
  tasks: [],
  loading: true,
  error: null,
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // useEffect para obtener las tareas
  useEffect(() => {
    const loadTasks = async () => {
      try {
        dispatch({ type: "SET_LOADING" });
        const tasks = await fetchTasks();
        dispatch({ type: "SET_TASKS", payload: tasks });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error al cargar las tareas" });
      }
    };
    loadTasks();
  }, []);

  // Functions
  const getTasks = async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const tasks = await fetchTasks();
      dispatch({ type: "SET_TASKS", payload: tasks });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar las tareas" });
    }
  };
  const createTask = async (task: InsertTask) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const newTask = await createTaskService(task);
      dispatch({ type: "CREATE_TASK", payload: newTask });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al crear la nueva tarea" });
    }
  };

  const updateTask = async (id: Task["id"], task: UpdateTask) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const updatedTask = await updateTaskService(id, task);
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al actualizar la tarea" });
    }
  };

  const deleteTask = async (id: Task["id"]) => {
    try {
      dispatch({ type: "SET_LOADING" });
      await deleteTaskService(id);
      dispatch({ type: "DELETE_TASK", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al eliminar tarea" });
    }
  };

  return (
    <TaskContext.Provider
      value={{ state, getTasks, createTask, updateTask, deleteTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// 5. HOOK
export function useTask() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask debe usarse dentro de TaskProvider");
  return context;
}
