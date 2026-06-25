import { Folder, Pencil, Trash2 } from "lucide-react";
import { useProject } from "../../../context/projects/useProject";
import { useTask } from "../../../context/tasks/useTask";
import type { TaskWithTags } from "../../../types/task.types";
import { getTagColor, statusLabels } from "../../../utils/task.utils";

type TaskCardProps = {
  task: TaskWithTags;
  onEdit: (task: TaskWithTags) => void;
};

const statusClassName = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
};

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { deleteTask } = useTask();

  const {
    state: { projects },
  } = useProject();
  const project = projects.find((project) => project.id === task.project_id);
  const status = task.status ?? "todo";

  return (
    <article
      role="listitem"
      className="group relative overflow-hidden rounded-xl border border-border/40 bg-card-bg p-5"
    >
      <div className="absolute right-4 top-4 flex gap-1 opacity-100 transition-all duration-300 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <button
          aria-label={`Editar tarea: ${task.title}`}
          onClick={() => onEdit(task)}
          className="cursor-pointer rounded-md border border-border bg-card-bg p-2 text-main-text/55 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
        >
          <Pencil size={15} />
        </button>
        <button
          aria-label={`Eliminar tarea: ${task.title}`}
          onClick={() => deleteTask(task.id)}
          className="cursor-pointer rounded-md border border-border bg-card-bg p-2 text-main-text/55 transition-colors duration-200 hover:border-danger/30 hover:bg-danger/10 hover:text-danger active:scale-[0.98]"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="pr-20">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName[status as keyof typeof statusClassName]}`}
          >
            {statusLabels[status]}
          </span>
          {project && (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-main-text/45">
              <Folder aria-hidden="true" size={13} />
              <span className="truncate">{project.name}</span>
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-main-text">
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-2 text-sm leading-6 text-main-text/58">
            {task.description}
          </p>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => {
            const hashColor = getTagColor(tag.id);
            return (
              <span
                key={tag.id}
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium${
                  tag.color ? "" : ` ${hashColor.bg} ${hashColor.text}`
                }`}
                style={
                  tag.color
                    ? {
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }
                    : undefined
                }
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
};
