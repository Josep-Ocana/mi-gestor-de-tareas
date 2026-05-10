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
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   └── Modal/
│   │   │   └── layout/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── pages/
│   │   │   │       ├── LoginPage.tsx ✅
│   │   │   │       └── RegisterPage.tsx ✅
│   │   │   └── tasks/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── pages/
│   │   │           └── TasksPage.tsx ✅
│   │   ├── services/
│   │   │   ├── supabase/
│   │   │   │   └── client.ts
│   │   │   ├── tasks.service.ts ✅
│   │   │   └── projects.service.ts ✅
│   │   ├── context/
│   │   │   ├── auth/
│   │   │   │   ├── auth.types.ts ✅
│   │   │   │   ├── auth.reducer.ts ✅
│   │   │   │   ├── AuthContext.tsx ✅
│   │   │   │   └── useAuth.ts ✅
│   │   │   ├── tasks/
│   │   │   │   ├── tasks.types.ts ✅
│   │   │   │   ├── tasks.reducer.ts ✅
│   │   │   │   ├── TaskContext.tsx ✅
│   │   │   │   └── useTask.ts ✅
│   │   │   └── projects/
│   │   │       ├── projects.types.ts ✅
│   │   │       ├── projects.reducer.ts ✅
│   │   │       ├── ProjectContext.tsx ✅
│   │   │       └── useProject.ts ✅
│   │   ├── types/
│   │   │   ├── supabase.types.ts   ← generado automáticamente
│   │   │   ├── task.types.ts
│   │   │   └── project.types.ts ✅
│   │   ├── hooks/
│   │   ├── utils/
│   │   │   └── task.utils.ts ✅
│   │   └── router/
│   │       ├── AppRouter.tsx
│   │       └── PrivateRoute.tsx
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
│       ├── temp/
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
- `tasks` — tareas con autorreferencia para subtareas
- `task_tags` — relación many to many entre tasks y tags

### Decisiones importantes

- RLS activado en todas las tablas
- Trigger `handle_new_user` — crea perfil automáticamente al registrarse (username = email provisional)
- Trigger `handle_updated_at` — actualiza updated_at automáticamente en tasks
- `status` y `priority` tienen `NOT NULL` desde la segunda migración
- Migración aplicada con `supabase db push`
- Tipos generados con `supabase gen types typescript --project-id REF --schema public`
- Comando ejecutar desde la raíz del proyecto, no desde backend/supabase/

---

## Archivos importantes

### `frontend/src/services/supabase/client.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### `frontend/src/services/tasks.service.ts`

```typescript
import { supabase } from "./supabase/client";
import type { Task, InsertTask, UpdateTask } from "../types/task.types";

export const getTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw error;
  return data ?? [];
};

export const getTaskById = async (id: Task["id"]): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createTask = async (task: InsertTask): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data!;
};

export const updateTask = async (
  id: Task["id"],
  task: UpdateTask,
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update(task)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data!;
};

export const deleteTask = async (id: Task["id"]): Promise<void> => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
};
```

### `frontend/src/services/projects.service.ts`

```typescript
import { supabase } from "./supabase/client";
import type {
  Project,
  InsertProject,
  UpdateProject,
} from "../types/project.types";

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from("projects").select("*");
  if (error) throw error;
  return data ?? [];
};

export const getProjectById = async (
  id: Project["id"],
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createProject = async (
  project: InsertProject,
): Promise<Project> => {
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data!;
};

export const updateProject = async (
  id: Project["id"],
  project: UpdateProject,
): Promise<Project> => {
  const { data, error } = await supabase
    .from("projects")
    .update(project)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data!;
};

export const deleteProject = async (id: Project["id"]): Promise<void> => {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
};
```

### `frontend/src/types/task.types.ts`

```typescript
import type { Database } from "./supabase.types";
import type { Project } from "./project.types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type InsertTask = Database["public"]["Tables"]["tasks"]["Insert"];
export type UpdateTask = Database["public"]["Tables"]["tasks"]["Update"];

export type TaskWithTags = Task & { tags: Tag[] };
export type TaskWithProject = Task & { project: Project | null };
export type TaskComplete = Task & {
  tags: Tag[];
  project: Project | null;
  subtasks: Task[];
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
```

### `frontend/src/types/project.types.ts`

```typescript
import type { Database } from "./supabase.types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type InsertProject = Database["public"]["Tables"]["projects"]["Insert"];
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"];
```

### `frontend/src/utils/task.utils.ts`

```typescript
export const statusLabels: Record<string, string> = {
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completada",
};

export const priorityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};
```

### `frontend/src/context/auth/auth.types.ts`

```typescript
import type { User } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "SIGN_OUT" }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type AuthContextType = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
```

### `frontend/src/context/auth/auth.reducer.ts`

```typescript
import type { AuthAction, AuthState } from "./auth.types";

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false, error: null };
    case "SIGN_OUT":
      return { ...state, user: null, loading: false, error: null };
    case "SET_LOADING":
      return { ...state, loading: true, error: null };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
```

### `frontend/src/context/auth/AuthContext.tsx`

