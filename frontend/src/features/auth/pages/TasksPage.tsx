import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/AuthContext";
import { useTask } from "../../../context/TaskContext";
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
  }, []);

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
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask({
        ...data,
        owner_id: authState.user!.id,
      });
      if (!state.error) {
        reset();
        setEditingTask(null);
      }
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
      <main className="min-h-screen bg-slate-50 px-4 py-8 lg:grid lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-6">
        <section
          id="form"
          className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow"
          >
            <div className="mb-6 flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-900">
                Crea una nueva tarea
              </h1>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="title">Título</label>
              <input
                type="text"
                {...register("title")}
                placeholder="Añade un título"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="description">Descripción:</label>
              <input
                type="text"
                {...register("description")}
                placeholder="Añade una descripción de la tarea"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.description && (
                <span className="text-red-500 text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>
            {editingTask && (
              <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="status">Estado:</label>
                <select
                  {...register("status")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="todo">Por hacer</option>
                  <option value="in_progress">En progreso</option>
                  <option value="done">Completada</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
            >
              {editingTask ? "Guardar cambios" : "Crear Tarea"}
            </button>
          </form>
        </section>
        <section
          id="task-list"
          className="mx-auto mt-6 w-full max-w-md rounded-xl bg-white p-6 shadow lg:mx-0 lg:mt-0 lg:max-w-none lg:justify-self-start"
        >
          {state.tasks.length <= 0 ? (
            <h2 className="py-12 text-center text-sm text-slate-500">
              📝 <span className="block">Añade una tarea</span>
            </h2>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold text-slate-800">
                Lista de tareas
              </h2>
              <div>
                {state.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="mb-3 rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-sm"
                  >
                    <div className="font-semibold text-slate-800">
                      {task.title}
                    </div>
                    <div className="text-sm text-slate-500">
                      {task.description}
                    </div>
                    <div className="flex justify-between">
                      <div
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          task.status === "done"
                            ? "bg-emerald-100 text-emerald-700"
                            : task.status === "in_progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {statusLabels[task.status ?? "todo"]}
                      </div>
                      <div>
                        <button
                          className="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                          onClick={() => deleteTask(task.id)}
                        >
                          Eliminar
                        </button>
                        <button
                          className="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
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
