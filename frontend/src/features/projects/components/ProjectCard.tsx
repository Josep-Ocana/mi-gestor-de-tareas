import { Layers3, Pencil, Trash2 } from "lucide-react";
import { useProject } from "../../../context/projects/useProject";
import type { Project } from "../../../types/project.types";

type ProjectCardProps = {
  project: Project;
  onEdit: (project: Project) => void;
  isFeatured?: boolean;
};

const accentClasses = [
  "border-l-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  "border-l-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  "border-l-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-200",
  "border-l-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  "border-l-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
];

const getProjectAccent = (id: string) => {
  const index = id
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return accentClasses[index % accentClasses.length];
};

export const ProjectCard = ({
  project,
  onEdit,
  isFeatured = false,
}: ProjectCardProps) => {
  const { deleteProject } = useProject();
  const accent = getProjectAccent(project.id);

  return (
    <article
      role="listitem"
      className={`group relative min-h-44 overflow-hidden rounded-3xl border border-l-4 border-border bg-card-bg p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 ${
        isFeatured ? "md:col-span-2 md:min-h-64 md:p-7" : ""
      } ${accent.split(" ")[0]}`}
    >
      <div
        className={`mb-8 inline-flex size-11 items-center justify-center rounded-2xl ${accent
          .split(" ")
          .slice(1)
          .join(" ")}`}
      >
        <Layers3 aria-hidden="true" size={20} />
      </div>

      <div className="absolute right-4 top-4 flex translate-y-1 gap-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <button
          aria-label={`Editar proyecto: ${project.name}`}
          onClick={() => onEdit(project)}
          className="cursor-pointer rounded-xl border border-border bg-card-bg/90 p-2 text-main-text/55 transition-all duration-300 hover:border-primary/30 hover:bg-primary/10 hover:text-primary active:scale-[0.96]"
        >
          <Pencil size={15} />
        </button>
        <button
          aria-label={`Eliminar proyecto: ${project.name}`}
          onClick={() => deleteProject(project.id)}
          className="cursor-pointer rounded-xl border border-border bg-card-bg/90 p-2 text-main-text/55 transition-all duration-300 hover:border-danger/30 hover:bg-danger/10 hover:text-danger active:scale-[0.96]"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className={isFeatured ? "max-w-xl" : ""}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-main-text/35">
          Proyecto
        </p>
        <h3
          className={`mt-2 font-semibold tracking-tight text-main-text ${
            isFeatured ? "text-3xl" : "text-xl"
          }`}
        >
          {project.name}
        </h3>
        {project.description && (
          <p className="mt-3 text-sm leading-6 text-main-text/58">
            {project.description}
          </p>
        )}
      </div>
    </article>
  );
};
