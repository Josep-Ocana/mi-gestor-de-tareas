import { useTask } from "../../../context/tasks/useTask";
import type { Task } from "../../../types/task.types";
import { statusLabels } from "../../../utils/task.utils";

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
};

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { deleteTask } = useTask();

  return (
    <div>
      <div
        key={task.id}
        role="listitem"
        className="mb-3 rounded-lg border-l-4 border-primary bg-white p-4 shadow-sm dark:bg-gray-700"
      >
        <div className="font-semibold text-slate-800 dark:text-gray-100">
          {task.title}
        </div>
        <div className="text-sm text-slate-500 dark:text-gray-400">
          {task.description}
        </div>
        <div className="flex justify-between">
          <div
            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              task.status === "done"
                ? "bg-success text-success-hover dark:bg-success-hover dark:text-success"
                : task.status === "in_progress"
                  ? "bg-progress text-progress-hover dark:bg-progress dark:text-progress-hover"
                  : "bg-slate-100 text-slate-700 dark:bg-gray-600 dark:text-gray-300"
            }`}
          >
            {statusLabels[task.status ?? "todo"]}
          </div>
          <div>
            <button
              aria-label={`Eliminar tarea: ${task.title}`}
              className="mt-3 inline-flex rounded-full bg-danger hover:bg-danger-hover  px-2.5 py-1 text-xs font-medium text-gray-300 cursor-pointer"
              onClick={() => deleteTask(task.id)}
            >
              Eliminar
            </button>
            <button
              aria-label={`Editar tarea: ${task.title}`}
              className="mt-3 inline-flex rounded-full bg-primary hover:bg-primary-hover px-2.5 py-1 text-xs font-medium text-gray-300 cursor-pointer"
              onClick={() => onEdit(task)}
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
