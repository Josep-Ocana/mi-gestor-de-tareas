import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../../context/AuthContext";

const loginSchema = z.object({
  email: z.email("Introduce un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, state } = useAuth();

  const initialValues: LoginFormData = {
    email: "",
    password: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: LoginFormData) => {
    const { email, password } = data;
    await signIn(email, password);
    if (!state.error) {
      reset();
      navigate("/tasks");
    }
  };

  return (
    <main className="flex min-h-screen">
      <section className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-center px-12">
        <span className="text-6xl text-white">✓</span>
        <h1 className="text-4xl font-bold text-white">Mi Gestor de Tareas</h1>
        <p className="mt-4 text-lg text-slate-300">
          Organiza tu día, conquista tus metas
        </p>
        <p className="mt-8 text-sm text-slate-400">
          Cada tarea completada te acerca a lo importante.
        </p>
      </section>

      <section className="flex w-full lg:w-1/2 bg-slate-50 flex-col justify-center items-center px-6 py-12 lg:min-h-0 lg:px-8 lg:py-0 overflow-y-auto">
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
              {...register("email")}
              placeholder="tu@email.com"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              {...register("password")}
              type="password"
              placeholder="Tu Password"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Enviar
          </button>

          <a
            href="/register"
            className="text-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            Crear una cuenta
          </a>
        </form>
      </section>
    </main>
  );
}
