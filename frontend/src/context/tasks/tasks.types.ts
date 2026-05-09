import type { InsertTask, Task, UpdateTask } from "../../types/task.types";

// TYPES - TaskState, TaskAction, TaskContextType
export type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

export type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "CREATE_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: Task["id"] }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type TaskContextType = {
  state: TaskState;
  getTasks: () => Promise<void>;
  createTask: (task: InsertTask) => Promise<void>;
  updateTask: (id: Task["id"], task: UpdateTask) => Promise<void>;
  deleteTask: (id: Task["id"]) => Promise<void>;
};
