import { Filter, X } from "lucide-react";
import { useProject } from "../../../context/projects/useProject";
import { statusLabels } from "../../../utils/task.utils";

type TaskFiltersProps = {
  filterStatus: string;
  filterProject: string;
  onClearFilters: () => void;
  onStatusChange: (value: string) => void;
  onProjectChange: (value: string) => void;
};

export default function TaskFilters({
  filterStatus,
  filterProject,
  onClearFilters,
  onStatusChange,
  onProjectChange,
}: TaskFiltersProps) {
  const {
    state: { projects },
  } = useProject();

  const hasActiveFilters = filterStatus !== "" || filterProject !== "";

  return (
    <div className="mb-6 rounded-xl border border-border/40 bg-main-bg p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-main-text/40" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-main-text/50">
            Filtros
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="filter-status"
            className="text-xs font-medium text-main-text/60"
          >
            Estado
          </label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0"
          >
            <option value="">Todos</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="filter-project"
            className="text-xs font-medium text-main-text/60"
          >
            Proyecto
          </label>
          <select
            id="filter-project"
            value={filterProject}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0"
          >
            <option value="">Todos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
