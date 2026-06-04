import type {
  InsertTask,
  Task,
  TaskWithTags,
  UpdateTask,
} from "../../types/task.types";

// TYPES - TaskState, TaskAction, TaskContextType
export type TaskState = {
  tasks: TaskWithTags[];
  loading: boolean;
  error: string | null;
};

export type TaskAction =
  | { type: "SET_TASKS"; payload: TaskWithTags[] }
  | { type: "CREATE_TASK"; payload: TaskWithTags }
  | { type: "UPDATE_TASK"; payload: TaskWithTags }
  | { type: "DELETE_TASK"; payload: Task["id"] }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type TaskContextType = {
  state: TaskState;
  getTasks: () => Promise<void>;
  createTask: (task: InsertTask) => Promise<TaskWithTags>;
  updateTask: (id: Task["id"], task: UpdateTask) => Promise<void>;
  deleteTask: (id: Task["id"]) => Promise<void>;
};
