import { zodResolver } from "@hookform/resolvers/zod";
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
  const { state, getTags, createTag, updateTag, deleteTag } = useTag();
  const { state: authState } = useAuth();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const initialValues = {
    name: "",
    color: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: initialValues,
  });

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
    <>
      <main className="min-h-screen bg-main-bg px-4 py-8 lg:grid lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-6 dark:main-bg">
        <section
          id="form"
          aria-label="Formulario de Etiquetas"
          className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
        >
          <form
            key={editingTag?.id ?? "new"}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md rounded-xl bg-card-bg p-6 shadow"
            aria-busy={state.loading}
          >
            <div className="mb-6 flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-main-text">
                {editingTag ? "Editar Etiqueta" : "Crea una nueva etiqueta"}
              </h1>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="name" className="text-main-text/80">
                Nombre:
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                aria-required="true"
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Añade un nombre para la etiqueta"
                className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && (
                <span
                  id="name-error"
                  role="alert"
                  className="text-danger text-sm"
                >
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="color" className="text-main-text/80">
                Color:
              </label>
              <input
                id="color"
                type="text"
                {...register("color")}
                aria-invalid={errors.color ? "true" : undefined}
                aria-describedby={errors.color ? "color-error" : undefined}
                placeholder="Añade una descripción de la tarea"
                className="w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-main-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.color && (
                <span
                  id="color-error"
                  role="alert"
                  className="text-danger text-sm"
                >
                  {errors.color.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={state.loading}
              aria-busy={state.loading}
              className="w-full rounded-lg bg-primary hover:bg-primary-hover py-3 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {state.loading
                ? "Guardando..."
                : editingTag
                  ? "Guardar cambios"
                  : "Crear Etiqueta"}
            </button>
          </form>
        </section>
        <section
          id="tag-list"
          aria-label="Lista de Etiquetas"
          aria-live="polite"
          className="mx-auto mt-6 w-full max-w-md rounded-xl bg-card-bg p-6 shadow lg:mx-0 lg:mt-0 lg:max-w-none lg:justify-self-start"
        >
          {state.tags.length <= 0 ? (
            <h2 className="py-12 text-center text-sm text-main-text/50">
              <span aria-hidden="true" className="text-2xl">
                📝
              </span>
              <span className="block">Añade una etiqueta</span>
            </h2>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold text-main-text dark:text-main-text/90">
                Lista de Etiquetas
              </h2>
              <div role="list">
                {state.tags.map((tag) => (
                  <TagCard key={tag.id} tag={tag} onEdit={handleEdit} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