```typescript
import { createContext, useEffect, useReducer } from 'react'
import { supabase } from '../../services/supabase/client'
import { authReducer } from './auth.reducer'
import type { AuthContextType, AuthState } from './auth.types'

export const AuthContext = createContext<AuthContextType | null>(null)

const initialState: AuthState = { user: null, loading: true, error: null }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) dispatch({ type: 'SET_USER', payload: session.user })
      else dispatch({ type: 'SIGN_OUT' })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) dispatch({ type: 'SET_USER', payload: session.user })
        else dispatch({ type: 'SIGN_OUT' })
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING' })
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) dispatch({ type: 'SET_USER', payload: data.user })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al iniciar sesión' })
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING' })
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) dispatch({ type: 'SET_USER', payload: data.user })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al registrarse' })
    }
  }

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING' })
      await supabase.auth.signOut()
      dispatch({ type: 'SIGN_OUT' })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cerrar sesión' })
    }
  }

  return (
    <AuthContext.Provider value={{ state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### `frontend/src/context/auth/useAuth.ts`

```typescript
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
```

### `frontend/src/context/tasks/tasks.types.ts`

```typescript
import type { InsertTask, Task, UpdateTask } from "../../types/task.types";

export type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

export type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "CREATE_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: Task["id"] }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type TaskContextType = {
  state: TaskState;
  getTasks: () => Promise<void>;
  createTask: (task: InsertTask) => Promise<void>;
  updateTask: (id: Task["id"], task: UpdateTask) => Promise<void>;
  deleteTask: (id: Task["id"]) => Promise<void>;
};
```

### `frontend/src/context/projects/projects.types.ts`

```typescript
import type {
  InsertProject,
  Project,
  UpdateProject,
} from "../../types/project.types";

export type ProjectState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

export type ProjectAction =
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "CREATE_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: Project["id"] }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; payload: string };

export type ProjectContextType = {
  state: ProjectState;
  getProjects: () => Promise<void>;
  createProject: (project: InsertProject) => Promise<void>;
  updateProject: (id: Project["id"], project: UpdateProject) => Promise<void>;
  deleteProject: (id: Project["id"]) => Promise<void>;
};
```

### `frontend/src/main.tsx`

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './router/AppRouter'
import { AuthProvider } from './context/auth/AuthContext'
import { TaskProvider } from './context/tasks/TaskContext'
import { ProjectProvider } from './context/projects/ProjectContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <ProjectProvider>
          <AppRouter />
        </ProjectProvider>
      </TaskProvider>
    </AuthProvider>
  </StrictMode>
)
```

### `frontend/src/router/AppRouter.tsx`

```typescript
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { TasksPage } from '../features/tasks/pages/TasksPage'
import { PrivateRoute } from './PrivateRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tasks" element={
          <PrivateRoute>
            <TasksPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/tasks" />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## Commits realizados

```
chore(backend): create folder structure and seed file
feat(backend): add initial schema migration with RLS
feat(frontend): install core dependencies
feat(frontend): configure tailwindcss v4
chore(frontend): create folder structure
feat(frontend): add supabase and task types
feat(frontend): add auth context with useReducer
feat(frontend): add router with public and private routes
feat(frontend): add login page with form validation and auth
feat(frontend): add register page with password confirmation
style(frontend): add split screen layout and responsive fix to auth pages
feat(frontend): add tasks service with CRUD operations
feat(frontend): add tasks context with useReducer
feat(frontend): add tasks page with create and list functionality
style(frontend): add tasks page styles and status translations
feat(backend): add not null constraints to status and priority
feat(frontend): add update and delete task functionality
fix(frontend): fix form reset on task edit
fix(frontend): add htmlFor and id attributes to form labels
refactor(frontend): split auth context into separate files
refactor(frontend): split tasks context into separate files
feat(frontend): add projects service and context
```

---

## Dónde lo dejamos

- ✅ Configuración inicial completa
- ✅ Base de datos con RLS, triggers y NOT NULL en status/priority
- ✅ Tipos TypeScript generados y organizados por entidad
- ✅ AuthContext separado en auth.types, auth.reducer, AuthContext, useAuth
- ✅ TaskContext separado en tasks.types, tasks.reducer, TaskContext, useTask
- ✅ ProjectContext separado en projects.types, projects.reducer, ProjectContext, useProject
- ✅ Router con rutas públicas y privadas
- ✅ LoginPage y RegisterPage con estilos split screen
- ✅ TasksService y ProjectsService con CRUD completo
- ✅ TasksPage con crear, listar, editar y eliminar tareas
- ✅ Formulario inteligente — muestra status solo al editar
- ✅ Traducciones de status y priority al español

## Próximos pasos

1. Tags — service, types y context (igual que projects)
2. Header con email del usuario y botón cerrar sesión
3. Componente TaskCard separado
4. Filtros por status y priority
5. UI pulida con Tailwind

---

## Notas importantes

- **Zod v4**: usar `z.email()` en lugar de `z.string().email()` (deprecado en v4)
- **Backend**: no tiene package.json ni npm, usa Deno. No hay que arrancar nada localmente
- **VITE_SUPABASE_URL**: solo el dominio, sin `/rest/v1/` al final
- **`.env.local`**: debe tener el punto inicial, si no Vite no lo lee
- **supabase gen types**: ejecutar desde la raíz del proyecto, no desde backend/supabase/
- **Commits**: `tipo(scope): descripción` — ej: `feat(frontend): add login page`
- Los servicios van en `services/` directamente, solo `client.ts` dentro de `services/supabase/`
- Los contextos están organizados por funcionalidad: `context/auth/`, `context/tasks/`, `context/projects/`
- Los tipos están organizados por entidad: `types/task.types.ts`, `types/project.types.ts`
- Los componentes nunca llaman a Supabase directamente, solo los servicios
- Estado global con useReducer + Context, sin Zustand ni Redux
- Los valores técnicos van en inglés en la BD y se traducen solo en la UI con statusLabels/priorityLabels
- `key={editingTask?.id ?? 'new'}` en el formulario fuerza el reset correcto de react-hook-form al editar
