import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";

const registerSchema = z
  .object({
    email: z.email("Introduce un email válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, state } = useAuth();

  const initialValues: RegisterFormData = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { email, password } = data;
      await signUp(email, password);
      reset();
      navigate("/login");
    } catch {
      // error ya se muestra via state.error
    }
  };

  return (
    <main className="flex h-screen dark:bg-main-bg">
      <section className="hidden lg:flex w-1/2 bg-main-text dark:bg-main-bg flex-col justify-center px-12">
        <span aria-hidden="true" className="text-6xl text-white">
          ✓
        </span>
        <h1 className="text-4xl font-bold text-white">Mi Gestor de Tareas</h1>
        <p className="mt-4 text-lg text-white/70">
          Empieza hoy a organizarte mejor
        </p>
        <p className="mt-8 text-sm text-white/60">
          Planifica con claridad y avanza con calma.
        </p>
      </section>

      <section className="flex min-h-screen w-full lg:w-1/2 bg-main-bg flex-col justify-center items-center px-6 py-12 lg:min-h-0 lg:px-8 lg:py-0 overflow-y-auto dark:bg-card-bg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm flex flex-col gap-4"
          aria-busy={state.loading}
        >
          <div className="flex flex-col gap-1 mb-4">
            <h1 className="text-2xl font-bold text-main-text">
              Crear cuenta
            </h1>
            <p className="text-sm text-main-text/60">
              Regístrate para empezar
            </p>
          </div>

          {state.error && (
            <div
              role="alert"
              className="text-danger text-sm bg-danger/10 p-3 rounded-lg dark:bg-danger/20"
            >
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="register-email"
              className="text-sm font-medium text-main-text/80"
            >
              Correo electrónico
            </label>
            <input
              {...register("email")}
              id="register-email"
              type="email"
              aria-required="true"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <span
                id="register-email-error"
                role="alert"
                className="text-danger text-sm"
              >
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="register-password"
              className="text-sm font-medium text-main-text/80"
            >
              Contraseña
            </label>
            <input
              {...register("password")}
              id="register-password"
              type="password"
              aria-required="true"
              aria-invalid={errors.password ? "true" : undefined}
              aria-describedby={
                errors.password ? "register-password-error" : undefined
              }
              autoComplete="new-password"
              placeholder="Tu contraseña"
              className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && (
              <span
                id="register-password-error"
                role="alert"
                className="text-danger text-sm"
              >
                {errors.password.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="register-confirm"
              className="text-sm font-medium text-main-text/80"
            >
              Confirmar contraseña
            </label>
            <input
              {...register("confirmPassword")}
              id="register-confirm"
              type="password"
              aria-required="true"
              aria-invalid={errors.confirmPassword ? "true" : undefined}
              aria-describedby={
                errors.confirmPassword ? "register-confirm-error" : undefined
              }
              autoComplete="new-password"
              placeholder="Confirma tu contraseña"
              className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.confirmPassword && (
              <span
                id="register-confirm-error"
                role="alert"
                className="text-danger text-sm"
              >
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={state.loading}
            aria-busy={state.loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loading ? "Creando cuenta..." : "Enviar"}
          </button>

          <Link
            to="/login"
            className="text-center text-sm text-primary hover:text-primary-hover"
          >
            Ya tengo una cuenta
          </Link>
        </form>
      </section>
    </main>
  );
}
