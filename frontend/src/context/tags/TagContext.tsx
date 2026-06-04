import { createContext, useEffect, useReducer } from "react";
import {
  addTagToTask as addTagToTaskService,
  createTag as createTagService,
  deleteTag as deleteTagService,
  getTagsByTaskId as getTagsByTaskIdService,
  getTags as getTagsService,
  removeTagFromTask as removeTagFromTaskService,
  updateTag as updateTagService,
} from "../../services/tags.service";
import type { InsertTag, Tag, UpdateTag } from "../../types/tag.types";
import type { Task } from "../../types/task.types";
import { tagReducer } from "./tags.reducer";
import type { TagContextType, TagState } from "./tags.types";

// CONTEXT
export const TagContext = createContext<TagContextType | null>(null);

// PROVIDER
const initialState: TagState = {
  tags: [],
  loading: true,
  error: null,
};

export function TagProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tagReducer, initialState);

  // useEffect para obtener los proyectos
  useEffect(() => {
    const loadTags = async () => {
      try {
        dispatch({ type: "SET_LOADING" });
        const tags = await getTagsService();
        dispatch({ type: "SET_TAGS", payload: tags });
      } catch {
        dispatch({
          type: "SET_ERROR",
          payload: "Error al cargar las etiquetas",
        });
      }
    };
    loadTags();
  }, []);

  // Functions
  const getTags = async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const tags = await getTagsService();
      dispatch({ type: "SET_TAGS", payload: tags });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar las etiquetas" });
    }
  };

  const createTag = async (tag: InsertTag): Promise<Tag | void> => {
    try {
      dispatch({ type: "SET_LOADING" });
      const newTag = await createTagService(tag);
      dispatch({ type: "CREATE_TAG", payload: newTag });
      return newTag;
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Error al crear la etiqueta" });
    }
  };

  const updateTag = async (id: Tag["id"], tag: UpdateTag) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const updatedTag = await updateTagService(id, tag);
      dispatch({ type: "UPDATE_TAG", payload: updatedTag });
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: "Error al actualizar la etiqueta",
      });
    }
  };

  const deleteTag = async (id: Tag["id"]) => {
    try {
      dispatch({ type: "SET_LOADING" });
      await deleteTagService(id);
      dispatch({ type: "DELETE_TAG", payload: id });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Error al eliminar la etiqueta" });
    }
  };

  const getTagsByTaskId = async (taskId: Task["id"]) => {
    try {
      return await getTagsByTaskIdService(taskId);
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Error al obtener la etiqueta por la Id de la tarea",
      });
      return [];
    }
  };

  const addTagToTask = async (taskId: Task["id"], tagId: Tag["id"]) => {
    try {
      await addTagToTaskService(taskId, tagId);
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Error al añadir la etiqueta a la tarea",
      });
    }
  };

  const removeTagFromTask = async (taskId: Tag["id"], tagId: Tag["id"]) => {
    try {
      await removeTagFromTaskService(taskId, tagId);
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Error al eliminar la etiqueta de la tarea",
      });
    }
  };

  return (
    <TagContext.Provider
      value={{
        state,
        getTags,
        createTag,
        updateTag,
        deleteTag,
        getTagsByTaskId,
        addTagToTask,
        removeTagFromTask,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}
