import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { useProject } from "../../../context/projects/useProject";
import type { Project } from "../../../types/project.types";
import { ProjectCard } from "../components/ProjectCard";

const projectSchema = z.object({
  name: z.string().min(1, "El título es obligatorio"),
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
        reset();
        setEditingProject(null);
      }
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
    <>
      <main className="min-h-screen bg-main-bg px-4 py-8 lg:grid lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-6 dark:main-bg">
        <section
          id="form"
          aria-label="Formulario de Proyecto"
          className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
        >
          <form
            key={editingProject?.id ?? "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md rounded-xl bg-card-bg p-6 shadow"
            aria-busy={state.loading}
          >
            <div className="mb-6 flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-main-text">
                {editingProject ? "Editar Proyecto" : "Crea un nuevo proyecto"}
              </h1>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="name" className="text-main-text/80">
                Nombre Proyecto:
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                aria-required="true"
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Añade un título"
                className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && (
                <span
                  id="name-error"
                  role="alert"
                  className="text-danger text-sm"
                >
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="description" className="text-main-text/80">
                Descripción:
              </label>
              <input
                id="description"
                type="text"
                {...register("description")}
                aria-invalid={errors.description ? "true" : undefined}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                placeholder="Añade una descripción de la tarea"
                className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.description && (
                <span
                  id="description-error"
                  role="alert"
                  className="text-danger text-sm"
                >
                  {errors.description.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={state.loading}
              aria-busy={state.loading}
              className="w-full rounded-lg bg-primary hover:bg-primary-hover py-3 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {state.loading
                ? "Guardando..."
                : editingProject
                  ? "Guardar cambios"
                  : "Crear Proyecto"}
            </button>
          </form>
        </section>
        <section
          id="project-list"
          aria-label="Lista de Proyectos"
          aria-live="polite"
          className="mx-auto mt-6 w-full max-w-md rounded-xl bg-card-bg p-6 shadow lg:mx-0 lg:mt-0 lg:max-w-none lg:justify-self-start"
        >
          {state.projects.length <= 0 ? (
            <h2 className="py-12 text-center text-sm text-main-text/50">
              <span aria-hidden="true" className="text-2xl">
                📝
              </span>
              <span className="block">Añade un proyecto</span>
            </h2>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold text-main-text dark:text-main-text/90">
                Lista de Proyectos
              </h2>
              <div role="list">
                {state.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
