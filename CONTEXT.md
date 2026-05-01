# Contexto del proyecto — Mi Gestor de Tareas

## Stack tecnológico
- **Frontend:** React 19 + TypeScript + Vite 8
- **Base de datos:** Supabase (PostgreSQL)
- **Estilos:** Tailwind v4 con @tailwindcss/vite
- **Autenticación:** Supabase Auth
- **Estado global:** useReducer + Context (sin Zustand ni Redux)
- **Formularios:** react-hook-form + zod
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
│   │   │   └── tasks/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── pages/
│   │   ├── services/supabase/
│   │   │   └── client.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   ├── supabase.types.ts   ← generado automáticamente
│   │   │   └── task.types.ts
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── router/
│   │       ├── AppRouter.tsx
│   │       └── PrivateRoute.tsx
│   ├── .env.local                  ← no va al repo
│   ├── .env.example                ← sí va al repo
│   └── package.json
├── backend/
│   └── supabase/
│       ├── migrations/
│       │   └── 20260422_init_schema.sql
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
- Migración aplicada con `supabase db push`
- Tipos generados con `supabase gen types typescript --project-id REF --schema public`

---

## Archivos importantes

### `frontend/src/services/supabase/client.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### `frontend/src/types/task.types.ts`
```typescript
import type { Database } from './supabase.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskTag = Database['public']['Tables']['task_tags']['Row']

export type InsertTask = Database['public']['Tables']['tasks']['Insert']
export type InsertProject = Database['public']['Tables']['projects']['Insert']
export type InsertTag = Database['public']['Tables']['tags']['Insert']

export type UpdateTask = Database['public']['Tables']['tasks']['Update']
export type UpdateProject = Database['public']['Tables']['projects']['Update']

export type TaskWithTags = Task & { tags: Tag[] }
export type TaskWithProject = Task & { project: Project | null }
export type TaskComplete = Task & {
  tags: Tag[]
  project: Project | null
  subtasks: Task[]
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
```

### `frontend/src/context/AuthContext.tsx`
```typescript
import { createContext, useReducer, useEffect, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase/client'

// 1. TYPES
type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_LOADING' }
  | { type: 'SET_ERROR'; payload: string }

type AuthContextType = {
  state: AuthState
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// 2. REDUCER
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'SIGN_OUT':
      return { ...state, user: null, loading: false, error: null }
    case 'SET_LOADING':
      return { ...state, loading: true, error: null }
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

// 3. CONTEXT
const AuthContext = createContext<AuthContextType | null>(null)

// 4. PROVIDER
const initialState: AuthState = { user: null, loading: true, error: null }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user })
      } else {
        dispatch({ type: 'SIGN_OUT' })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          dispatch({ type: 'SET_USER', payload: session.user })
        } else {
          dispatch({ type: 'SIGN_OUT' })
        }
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
      console.error(error)
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
      console.error(error)
    }
  }

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING' })
      await supabase.auth.signOut()
      dispatch({ type: 'SIGN_OUT' })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cerrar sesión' })
      console.error(error)
    }
  }

  return (
    <AuthContext.Provider value={{ state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// 5. HOOK
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
```

### `frontend/src/router/PrivateRoute.tsx`
```typescript
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { state: { loading, user } } = useAuth()
  if (loading) return <div>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

### `frontend/src/router/AppRouter.tsx`
```typescript
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'

const LoginPage = () => <div>Login</div>
const RegisterPage = () => <div>Register</div>
const TaskPage = () => <div>Tasks</div>

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tasks" element={
          <PrivateRoute>
            <TaskPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/tasks" />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### `frontend/src/main.tsx`
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
)
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
```

---

## Dónde lo dejamos
- ✅ Configuración inicial completa
- ✅ Base de datos con RLS y triggers
- ✅ Tipos TypeScript generados
- ✅ AuthContext con useReducer
- ✅ Router con rutas públicas y privadas

## Próximos pasos
1. Páginas de Login y Register con formularios
2. Validación con react-hook-form + zod
3. Servicios CRUD de tareas, proyectos y tags
4. Contexto de tareas con useReducer
5. Páginas y componentes de tareas
6. UI completa con Tailwind

---

## Convenciones del proyecto
- Commits: `tipo(scope): descripción` — ej: `feat(frontend): add login page`
- Tipos de commit: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`
- Scopes: `frontend`, `backend`, `shared`
- Los componentes nunca llaman a Supabase directamente, solo los servicios
- Estado global con useReducer + Context, sin Zustand ni Redux
