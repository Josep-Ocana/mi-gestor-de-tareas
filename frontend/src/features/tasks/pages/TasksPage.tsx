import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Plus, X } from "lucide-react";
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

// Clases reutilizables
const inputClass =
  "w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0";

const labelClass =
  "text-xs font-medium uppercase tracking-[0.08em] text-main-text/40";

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

  const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const filteredTasks = state.tasks
    .filter((task) => (filterStatus ? task.status === filterStatus : true))
    .filter((task) =>
      filterProject ? task.project_id === filterProject : true,
    );

  const onStatusChange = (status: string) => setFilterStatus(status);
  const onProjectChange = (project: string) => setFilterProject(project);
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

  const handleAddTag = (tagId: Tag["id"]) => {
    const tag = tags.find((t) => t.id === tagId);
    if (tag && !selectedTags.find((t) => t.id === tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async (name: string) => {
    const newTag = await createTag({ name, owner_id: authState.user!.id });
    if (newTag) setSelectedTags([...selectedTags, newTag]);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
  };

  return (
    <main className="min-h-dvh bg-main-bg px-4 py-10 text-main-text sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <TaskFilters
            filterStatus={filterStatus}
            filterProject={filterProject}
            onClearFilters={handleClearFilters}
            onStatusChange={onStatusChange}
            onProjectChange={onProjectChange}
          />

          {/* Formulario */}
          <section
            id="form"
            aria-label="Formulario de tarea"
            className="rounded-xl border border-border/40 bg-card-bg p-5"
          >
            <form
              key={editingTask?.id ?? "new"}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              aria-busy={state.loading}
            >
              {/* Header formulario */}
              <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <p className={labelClass}>
                    {editingTask ? "Editando" : "Nueva tarea"}
                  </p>
                  <h1
                    className="mt-1.5 text-xl tracking-tight text-main-text"
                    style={{
                      fontFamily:
                        "'Instrument Serif', 'Newsreader', Georgia, serif",
                    }}
                  >
                    {editingTask ? "Editar tarea" : "Crear tarea"}
                  </h1>
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/40 text-main-text/35">
                  <Plus aria-hidden="true" size={14} />
                </div>
              </div>

              {/* Título */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className={labelClass}>
                  Título
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  aria-required="true"
                  aria-invalid={errors.title ? "true" : undefined}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  placeholder="Nombre de la tarea"
                  className={inputClass}
                />
                {errors.title && (
                  <span
                    id="title-error"
                    role="alert"
                    className="text-xs text-danger"
                  >
                    {errors.title.message}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className={labelClass}>
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
                  placeholder="Opcional"
                  className={inputClass}
                />
                {errors.description && (
                  <span
                    id="description-error"
                    role="alert"
                    className="text-xs text-danger"
                  >
                    {errors.description.message}
                  </span>
                )}
              </div>

              {/* Proyecto */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="project" className={labelClass}>
                  Proyecto
                </label>
                <select
                  id="project"
                  {...register("project_id")}
                  className={inputClass}
                >
                  <option value="">Sin proyecto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Etiquetas */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tag" className={labelClass}>
                  Etiquetas
                </label>
                <select
                  onChange={(e) => handleAddTag(e.target.value)}
                  value=""
                  className={inputClass}
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

                {/* Crear etiqueta nueva */}
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
                    placeholder="Nueva etiqueta..."
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTagInput.trim()) {
                        handleCreateTag(newTagInput.trim());
                        setNewTagInput("");
                      }
                    }}
                    className="rounded-md border border-border/50 px-3 py-2.5 text-xs font-medium text-main-text/60 transition-colors duration-200 hover:border-main-text/30 hover:text-main-text active:scale-[0.98]"
                  >
                    Crear
                  </button>
                </div>

                {/* Tags seleccionados */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedTags.map((tag) => {
                      const hashColor = getTagColor(tag.id);
                      return (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]${
                            tag.color
                              ? ""
                              : ` ${hashColor.bg} ${hashColor.text}`
                          }`}
                          style={
                            tag.color
                              ? {
                                  backgroundColor: `${tag.color}18`,
                                  color: tag.color,
                                }
                              : undefined
                          }
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="ml-0.5 rounded-full p-0.5 text-current/50 transition-colors hover:text-current"
                          >
                            <X size={10} aria-label={`Quitar ${tag.name}`} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error de tag */}
              {tagError && (
                <p
                  role="alert"
                  className="rounded-md border border-danger/20 bg-danger/5 p-3 text-xs text-danger"
                >
                  {tagError}
                </p>
              )}

              {/* Estado (solo al editar) */}
              {editingTask && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="status" className={labelClass}>
                    Estado
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className={inputClass}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={state.loading}
                aria-busy={state.loading}
                className="mt-1 w-full rounded-md bg-[#111111] py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {state.loading
                  ? "Guardando..."
                  : editingTask
                    ? "Guardar cambios"
                    : "Crear tarea"}
              </button>

              {/* Cancelar edición */}
              {editingTask && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    reset(initialValues);
                    setSelectedTags([]);
                  }}
                  className="w-full rounded-md py-2.5 text-sm text-main-text/40 transition-colors duration-200 hover:text-main-text/70"
                >
                  Cancelar edición
                </button>
              )}
            </form>
          </section>
        </aside>

        {/* ── Panel principal ── */}
        <section
          id="task-list"
          aria-label="Lista de tareas"
          aria-live="polite"
          className="min-w-0 rounded-xl border border-border/40 bg-card-bg p-6"
        >
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2 border-b border-border/40 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={labelClass}>Panel diario</p>
              <h2
                className="mt-1.5 text-3xl tracking-[-0.02em] text-main-text"
                style={{
                  fontFamily:
                    "'Instrument Serif', 'Newsreader', Georgia, serif",
                }}
              >
                Tareas
              </h2>
            </div>
            <p className="text-xs text-main-text/40">
              {filteredTasks.length} de {state.tasks.length} visibles
            </p>
          </div>

          {/* Sin tareas en absoluto */}
          {state.tasks.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-md border border-border/50 text-main-text/25">
                <ClipboardList aria-hidden="true" size={20} />
              </div>
              <h3
                className="mt-4 text-lg tracking-tight text-main-text"
                style={{
                  fontFamily:
                    "'Instrument Serif', 'Newsreader', Georgia, serif",
                }}
              >
                Sin tareas aún
              </h3>
              <p className="mt-1.5 max-w-xs text-sm leading-6 text-main-text/45">
                Crea la primera tarea, asígnale un proyecto y añade etiquetas
                para organizar el trabajo.
              </p>
              <a
                href="#form"
                className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[0.98]"
              >
                <Plus aria-hidden="true" size={14} />
                Crear tarea
              </a>
            </div>
          ) : /* Sin resultados con filtros activos */
          filteredTasks.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <ClipboardList
                aria-hidden="true"
                size={24}
                className="text-main-text/25"
              />
              <h3 className="mt-3 text-base font-medium text-main-text">
                Sin resultados
              </h3>
              <p className="mt-1 text-sm text-main-text/45">
                Ajusta los filtros para ver más tareas.
              </p>
            </div>
          ) : (
            /* Lista de tareas */
            <div className="grid gap-2" role="list">
              {filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    animationDelay: `${index * 60}ms`,
                    animationFillMode: "both",
                  }}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <TaskCard task={task} onEdit={handleEdit} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
