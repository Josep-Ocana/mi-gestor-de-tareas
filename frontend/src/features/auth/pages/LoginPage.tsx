import { zodResolver } from "@hookform/resolvers/zod";
import { CheckSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../../context/auth/useAuth";

const loginSchema = z.object({
  email: z.email("Introduce un email valido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
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
    try {
      const { email, password } = data;
      await signIn(email, password);
      reset();
      navigate("/tasks");
    } catch {
      // error ya se muestra via state.error
    }
  };

  return (
    <main className="grid min-h-100dvh bg-main-bg text-main-text lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-main-text px-12 py-14 text-white dark:bg-main-text lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.36)_1px,transparent_0)] bg-size-[28px_28px]" />
        <div className="absolute -right-28 top-20 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-12 left-20 size-56 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/10">
            <CheckSquare aria-hidden="true" size={22} />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Mi Gestor de Tareas
          </span>
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
            Control diario
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-none tracking-tight">
            Tu trabajo, ordenado antes de empezar.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/64">
            Planifica tareas, separa proyectos y vuelve a cada prioridad sin
            perder el hilo.
          </p>
        </div>

        <div className="relative grid grid-cols-[1.3fr_0.7fr] gap-4">
          <div className="rounded-xl border border-white/10 bg-white/10 p-5">
            <div className="h-2 w-20 rounded-full bg-white/30" />
            <div className="mt-5 space-y-3">
              <div className="h-3 rounded-full bg-white/20" />
              <div className="h-3 w-3/4 rounded-full bg-white/15" />
              <div className="h-3 w-1/2 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="size-10 rounded-md bg-white/20" />
            <div className="mt-8 h-16 rounded-md bg-white/10" />
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh w-full flex-col items-center justify-center bg-main-bg px-6 py-12 dark:bg-card-bg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md rounded-xl border border-border/40 bg-card-bg p-6 sm:p-8"
          aria-busy={state.loading}
        >
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Acceso
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-main-text">
              Bienvenido
            </h1>
            <p className="mt-2 text-sm leading-6 text-main-text/55">
              Inicia sesion para continuar con tus tareas.
            </p>
          </div>

          {state.error && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
            >
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-main-text/75"
              >
                Correo electronico
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                aria-required="true"
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0"
              />
              {errors.email && (
                <span
                  id="email-error"
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-main-text/75"
              >
                Contrasena
              </label>
              <input
                {...register("password")}
                id="password"
                type="password"
                aria-required="true"
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                autoComplete="current-password"
                placeholder="Tu contrasena"
                className="w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0"
              />
              {errors.password && (
                <span
                  id="password-error"
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={state.loading}
              aria-busy={state.loading}
              className="w-full rounded-md bg-[#111111] py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state.loading ? "Iniciando sesion..." : "Entrar"}
            </button>
          </div>

          <Link
            to="/register"
            className="mt-6 block text-center text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Crear una cuenta
          </Link>
        </form>
      </section>
    </main>
  );
}
