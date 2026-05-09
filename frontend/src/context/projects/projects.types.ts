import type {
  InsertProject,
  Project,
  UpdateProject,
} from "../../types/project.types";

export type ProjectState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

export type ProjectAction =
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "CREATE_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: Project["id"] }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type ProjectContextType = {
  state: ProjectState;
  getProjects: () => Promise<void>;
  createProject: (project: InsertProject) => Promise<void>;
  updateProject: (id: Project["id"], project: UpdateProject) => Promise<void>;
  deleteProject: (id: Project["id"]) => Promise<void>;
};
