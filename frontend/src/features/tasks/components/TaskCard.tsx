import { Pencil, Trash2 } from "lucide-react";
import { useProject } from "../../../context/projects/useProject";
import { useTask } from "../../../context/tasks/useTask";
import type { Task } from "../../../types/task.types";
import { statusLabels } from "../../../utils/task.utils";

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
};

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { deleteTask } = useTask();

  const {
    state: { projects },
  } = useProject();
  const project = projects.find((project) => project.id === task.project_id);

  return (
    <div
      key={task.id}
      role="listitem"
      className="relative mb-3 rounded-lg border-l-4 border-primary bg-main-bg p-4 shadow-sm"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          aria-label={`Editar tarea: ${task.title}`}
          onClick={() => onEdit(task)}
          className="cursor-pointer rounded p-1.5 text-main-text/50 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Pencil size={16} />
        </button>
        <button
          aria-label={`Eliminar tarea: ${task.title}`}
          onClick={() => deleteTask(task.id)}
          className="cursor-pointer rounded p-1.5 text-main-text/50 transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="font-semibold text-main-text">{task.title}</div>
      <div className="text-sm text-main-text/60">{task.description}</div>
      <div
        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
          task.status === "done"
            ? "bg-success text-success-hover dark:bg-success-hover dark:text-success"
            : task.status === "in_progress"
              ? "bg-progress text-progress-hover dark:bg-progress dark:text-progress-hover"
              : "bg-card-bg text-main-text/70"
        }`}
      >
        {statusLabels[task.status ?? "todo"]}
      </div>
      {project && (
        <div className="mt-3">
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            📁 {project.name}
          </span>
        </div>
      )}
    </div>
  );
};
