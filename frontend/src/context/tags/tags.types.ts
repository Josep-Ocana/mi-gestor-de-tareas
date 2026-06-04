import type { InsertTag, Tag, UpdateTag } from "../../types/tag.types";
import type { Task } from "../../types/task.types";

export type TagState = {
  tags: Tag[];
  loading: boolean;
  error: string | null;
};

export type TagAction =
  | { type: "SET_TAGS"; payload: Tag[] }
  | { type: "CREATE_TAG"; payload: Tag }
  | { type: "UPDATE_TAG"; payload: Tag }
  | { type: "DELETE_TAG"; payload: Tag["id"] }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type TagContextType = {
  state: TagState;
  getTags: () => Promise<void>;
  createTag: (tag: InsertTag) => Promise<Tag | void>;
  updateTag: (id: Tag["id"], tag: UpdateTag) => Promise<void>;
  deleteTag: (id: Tag["id"]) => Promise<void>;
  getTagsByTaskId: (taskId: Task["id"]) => Promise<Tag[]>;
  addTagToTask: (taskId: Tag["id"], tagId: Tag["id"]) => Promise<void>;
  removeTagFromTask: (taskId: Tag["id"], tagId: Tag["id"]) => Promise<void>;
};
