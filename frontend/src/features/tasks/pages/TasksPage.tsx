import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { useProject } from "../../../context/projects/useProject";
import { useTag } from "../../../context/tags/useTag";
import { useTask } from "../../../context/tasks/useTask";
import type { Tag } from "../../../types/tag.types";
import type { TaskWithTags } from "../../../types/task.types";
import { statusLabels } from "../../../utils/task.utils";
import { TaskCard } from "../components/TaskCard";
import TaskFilters from "../components/TaskFilters";

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
  const {
    state: { tags },
    createTag,
    addTagToTask,
    removeTagFromTask,
  } = useTag();
  // EditTasks
  const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");

  // Tags
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const filteredTasks = state.tasks
    .filter((task) => (filterStatus ? task.status === filterStatus : true))
    .filter((task) =>
      filterProject ? task.project_id === filterProject : true,
    );

  const onStatusChange = (status: string) => {
    setFilterStatus(status);
  };
  const onProjectChange = (project: string) => {
    setFilterProject(project);
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterProject("");
  };

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

        const previousTagIds = editingTask.tags.map((tag) => tag.id);
        const selectedTagIds = selectedTags.map((tag) => tag.id);

        const tagsToAdd = selectedTags.filter(
          (tag) => !previousTagIds.includes(tag.id),
        );

        const tagsToRemove = editingTask.tags.filter(
          (tag) => !selectedTagIds.includes(tag.id),
        );

        await Promise.all([
          ...tagsToAdd.map((tag) => addTagToTask(editingTask.id, tag.id)),
          ...tagsToRemove.map((tag) =>
            removeTagFromTask(editingTask.id, tag.id),
          ),
        ]);

        await getTasks();
      } else {
        const newTask = await createTask({
          ...data,
          project_id: data.project_id || null,
          owner_id: authState.user!.id,
        });

        await Promise.all(
          selectedTags.map((tag) => addTagToTask(newTask.id, tag.id)),
        );
        await getTasks();
      }
      reset(initialValues);
      setSelectedTags([]);
      setNewTagInput("");
      setEditingTask(null);
    } catch {
      // error ya se muestra via state.error
    }
  };

  const handleEdit = (task: TaskWithTags) => {
    setEditingTask(task);
    setSelectedTags(task.tags ?? []);
    reset({
      title: task.title,
      description: task.description ?? "",
      status: task.status as "todo",
      project_id: task.project_id ?? "",
    });
  };

  const handleAddTag = async (tagId: Tag["id"]) => {
    const tag = tags.find((t) => t.id === tagId);
    if (tag && !selectedTags.find((t) => t.id === tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async (name: string) => {
    const newTag = await createTag({
      name,
      owner_id: authState.user!.id,
    });
    if (newTag) {
      setSelectedTags([...selectedTags, newTag]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
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
                Descripción
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
                Proyecto
              </label>
              <select
                id="project"
                {...register("project_id")}
                className="w-full rounded-lg border border-border bg-main-bg text-main-text px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sin Proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col mb-5 gap-2">
              <label htmlFor="tag" className="dark:text-main-text/80">
                Etiquetas
              </label>
              <div className="flex justify-between gap-5">
                {/* Selector de tags existentes */}
                <select
                  onChange={(e) => handleAddTag(e.target.value)}
                  value=""
                  className="w-full rounded-lg border border-border bg-card-bg text-main-text px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona una tag existente...</option>
                  {tags
                    .filter((tag) => !selectedTags.find((s) => s.id === tag.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Input para nueva tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newTagInput.trim()) {
                        handleCreateTag(newTagInput.trim());
                        setNewTagInput("");
                      }
                    }
                  }}
                  placeholder="O escribe una tag nueva..."
                  className="flex-1 rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTagInput.trim()) {
                      handleCreateTag(newTagInput.trim());
                      setNewTagInput("");
                    }
                  }}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-3 text-sm font-medium text-white cursor-pointer"
                >
                  Crear
                </button>
              </div>

              {/* Pills de tags seleccionadas */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        className="cursor-pointer hover:text-danger"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
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
          <TaskFilters
            filterStatus={filterStatus}
            filterProject={filterProject}
            onClearFilters={handleClearFilters}
            onStatusChange={onStatusChange}
            onProjectChange={onProjectChange}
          />
          {state.tasks.length === 0 ? (
            <h2 className="py-12 text-center text-sm text-main-text/50">
              <span aria-hidden="true" className="text-2xl">
                📝
              </span>
              <span className="block">Añade una tarea</span>
            </h2>
          ) : filteredTasks.length === 0 ? (
            <p>No hay tareas con los filtros seleccionados</p>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold text-main-text dark:text-main-text/90">
                Lista de tareas
              </h2>
              <div role="list">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
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
