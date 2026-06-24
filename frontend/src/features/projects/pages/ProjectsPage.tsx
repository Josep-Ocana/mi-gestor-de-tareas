import { zodResolver } from "@hookform/resolvers/zod";
import { FolderKanban, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { useProject } from "../../../context/projects/useProject";
import type { Project } from "../../../types/project.types";
import { ProjectCard } from "../components/ProjectCard";

const projectSchema = z.object({
  name: z.string().min(1, "El titulo es obligatorio"),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectsPage() {
  const { state, getProjects, createProject, updateProject } = useProject();
  const { state: authState } = useAuth();

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  const initialValues: ProjectFormData = {
    name: "",
    description: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await createProject({
          ...data,
          owner_id: authState.user!.id,
        });
      }
      reset(initialValues);
      setEditingProject(null);
    } catch {
      // error ya se muestra via state.error
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description ?? "",
    });
  };

  return (
    <main className="min-h-dvh bg-main-bg px-4 py-8 text-main-text sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section
          id="form"
          aria-label="Formulario de Proyecto"
          className="rounded-xl border border-border/40 bg-card-bg p-5 lg:sticky lg:top-28 lg:self-start"
        >
          <form
            key={editingProject?.id ?? "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            aria-busy={state.loading}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-page-project">
                  {editingProject ? "Edicion" : "Nuevo proyecto"}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-main-text">
                  {editingProject ? "Editar proyecto" : "Crear proyecto"}
                </h1>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-page-project/10 text-page-project">
                <Plus aria-hidden="true" size={20} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-main-text/75"
              >
                Nombre del proyecto
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                aria-required="true"
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Añade un titulo"
                className="w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0"
              />
              {errors.name && (
                <span
                  id="name-error"
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-main-text/75"
              >
                Descripcion
              </label>
              <input
                id="description"
                type="text"
                {...register("description")}
                aria-invalid={errors.description ? "true" : undefined}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                placeholder="Añade una descripcion"
                className="w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0"
              />
              {errors.description && (
                <span
                  id="description-error"
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.description.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={state.loading}
              aria-busy={state.loading}
              className="mt-1 w-full rounded-md bg-[#111111] py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state.loading
                ? "Guardando..."
                : editingProject
                  ? "Guardar cambios"
                  : "Crear proyecto"}
            </button>
          </form>
        </section>

        <section
          id="project-list"
          aria-label="Lista de Proyectos"
          aria-live="polite"
          className="min-w-0 rounded-xl border border-border/40 bg-card-bg p-4 sm:p-6"
        >
          <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-page-project">
                Mapa de trabajo
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-main-text">
                Proyectos
              </h2>
            </div>
            <p className="text-sm text-main-text/55">
              {state.projects.length} activos
            </p>
          </div>

          {state.projects.length <= 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-border/40 bg-main-bg p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-xl bg-page-project/10 text-page-project">
                <FolderKanban aria-hidden="true" size={32} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-main-text">
                Todavia no hay proyectos
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-main-text/55">
                Crea un proyecto para agrupar tareas, medir avance y mantener
                cada frente de trabajo en su sitio.
              </p>
              <a
                href="#form"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[0.98]"
              >
                <Plus aria-hidden="true" size={16} />
                Crear proyecto
              </a>
            </div>
          ) : (
            <div
              role="list"
              className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {state.projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  isFeatured={index === 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
