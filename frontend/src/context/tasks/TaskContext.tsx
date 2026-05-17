import { createContext, useEffect, useReducer } from "react";
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTasks as fetchTasks,
  updateTask as updateTaskService,
} from "../../services/tasks.service";
import type { InsertTask, Task, UpdateTask } from "../../types/task.types";
import { taskReducer } from "./tasks.reducer";
import type { TaskContextType, TaskState } from "./tasks.types";

// CONTEXT
export const TaskContext = createContext<TaskContextType | null>(null);

// PROVIDER
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
      } catch {
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
    } catch {
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
      throw error;
    }
  };

  const updateTask = async (id: Task["id"], task: UpdateTask) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const updatedTask = await updateTaskService(id, task);
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al actualizar la tarea" });
      throw error;
    }
  };

  const deleteTask = async (id: Task["id"]) => {
    try {
      dispatch({ type: "SET_LOADING" });
      await deleteTaskService(id);
      dispatch({ type: "DELETE_TASK", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al eliminar tarea" });
      throw error;
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
