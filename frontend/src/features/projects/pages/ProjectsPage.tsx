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
          className="rounded-3xl border border-border/80 bg-card-bg/80 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur lg:sticky lg:top-28 lg:self-start"
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
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-page-project/10 text-page-project">
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
                placeholder="Anade un titulo"
                className="w-full rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 placeholder:text-main-text/35 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
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
                placeholder="Anade una descripcion"
                className="w-full rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 placeholder:text-main-text/35 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
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
              className="mt-1 w-full rounded-2xl bg-page-project py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-page-project-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
          className="min-w-0 rounded-4xl border border-border/80 bg-card-bg/60 p-4 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-6"
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
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-main-bg/50 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-page-project/10 text-page-project">
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
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-page-project px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-page-project-hover active:scale-[0.98]"
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
