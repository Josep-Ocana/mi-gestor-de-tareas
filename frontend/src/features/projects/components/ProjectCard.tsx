import { useProject } from "../../../context/projects/useProject";
import type { Project } from "../../../types/project.types";

type ProjectCardProps = {
  project: Project;
  onEdit: (project: Project) => void;
};

export const ProjectCard = ({ project, onEdit }: ProjectCardProps) => {
  const { deleteProject } = useProject();
  return (
    <div>
      <div
        key={project.id}
        role="listitem"
        className="mb-3 rounded-lg border-l-4 border-primary bg-white p-4 shadow-sm dark:bg-gray-700"
      >
        <div className="font-semibold text-slate-800 dark:text-gray-100">
          {project.name}
        </div>
        <div className="text-sm text-slate-500 dark:text-gray-400">
          {project.description}
        </div>
        <div className="flex justify-between"></div>
        <div>
          <button
            aria-label={`Eliminar proyecto: ${project.name}`}
            className="mt-3 inline-flex rounded-full bg-danger hover:bg-danger-hover  px-2.5 py-1 text-xs font-medium text-gray-300 cursor-pointer"
            onClick={() => deleteProject(project.id)}
          >
            Eliminar
          </button>
          <button
            aria-label={`Editar proyecto: ${project.name}`}
            className="mt-3 inline-flex rounded-full bg-primary hover:bg-primary-hover px-2.5 py-1 text-xs font-medium text-gray-300 cursor-pointer"
            onClick={() => onEdit(project)}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};
