import { createContext, useCallback, useEffect, useReducer } from "react";
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  getProjects as fetchProjects,
  updateProject as updateProjectService,
} from "../../services/projects.service";
import type {
  InsertProject,
  Project,
  UpdateProject,
} from "../../types/project.types";
import { projectReducer } from "./projects.reducer";
import type { ProjectContextType, ProjectState } from "./projects.types";

// CONTEXT
export const ProjectContext = createContext<ProjectContextType | null>(null);

// PROVIDER
const initialState: ProjectState = {
  projects: [],
  loading: true,
  error: null,
};

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const getProjects = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const projects = await fetchProjects();
      dispatch({ type: "SET_PROJECTS", payload: projects });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar los proyectos" });
    }
  }, []);

  // useEffect para obtener los proyectos
  useEffect(() => {
    getProjects();
  }, [getProjects]);

  // Functions

  const createProject = async (project: InsertProject) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const newProject = await createProjectService(project);
      dispatch({ type: "CREATE_PROJECT", payload: newProject });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Error al crear el nuevo projecto",
      });
      throw error;
    }
  };

  const updateProject = async (id: Project["id"], project: UpdateProject) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const updatedProject = await updateProjectService(id, project);
      dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Error al actualizar el projecto",
      });
      throw error;
    }
  };

  const deleteProject = async (id: Project["id"]) => {
    try {
      dispatch({ type: "SET_LOADING" });
      await deleteProjectService(id);
      dispatch({ type: "DELETE_PROJECT", payload: id });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Error al eliminar la el proyecto",
      });
      throw error;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        state,
        getProjects,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
