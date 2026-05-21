import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { useProject } from "../../../context/projects/useProject";
import { useTask } from "../../../context/tasks/useTask";
import type { Task } from "../../../types/task.types";
import { TaskCard } from "../components/TaskCard";

const taskSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  project_id: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TasksPage() {
  const { state, getTasks, createTask, updateTask } = useTask();
  const { state: authState } = useAuth();
  const {
    state: { projects },
  } = useProject();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const initialValues: TaskFormData = {
    title: "",
    description: "",
    status: "todo",
    project_id: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask({
          ...data,
          project_id: data.project_id || null,
          owner_id: authState.user!.id,
        });
      }
      reset(initialValues);
      setEditingTask(null);
    } catch {
      // error ya se muestra via state.error
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description ?? "",
      status: task.status as "todo",
      project_id: task.project_id ?? "",
    });
  };

  return (
    <>
      <main className="min-h-screen bg-main-bg px-4 py-8 lg:grid lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-6 dark:main-bg">
        {/* SECCIÓN FORMULARIO */}
        <section
          id="form"
          aria-label="Formulario de tarea"
          className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
        >
          <form
            key={editingTask?.id ?? "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md rounded-xl bg-main-bg p-6 shadow"
            aria-busy={state.loading}
          >
            <div className="mb-6 flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-main-text">
                {editingTask ? "Editar tarea" : "Crea una nueva tarea"}
              </h1>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="title" className="dark:text-main-text/90">
                Título
              </label>
              <input
                id="title"
                type="text"
                {...register("title")}
                aria-required="true"
                aria-invalid={errors.title ? "true" : undefined}
                aria-describedby={errors.title ? "title-error" : undefined}
                placeholder="Añade un título"
                className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.title && (
                <span
                  id="title-error"
                  role="alert"
                  className="text-danger text-sm"
                >
                  {errors.title.message}
                </span>
              )}
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="description" className="dark:text-main-text/80">
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
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="project" className="dark:text-main-text/80">
                Proyecto:
              </label>
              <select id="project" {...register("project_id")}>
                <option value="">Sin Proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {editingTask && (
              <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="status" className="dark:text-main-text/80">
                  Estado:
                </label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full rounded-lg border border-border bg-main-bg text-main-text px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todo">Por hacer</option>
                  <option value="in_progress">En progreso</option>
                  <option value="done">Completada</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={state.loading}
              aria-busy={state.loading}
              className="w-full rounded-lg bg-primary hover:bg-primary-hover py-3 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {state.loading
                ? "Guardando..."
                : editingTask
                  ? "Guardar cambios"
                  : "Crear Tarea"}
            </button>
          </form>
        </section>
        {/* SECCIÓN LISTA DE TAREAS */}
        <section
          id="task-list"
          aria-label="Lista de tareas"
          aria-live="polite"
          className="mx-auto mt-6 w-full max-w-md rounded-xl bg-main-bg p-6 shadow lg:mx-0 lg:mt-0 lg:max-w-none lg:justify-self-start"
        >
          {state.tasks.length <= 0 ? (
            <h2 className="py-12 text-center text-sm text-main-text/50">
              <span aria-hidden="true" className="text-2xl">
                📝
              </span>
              <span className="block">Añade una tarea</span>
            </h2>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold text-main-text dark:text-main-text/90">
                Lista de tareas
              </h2>
              <div role="list">
                {state.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
