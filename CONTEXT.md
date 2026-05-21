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
desperate│   │   │   └── useTag.ts ✅
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
│   │   │   └── tasks/
│   │   │       ├── components/
│   │   │       │   └── TaskCard.tsx ✅
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
│   │   │   ├── supabase.types.ts ✅  ← generado automáticamente
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
│       │   └── XXXXXXXXXX_add_not_null_to_tasks.sql
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
- `tags` — etiquetas del usuario
- `tasks` — tareas con autorreferencia para subtareas, `project_id` nullable
- `task_tags` — relación many to many entre tasks y tags

### Decisiones importantes

- RLS activado en todas las tablas
- Trigger `handle_new_user` — crea perfil automáticamente al registrarse
- Trigger `handle_updated_at` — actualiza updated_at automáticamente en tasks
- `status` y `priority` tienen `NOT NULL` desde la segunda migración
- `project_id` en tasks es nullable — los proyectos son opcionales
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
        └── /projects → ProjectsPage
```

- `PrivateRoute` — guarda de autenticación, redirige a /login si no hay usuario
- `PrivateLayout` — layout con Header para rutas privadas, usa `Outlet` de react-router
- `PrivateLayout` debe estar **fuera** de `AppRouter`, no dentro

---

## Decisiones de diseño

- **Proyectos opcionales** — `project_id` en tasks es nullable. El usuario puede crear tareas sin proyecto y asignarlas después
- **Tags inline** — las etiquetas se gestionarán desde el formulario de tareas, no desde una página separada
- **Sin status en proyectos** — los proyectos no tienen estado propio, el estado lo comunican sus tareas
- **ThemeToggle** — dark/light mode implementado con ThemeContext y CSS tokens globales
- **Iconos de acción** — los botones de editar/eliminar usan iconos de lucide-react (Pencil, Trash2) en lugar de texto

---

## Dónde lo dejamos

- ✅ Configuración inicial completa
- ✅ Base de datos con RLS, triggers y NOT NULL en status/priority
- ✅ Tipos TypeScript generados y organizados por entidad
- ✅ AuthContext con perfil de usuario integrado en el estado
- ✅ TaskContext, ProjectContext, TagContext — cada uno con types, reducer, context y hook
- ✅ ThemeContext con dark/light mode
- ✅ Router con PrivateRoute y PrivateLayout (Header + Outlet)
- ✅ LoginPage y RegisterPage con estilos split screen
- ✅ Header con navegación (NavLink a /tasks y /projects), email del usuario, ThemeToggle y cerrar sesión
- ✅ TasksPage con crear, listar, editar y eliminar tareas
- ✅ TaskCard con iconos de acción y badge de status
- ✅ TaskCard muestra el nombre del proyecto asociado
- ✅ Formulario de tareas con selector de proyecto opcional
- ✅ ProjectsPage con crear, listar, editar y eliminar proyectos
- ✅ ProjectCard con iconos de acción
- ✅ Paleta de colores semántica global (tokens CSS para light/dark)
- ✅ reset(initialValues) al hacer submit para limpiar el formulario correctamente

## Próximos pasos

1. Filtros en TasksPage — por status y por proyecto
2. Tags — selector en formulario de tareas, mostrar en TaskCard
3. Perfil de usuario — editar username y avatar
4. Footer
5. Pulido UI

---

## Notas importantes

- **Zod v4**: usar `z.email()` en lugar de `z.string().email()` (deprecado en v4)
- **Backend**: no tiene package.json ni npm, usa Deno. No hay que arrancar nada localmente
- **VITE_SUPABASE_URL**: solo el dominio, sin `/rest/v1/` al final
- **`.env.local`**: debe tener el punto inicial, si no Vite no lo lee
- **supabase gen types**: ejecutar desde la raíz del proyecto, no desde backend/supabase/
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
