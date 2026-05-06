import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/AuthContext";
import { useTask } from "../../../context/TaskContext";

const taskSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TasksPage() {
  const { state, getTasks, createTask } = useTask();
  const { state: authState } = useAuth();

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
    await createTask({
      ...data,
      owner_id: authState.user!.id,
    });
    if (!state.error) reset();
  };

  return (
    <>
      <main>
        <section id="form">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 mb-4">
              <h1 className="text-2xl font-bold text-slate-900">Bienvenido</h1>
              <p className="text-sm text-slate-500">
                Inicia sesión para continuar
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                {...register("title")}
                placeholder="Añade un título"
              />
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div>
              <input
                type="text"
                {...register("description")}
                placeholder="Añade una descripción de la tarea"
              />
              {errors.description && (
                <span className="text-red-500 text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <select {...register("status")}>
                <option value="todo">Por hacer</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Crear
            </button>
          </form>
        </section>
        <section id="task-list">
          {state.tasks.length <= 0 ? (
            <h2>
              Añade una <span>tarea</span>
            </h2>
          ) : (
            <>
              <h2>Lista de tareas</h2>
              <div>
                {state.tasks.map((task) => (
                  <div key={task.id}>
                    <div>{task.title}</div>
                    <div>{task.description}</div>
                    <div>{task.status}</div>
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
