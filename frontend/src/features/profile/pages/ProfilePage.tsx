import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { uploadAvatar } from "../../../services/profile.service";

const profileSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { state, updateProfile } = useAuth();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState(() => Date.now());
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "" },
  });

  useEffect(() => {
    if (state.profile) {
      reset({ username: state.profile.username });
    }
  }, [state.profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      let avatarUrl = state.profile?.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(state.user!.id, avatarFile);
      }

      await updateProfile({
        username: data.username,
        avatar_url: avatarUrl,
      });

      setCacheBuster(Date.now());
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    } catch (error) {
      // error ya se muestra via state.error
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleAvatarChange llamado", e.target.files);
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <main className="min-h-dvh bg-main-bg px-4 py-8 text-main-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <section
          aria-label="Formulario de perfil"
          className="rounded-xl border border-border/40 bg-card-bg p-6"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            aria-busy={state.loading}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-main-text/40">
                  Perfil
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-main-text">
                  Mi perfil
                </h1>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-page-profile/10 text-page-profile">
                <User aria-hidden="true" size={20} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="relative">
                <img
                  src={
                    avatarPreview
                      ? avatarPreview
                      : state.profile?.avatar_url
                        ? `${state.profile?.avatar_url}?t=${cacheBuster}`
                        : `https://ui-avatars.com/api/?name=${state.profile?.username}`
                  }
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-border"
                />
              </div>
              <label
                htmlFor="avatar"
                className="cursor-pointer rounded-md border border-border/50 bg-card-bg px-4 py-2.5 text-sm text-main-text/70 transition-colors duration-200 hover:bg-page-profile/10 hover:text-page-profile"
              >
                Cambiar foto
              </label>
              <input
                key={cacheBuster}
                ref={avatarInputRef}
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {state.user?.email && (
              <p className="text-center text-sm text-main-text/50">
                <span className="font-medium mr-3">Email:</span>{" "}
                {state.user?.email}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-main-text/75"
              >
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                {...register("username")}
                aria-required="true"
                aria-invalid={errors.username ? "true" : undefined}
                aria-describedby={
                  errors.username ? "username-error" : undefined
                }
                placeholder="Tu nombre de usuario"
                className="w-full rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0"
              />
              {errors.username && (
                <span
                  id="username-error"
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.username.message}
                </span>
              )}
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-danger">
                {state.error}
              </p>
            )}

            {state.profile && (
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-main-text/40">
                Miembro desde{" "}
                {new Date(state.profile.created_at!).toLocaleDateString(
                  "es-ES",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={state.loading}
              aria-busy={state.loading}
              className="mt-1 w-full rounded-md bg-[#111111] py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state.loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
