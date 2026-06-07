import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { useProject } from "../../../context/projects/useProject";
import { useTag } from "../../../context/tags/useTag";
import { useTask } from "../../../context/tasks/useTask";
import type { Tag } from "../../../types/tag.types";
import type { TaskWithTags } from "../../../types/task.types";
import { getTagColor, statusLabels } from "../../../utils/task.utils";
import { TaskCard } from "../components/TaskCard";
import TaskFilters from "../components/TaskFilters";

const taskSchema = z.object({
  title: z.string().min(1, "El titulo es obligatorio"),
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
    state: { tags, error: tagError },
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
    <main className="min-h-dvh bg-main-bg px-4 py-8 text-main-text sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <TaskFilters
            filterStatus={filterStatus}
            filterProject={filterProject}
            onClearFilters={handleClearFilters}
            onStatusChange={onStatusChange}
            onProjectChange={onProjectChange}
          />

          <section
            id="form"
            aria-label="Formulario de tarea"
            className="rounded-3xl border border-border/80 bg-card-bg/80 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur"
          >
            <form
              key={editingTask?.id ?? "new"}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              aria-busy={state.loading}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {editingTask ? "Edicion" : "Nueva tarea"}
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-main-text">
                    {editingTask ? "Editar tarea" : "Crear tarea"}
                  </h1>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Plus aria-hidden="true" size={20} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-main-text/75"
                >
                  Titulo
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  aria-required="true"
                  aria-invalid={errors.title ? "true" : undefined}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  placeholder="Anade un titulo"
                  className="w-full rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 placeholder:text-main-text/35 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
                />
                {errors.title && (
                  <span
                    id="title-error"
                    role="alert"
                    className="text-sm text-danger"
                  >
                    {errors.title.message}
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

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="project"
                  className="text-sm font-medium text-main-text/75"
                >
                  Proyecto
                </label>
                <select
                  id="project"
                  {...register("project_id")}
                  className="w-full rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">Sin proyecto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="tag"
                  className="text-sm font-medium text-main-text/75"
                >
                  Etiquetas
                </label>
                <select
                  onChange={(e) => handleAddTag(e.target.value)}
                  value=""
                  className="w-full rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">Selecciona una etiqueta</option>
                  {tags
                    .filter((tag) => !selectedTags.find((s) => s.id === tag.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>

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
                    placeholder="Crear etiqueta nueva"
                    className="min-w-0 flex-1 rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 placeholder:text-main-text/35 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTagInput.trim()) {
                        handleCreateTag(newTagInput.trim());
                        setNewTagInput("");
                      }
                    }}
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Crear
                  </button>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTags.map((tag) => {
                      const color = getTagColor(tag.id);
                      return (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${color.bg} ${color.text}`}
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="rounded-full px-1 text-current/70 transition-colors hover:bg-white/30 hover:text-danger"
                          >
                            x
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {tagError && (
                <p
                  role="alert"
                  className="rounded-2xl bg-danger/10 p-3 text-sm text-danger"
                >
                  {tagError}
                </p>
              )}

              {editingTask && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-main-text/75"
                  >
                    Estado
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className="w-full rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
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
                className="mt-1 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {state.loading
                  ? "Guardando..."
                  : editingTask
                    ? "Guardar cambios"
                    : "Crear tarea"}
              </button>
            </form>
          </section>
        </aside>

        <section
          id="task-list"
          aria-label="Lista de tareas"
          aria-live="polite"
          className="min-w-0 rounded-4xl border border-border/80 bg-card-bg/60 p-4 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-6"
        >
          <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Panel diario
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-main-text">
                Tareas
              </h2>
            </div>
            <p className="text-sm text-main-text/55">
              {filteredTasks.length} de {state.tasks.length} visibles
            </p>
          </div>

          {state.tasks.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-main-bg/50 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <ClipboardList aria-hidden="true" size={32} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-main-text">
                Todavia no hay tareas
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-main-text/55">
                Crea la primera tarea, asignale proyecto y anade etiquetas para
                ordenar el trabajo desde el inicio.
              </p>
              <a
                href="#form"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-hover active:scale-[0.98]"
              >
                <Plus aria-hidden="true" size={16} />
                Crear tarea
              </a>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-main-bg/50 p-8 text-center">
              <ClipboardList
                aria-hidden="true"
                size={34}
                className="text-main-text/35"
              />
              <h3 className="mt-4 text-lg font-semibold text-main-text">
                No hay tareas con estos filtros
              </h3>
              <p className="mt-2 text-sm text-main-text/55">
                Limpia los filtros o cambia el estado y proyecto seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid gap-3" role="list">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
