import { Pencil, Trash2 } from "lucide-react";
import { useTag } from "../../../context/tags/useTag";
import type { Tag } from "../../../types/tag.types";

type TagCardProps = {
  tag: Tag;
  onEdit: (tag: Tag) => void;
};

export function TagCard({ tag, onEdit }: TagCardProps) {
  const { deleteTag } = useTag();

  return (
    <div
      role="listitem"
      className="relative mb-3 rounded-lg border-l-4 border-primary bg-card-bg p-4 shadow-sm"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          aria-label={`Editar etiqueta: ${tag.name}`}
          onClick={() => onEdit(tag)}
          className="cursor-pointer rounded p-1.5 text-main-text/50 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Pencil size={16} />
        </button>
        <button
          aria-label={`Eliminar etiqueta: ${tag.name}`}
          onClick={() => deleteTag(tag.id)}
          className="cursor-pointer rounded p-1.5 text-main-text/50 transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="font-semibold text-main-text">{tag.name}</div>

      <div className="mt-2 flex items-center gap-2">
        <span
          className="inline-block h-4 w-4 rounded-full border border-border"
          style={{ backgroundColor: tag.color ?? "#94a3b8" }}
        />
        <span
          className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${tag.color ?? "#94a3b8"}20`,
            color: tag.color ?? "#94a3b8",
          }}
        >
          {tag.name}
        </span>
      </div>
    </div>
  );
}
