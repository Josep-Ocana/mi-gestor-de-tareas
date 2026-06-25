import { Pencil, Tag as TagIcon, Trash2 } from "lucide-react";
import { useTag } from "../../../context/tags/useTag";
import type { Tag } from "../../../types/tag.types";

type TagCardProps = {
  tag: Tag;
  onEdit: (tag: Tag) => void;
};

export const TagCard = ({ tag, onEdit }: TagCardProps) => {
  const { deleteTag } = useTag();
  const color = tag.color ?? "#94a3b8";

  return (
    <article
      role="listitem"
      className="group relative overflow-hidden rounded-xl border border-border/40 bg-card-bg p-5"
    >
      <div className="absolute right-4 top-4 flex gap-1 opacity-100 transition-all duration-300 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <button
          aria-label={`Editar etiqueta: ${tag.name}`}
          onClick={() => onEdit(tag)}
          className="cursor-pointer rounded-md border border-border bg-card-bg p-2 text-main-text/55 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
        >
          <Pencil size={15} />
        </button>
        <button
          aria-label={`Eliminar etiqueta: ${tag.name}`}
          onClick={() => deleteTag(tag.id)}
          className="cursor-pointer rounded-md border border-border bg-card-bg p-2 text-main-text/55 transition-colors duration-200 hover:border-danger/30 hover:bg-danger/10 hover:text-danger active:scale-[0.98]"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="pr-20">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <TagIcon aria-hidden="true" size={15} />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-main-text/35">
            Etiqueta
          </p>
        </div>

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-main-text">
          {tag.name}
        </h3>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <span
          className="inline-block size-4 rounded-full border border-border"
          style={{ backgroundColor: color }}
        />
        <span
          className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {tag.name}
        </span>
      </div>
    </article>
  );
};
