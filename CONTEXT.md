# Contexto del proyecto — Mi Gestor de Tareas

## Stack tecnológico

- **Frontend:** React 19 + TypeScript + Vite 8
- **Base de datos:** Supabase (PostgreSQL)
- **Estilos:** Tailwind v4 con @tailwindcss/vite
- **Autenticación:** Supabase Auth
- **Estado global:** useReducer + Context (sin Zustand ni Redux)
- **Formularios:** react-hook-form + zod v4
- **Iconos:** lucide-react
- **Router:** react-router-dom
- **Control de versiones:** Git + GitHub

---

## Estructura de carpetas

```
mi-gestor-de-tareas/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Header.tsx ✅
│   │   │   └── ui/
│   │   │       └── ThemeToggle/
│   │   │           └── ThemeToggle.tsx ✅
│   │   ├── context/
│   │   │   ├── auth/
│   │   │   │   ├── auth.types.ts ✅
│   │   │   │   ├── auth.reducer.ts ✅
│   │   │   │   ├── AuthContext.tsx ✅
│   │   │   │   └── useAuth.ts ✅
│   │   │   ├── projects/
│   │   │   │   ├── projects.types.ts ✅
│   │   │   │   ├── projects.reducer.ts ✅
│   │   │   │   ├── ProjectContext.tsx ✅
│   │   │   │   └── useProject.ts ✅
│   │   │   ├── tags/
│   │   │   │   ├── tags.types.ts ✅
│   │   │   │   ├── tags.reducer.ts ✅
│   │   │   │   ├── TagContext.tsx ✅
│   │   │   │   └── useTag.ts ✅
│   │   │   ├── tasks/
│   │   │   │   ├── tasks.types.ts ✅
│   │   │   │   ├── tasks.reducer.ts ✅
│   │   │   │   ├── TaskContext.tsx ✅
│   │   │   │   └── useTask.ts ✅
│   │   │   └── theme/
│   │   │       ├── theme.types.ts ✅
│   │   │       ├── theme.reducer.ts ✅
│   │   │       ├── ThemeContext.tsx ✅
│   │   │       └── useTheme.ts ✅
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── pages/
│   │   │   │       ├── LoginPage.tsx ✅
│   │   │   │       └── RegisterPage.tsx ✅
│   │   │   ├── projects/
│   │   │   │   ├── components/
│   │   │   │   │   └── ProjectCard.tsx ✅
│   │   │   │   └── pages/
│   │   │   │       └── ProjectsPage.tsx ✅
│   │   │   ├── tags/
│   │   │   │   ├── components/
│   │   │   │   │   └── TagCard.tsx ✅
│   │   │   │   └── pages/
│   │   │   │       └── TagsPage.tsx ✅
│   │   │   └── tasks/
│   │   │       ├── components/
│   │   │       │   ├── TaskCard.tsx ✅
│   │   │       │   └── TaskFilters.tsx ✅
│   │   │       └── pages/
│   │   │           └── TasksPage.tsx ✅
│   │   ├── router/
│   │   │   ├── AppRouter.tsx ✅
│   │   │   └── PrivateRoute.tsx ✅
│   │   ├── services/
│   │   │   ├── supabase/
│   │   │   │   └── client.ts ✅
│   │   │   ├── projects.service.ts ✅
│   │   │   ├── tags.service.ts ✅
│   │   │   └── tasks.service.ts ✅
│   │   ├── types/
│   │   │   ├── supabase.types.ts ✅
│   │   │   ├── profile.types.ts ✅
│   │   │   ├── project.types.ts ✅
│   │   │   ├── tag.types.ts ✅
│   │   │   └── task.types.ts ✅
│   │   ├── utils/
│   │   │   └── task.utils.ts ✅
│   │   ├── index.css
│   │   └── main.tsx ✅
│   ├── .env.local                  ← no va al repo
│   ├── .env.example                ← sí va al repo
│   └── package.json
├── backend/
│   └── supabase/
│       ├── migrations/
│       │   ├── 20260422100322_init_schema.sql
│       │   ├── XXXXXXXXXX_add_not_null_to_tasks.sql
│       │   └── 20260606055806_add_unique_tag_name_per_user.sql
│       ├── functions/
│       │   ├── on-user-created/
│       │   └── notify-due-tasks/
│       └── config.toml
└── shared/
    ├── types/
    └── constants/
```

---

## Base de datos (Supabase)

### Tablas creadas

- `profiles` — extiende auth.users con username y avatar_url
- `projects` — proyectos del usuario
- `tags` — etiquetas del usuario (incluye columna `color` con default `#94a3b8`)
- `tasks` — tareas con autorreferencia para subtareas, `project_id` nullable
- `task_tags` — relación many to many entre tasks y tags

### Decisiones importantes

- RLS activado en todas las tablas
- Trigger `handle_new_user` — crea perfil automáticamente al registrarse
- Trigger `handle_updated_at` — actualiza updated_at automáticamente en tasks
- `status` y `priority` tienen `NOT NULL` desde la segunda migración
- `project_id` en tasks es nullable — los proyectos son opcionales
- Constraint `unique_tag_name_per_user` — evita tags duplicadas por usuario (migración 20260606055806)
- Tipos generados con `supabase gen types typescript --project-id REF --schema public`
- Comando ejecutar desde la raíz del proyecto, no desde backend/supabase/

---

## Arquitectura del router

```
AppRouter
├── /login           → LoginPage (pública)
├── /register        → RegisterPage (pública)
└── PrivateRoute
    └── PrivateLayout (Header + Outlet)
        ├── /tasks   → TasksPage
        ├── /projects → ProjectsPage
        └── /tags    → TagsPage
```

