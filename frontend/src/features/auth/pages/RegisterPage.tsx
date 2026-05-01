import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { useAuth } from "../../../context/AuthContext";

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
    const { email, password } = data;
    await signUp(email, password);
    if (!state.error) {
      reset();
      navigate("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register("email")} placeholder="tu@email.com" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Tu password"
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <div>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirma tu contraseña"
        />
        {errors.confirmPassword && (
          <span>{errors.confirmPassword.message}</span>
        )}
      </div>

      <button type="submit">Enviar</button>
    </form>
  );
}
