import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { useTask } from "../../../context/tasks/useTask";
import type { Task } from "../../../types/task.types";
import { statusLabels } from "../../../utils/task.utils";

const taskSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TasksPage() {
  const { state, getTasks, createTask, updateTask, deleteTask } = useTask();
  const { state: authState } = useAuth();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const initialValues: TaskFormData = {
    title: "",
    description: "",
    status: "todo",
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
          owner_id: authState.user!.id,
        });
        reset();
        setEditingTask(null);
      }
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
    });
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 lg:grid lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-6 dark:bg-gray-900">
        <section
          id="form"
          aria-label="Formulario de tarea"
          className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
        >
          <form
            key={editingTask?.id ?? "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow dark:bg-gray-800"
            aria-busy={state.loading}
          >
            <div className="mb-6 flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                {editingTask ? "Editar tarea" : "Crea una nueva tarea"}
              </h1>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="title" className="dark:text-gray-300">Título</label>
              <input
                id="title"
                type="text"
                {...register("title")}
                aria-required="true"
                aria-invalid={errors.title ? "true" : undefined}
                aria-describedby={errors.title ? "title-error" : undefined}
                placeholder="Añade un título"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              {errors.title && (
                <span id="title-error" role="alert" className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="description" className="dark:text-gray-300">Descripción:</label>
              <input
                id="description"
                type="text"
                {...register("description")}
                aria-invalid={errors.description ? "true" : undefined}
                aria-describedby={errors.description ? "description-error" : undefined}
                placeholder="Añade una descripción de la tarea"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              {errors.description && (
                <span id="description-error" role="alert" className="text-red-500 text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>
            {editingTask && (
              <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="status" className="dark:text-gray-300">Estado:</label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
              className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.loading ? "Guardando..." : editingTask ? "Guardar cambios" : "Crear Tarea"}
            </button>
          </form>
        </section>
        <section
          id="task-list"
          aria-label="Lista de tareas"
          aria-live="polite"
          className="mx-auto mt-6 w-full max-w-md rounded-xl bg-white p-6 shadow lg:mx-0 lg:mt-0 lg:max-w-none lg:justify-self-start dark:bg-gray-800"
        >
          {state.tasks.length <= 0 ? (
            <h2 className="py-12 text-center text-sm text-slate-500 dark:text-gray-400">
              <span aria-hidden="true" className="text-2xl">📝</span>
              <span className="block">Añade una tarea</span>
            </h2>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-gray-200">
                Lista de tareas
              </h2>
              <div role="list">
                {state.tasks.map((task) => (
                  <div
                    key={task.id}
                    role="listitem"
                    className="mb-3 rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-sm dark:bg-gray-700"
                  >
                    <div className="font-semibold text-slate-800 dark:text-gray-100">
                      {task.title}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-gray-400">
                      {task.description}
                    </div>
                    <div className="flex justify-between">
                      <div
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          task.status === "done"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : task.status === "in_progress"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                              : "bg-slate-100 text-slate-700 dark:bg-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {statusLabels[task.status ?? "todo"]}
                      </div>
                      <div>
                        <button
                          aria-label={`Eliminar tarea: ${task.title}`}
                          className="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium dark:text-gray-300"
                          onClick={() => deleteTask(task.id)}
                        >
                          Eliminar
                        </button>
                        <button
                          aria-label={`Editar tarea: ${task.title}`}
                          className="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium dark:text-gray-300"
                          onClick={() => handleEdit(task)}
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