- `PrivateRoute` — guarda de autenticación, redirige a /login si no hay usuario
- `PrivateLayout` — layout con Header para rutas privadas, usa `Outlet` de react-router
- `PrivateLayout` debe estar **fuera** de `AppRouter`, no dentro

---

## Decisiones de diseño

- **Proyectos opcionales** — `project_id` en tasks es nullable. El usuario puede crear tareas sin proyecto y asignarlas después
- **Tags con página dedicada** — además del selector inline en el formulario de tareas, ahora hay una página `/tags` para gestionar etiquetas con CRUD completo y selector de color propio
- **Sin status en proyectos** — los proyectos no tienen estado propio, el estado lo comunican sus tareas
- **ThemeToggle** — dark/light mode implementado con ThemeContext y CSS tokens globales
- **Iconos de acción** — los botones de editar/eliminar usan iconos de lucide-react (Pencil, Trash2) en lugar de texto
- **Colores de tags** — la columna `color` en BD se usa activamente con un `<input type="color">` en la página de tags. `getTagColor()` sigue como fallback para tags sin color definido

---

## Dónde lo dejamos

- ✅ Configuración inicial completa
- ✅ Base de datos con RLS, triggers y NOT NULL en status/priority
- ✅ Constraint unique_tag_name_per_user en BD (migración 20260606055806)
- ✅ Tipos TypeScript generados y organizados por entidad
- ✅ AuthContext con perfil de usuario integrado en el estado
- ✅ TaskContext, ProjectContext, TagContext — cada uno con types, reducer, context y hook
- ✅ useCallback en getTasks, getProjects, getTags — evita bucle infinito de renders
- ✅ ThemeContext con dark/light mode
- ✅ Router con PrivateRoute y PrivateLayout (Header + Outlet)
- ✅ LoginPage y RegisterPage con estilos split screen
- ✅ Header con navegación (NavLink a /tasks, /projects y /tags), email del usuario, ThemeToggle y cerrar sesión
- ✅ TasksPage con crear, listar, editar y eliminar tareas
- ✅ TaskCard con iconos de acción y badge de status
- ✅ TaskCard muestra el nombre del proyecto asociado
- ✅ TaskCard muestra las tags con colores consistentes por tag
- ✅ Formulario de tareas con selector de proyecto opcional
- ✅ Formulario de tareas con selector de tags existentes y creación de tags nuevas
- ✅ Pills de tags en formulario con colores consistentes (mismo sistema que TaskCard)
- ✅ Error de tag duplicada con mensaje al usuario ("Ya tienes una etiqueta con ese nombre")
- ✅ ProjectsPage con crear, listar, editar y eliminar proyectos
- ✅ ProjectCard con iconos de acción
- ✅ Filtros en TasksPage — por status y por proyecto
- ✅ Paleta de colores semántica global (tokens CSS para light/dark)
- ✅ reset(initialValues) al hacer submit para limpiar el formulario correctamente
- ✅ Sistema de colores automático para tags (TAG_COLORS + getTagColor en task.utils.ts)
- ✅ TagsPage con crear, listar, editar y eliminar etiquetas
- ✅ TagCard con selector de color (`<input type="color">`) y acciones inline (Pencil/Trash2)
- ✅ Header con navegación a `/tags`
- ✅ UI redesign general — bordes redondeados, sombras, backdrop-blur, transiciones

## Próximos pasos

1. Perfil de usuario — editar username y avatar
2. Footer
3. Pulido UI

---

## Notas importantes

- **Zod v4**: usar `z.email()` en lugar de `z.string().email()` (deprecado en v4)
- **Backend**: no tiene package.json ni npm, usa Deno. No hay que arrancar nada localmente
- **VITE_SUPABASE_URL**: solo el dominio, sin `/rest/v1/` al final
- **`.env.local`**: debe tener el punto inicial, si no Vite no lo lee
- **supabase gen types**: ejecutar desde la raíz del proyecto, no desde backend/supabase/
- **supabase migration new / db push**: ejecutar desde `backend/`, no desde la raíz
- **Commits**: `tipo(scope): descripción` — ej: `feat(frontend): add login page`
- **reset(initialValues)**: usar siempre con los valores iniciales explícitos, no `reset()` sin argumentos, para que el select de proyecto vuelva a "Sin proyecto"
- Los servicios van en `services/` directamente, solo `client.ts` dentro de `services/supabase/`
- Los contextos están organizados por funcionalidad en `context/`
- Los tipos están organizados por entidad en `types/`
- Los componentes nunca llaman a Supabase directamente, solo los servicios
- Estado global con useReducer + Context, sin Zustand ni Redux
- Los valores técnicos van en inglés en la BD y se traducen solo en la UI con statusLabels/priorityLabels
- `key={editingTask?.id ?? 'new'}` en el formulario fuerza el reset correcto de react-hook-form al editar
- `PrivateLayout` debe definirse fuera de `AppRouter` para evitar que React la desmonte en cada render
- Las rutas hijas van como `<Route>` hijas del `<Route element={<PrivateLayout/>}>`, no dentro de componentes React
- `getTagColor(tagId)` — usa el primer carácter del UUID para asignar color consistente a cada tag
- El constraint `unique_tag_name_per_user` evita tags duplicadas por usuario en la BD
- PostgREST syntax para joins en Supabase: `"*, tabla_intermedia(tabla_final(*))"`— el resultado viene anidado y hay que aplanarlo con `.map()`
