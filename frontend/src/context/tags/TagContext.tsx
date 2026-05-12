import { createContext, useEffect, useReducer } from "react";
import {
  createTag as createTagService,
  deleteTag as deleteTagService,
  getTags as getTagsService,
  updateTag as updateTagService,
} from "../../services/tags.service";
import type { InsertTag, Tag, UpdateTag } from "../../types/tag.types";
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
      } catch (error) {
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
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar las etiquetas" });
    }
  };

  const createTag = async (tag: InsertTag) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const newTag = await createTagService(tag);
      dispatch({ type: "CREATE_TAG", payload: newTag });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al crear la etiqueta" });
    }
  };

  const updateTag = async (id: Tag["id"], tag: UpdateTag) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const updatedTag = await updateTagService(id, tag);
      dispatch({ type: "UPDATE_TAG", payload: updatedTag });
    } catch (error) {
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
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al eliminar la etiqueta" });
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
      }}
    >
      {children}
    </TagContext.Provider>
  );
}
