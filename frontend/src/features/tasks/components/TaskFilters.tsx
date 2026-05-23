import { useProject } from "../../../context/projects/useProject";

type TaskFiltersProps = {
  filterStatus: string;
  filterProject: string;
  onStatusChange: (value: string) => void;
  onProjectChange: (value: string) => void;
};

export default function TaskFilters({
  filterStatus,
  filterProject,
  onStatusChange,
  onProjectChange,
}: TaskFiltersProps) {
  const {
    state: { projects },
  } = useProject();

  return (
    <div className="flex justify-between items-center w-full mx-auto rounded-xl bg-main-bg p-6 ">
      <h2 className="text-xl font-semibold text-main-text">Filtrar</h2>
      <div className="flex items-center gap-4">
        <label htmlFor="status" className="dark:text-main-text/80">
          Estado:
        </label>
        <select
          name="status"
          id="status"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-main-bg text-main-text px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos</option>
          <option value="todo">Por hacer</option>
          <option value="in_progress">En progreso</option>
          <option value="done">Completada</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <label htmlFor="project" className="dark:text-main-text/80">
          Proyecto:
        </label>
        <select
          name="project"
          id="project"
          value={filterProject}
          onChange={(e) => onProjectChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-main-bg text-main-text px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
  );
}
