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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register("email")} placeholder="tu@email.com" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Tu Password"
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit">Enviar</button>
    </form>
  );
}
