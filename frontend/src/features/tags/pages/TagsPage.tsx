import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../../context/auth/useAuth";
import { useTag } from "../../../context/tags/useTag";
import type { Tag } from "../../../types/tag.types";
import { TagCard } from "../components/TagCard";

const tagSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  color: z.string().min(1),
});

type TagFormData = z.infer<typeof tagSchema>;

export function TagsPage() {
  const { state, getTags, createTag, updateTag } = useTag();
  const { state: authState } = useAuth();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const initialValues = {
    name: "",
    color: "#94a3b8",
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: initialValues,
  });

  const currentColor = watch("color");

  useEffect(() => {
    getTags();
  }, [getTags]);

  const onSubmit = async (data: TagFormData) => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, data);
      } else {
        await createTag({
          ...data,
          owner_id: authState.user!.id,
        });
      }
      reset(initialValues);
      setEditingTag(null);
    } catch (error) {}
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    reset({
      name: tag.name,
      color: tag.color ?? "#94a3b8",
    });
  };

  return (
    <main className="min-h-dvh bg-main-bg px-4 py-8 text-main-text sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section
          id="form"
          aria-label="Formulario de etiquetas"
          className="rounded-3xl border border-border/80 bg-card-bg/80 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur lg:sticky lg:top-28 lg:self-start"
        >
          <form
            key={editingTag?.id ?? "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            aria-busy={state.loading}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-page-tag">
                  {editingTag ? "Edicion" : "Nueva etiqueta"}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-main-text">
                  {editingTag ? "Editar etiqueta" : "Crear etiqueta"}
                </h1>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-page-tag/10 text-page-tag">
                <Plus aria-hidden="true" size={20} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-main-text/75"
              >
                Nombre
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                aria-required="true"
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Anade un nombre"
                className="w-full rounded-2xl border border-border bg-main-bg/70 px-4 py-3 text-sm text-main-text outline-none transition-all duration-300 placeholder:text-main-text/35 focus:border-primary focus:bg-card-bg focus:ring-4 focus:ring-primary/10"
              />
              {errors.name && (
                <span
                  id="name-error"
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="color"
                className="text-sm font-medium text-main-text/75"
              >
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  {...register("color")}
                  aria-invalid={errors.color ? "true" : undefined}
                  aria-describedby={errors.color ? "color-error" : undefined}
                  className="h-11 w-14 cursor-pointer rounded-2xl border border-border bg-main-bg/70 p-1 transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <span className="inline-flex items-center gap-2 rounded-2xl border border-border bg-main-bg/70 px-4 py-2.5 text-sm font-mono text-main-text/55">
                  <span
                    className="inline-block size-4 rounded-full border border-border"
                    style={{ backgroundColor: currentColor || "#94a3b8" }}
                  />
                  {currentColor || "#94a3b8"}
                </span>
              </div>
              {errors.color && (
                <span
                  id="color-error"
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.color.message}
                </span>
              )}
            </div>

            {state.error && (
              <p
                role="alert"
                className="rounded-2xl bg-danger/10 p-3 text-sm text-danger"
              >
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={state.loading}
              aria-busy={state.loading}
              className="mt-1 w-full rounded-2xl bg-page-tag py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-page-tag-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.loading
                ? "Guardando..."
                : editingTag
                  ? "Guardar cambios"
                  : "Crear etiqueta"}
            </button>
          </form>
        </section>

        <section
          id="tag-list"
          aria-label="Lista de etiquetas"
          aria-live="polite"
          className="min-w-0 rounded-4xl border border-border/80 bg-card-bg/60 p-4 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-6"
        >
          <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-page-tag">
                Categorias
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-main-text">
                Etiquetas
              </h2>
            </div>
            <p className="text-sm text-main-text/55">
              {state.tags.length} en total
            </p>
          </div>

          {state.tags.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-main-bg/50 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-page-tag/10 text-page-tag">
                <Tags aria-hidden="true" size={32} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-main-text">
                Todavia no hay etiquetas
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-main-text/55">
                Crea la primera etiqueta, asignale un color y organiza tus tareas
                por categorias desde el inicio.
              </p>
              <a
                href="#form"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-page-tag px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-page-tag-hover active:scale-[0.98]"
              >
                <Plus aria-hidden="true" size={16} />
                Crear etiqueta
              </a>
            </div>
          ) : (
            <div className="grid gap-3" role="list">
              {state.tags.map((tag) => (
                <TagCard key={tag.id} tag={tag} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
