import { Pencil, Trash2 } from "lucide-react";
import { useProject } from "../../../context/projects/useProject";
import type { Project } from "../../../types/project.types";

type ProjectCardProps = {
  project: Project;
  onEdit: (project: Project) => void;
};

export const ProjectCard = ({ project, onEdit }: ProjectCardProps) => {
  const { deleteProject } = useProject();
  return (
    <div
      key={project.id}
      role="listitem"
      className="relative mb-3 rounded-lg border-l-4 border-primary bg-card-bg p-4 shadow-sm"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          aria-label={`Editar proyecto: ${project.name}`}
          onClick={() => onEdit(project)}
          className="cursor-pointer rounded p-1.5 text-main-text/50 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Pencil size={16} />
        </button>
        <button
          aria-label={`Eliminar proyecto: ${project.name}`}
          onClick={() => deleteProject(project.id)}
          className="cursor-pointer rounded p-1.5 text-main-text/50 transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="font-semibold text-main-text">
        {project.name}
      </div>
      <div className="text-sm text-main-text/60">
        {project.description}
      </div>
    </div>
  );
};
