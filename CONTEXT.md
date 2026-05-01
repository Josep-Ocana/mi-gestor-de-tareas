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
│   │   │   │       └── LoginPage.tsx ✅
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

### `frontend/.env.local`
```
VITE_SUPABASE_URL=https://tuprojectref.supabase.co   ← solo el dominio, sin /rest/v1/
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### `frontend/src/services/supabase/client.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### `frontend/src/context/AuthContext.tsx`
```typescript
import { createContext, useReducer, useEffect, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase/client'

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

const AuthContext = createContext<AuthContextType | null>(null)
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
import { LoginPage } from '../features/auth/pages/LoginPage'
import { PrivateRoute } from './PrivateRoute'

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

### `frontend/src/features/auth/pages/LoginPage.tsx`
```typescript
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const loginSchema = z.object({
  email: z.email('Introduce un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, state } = useAuth()

  const initialValues: LoginFormData = { email: '', password: '' }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialValues,
  })

  const onSubmit = async (data: LoginFormData) => {
    const { email, password } = data
    await signIn(email, password)
    if (!state.error) {
      reset()
      navigate('/tasks')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('email')} placeholder="tu@email.com" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <input {...register('password')} type="password" placeholder="Tu Password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      {state.error && <span>{state.error}</span>}
      <button type="submit">Entrar</button>
    </form>
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
```

---

## Dónde lo dejamos
- ✅ Configuración inicial completa
- ✅ Base de datos con RLS y triggers
- ✅ Tipos TypeScript generados
- ✅ AuthContext con useReducer
- ✅ Router con rutas públicas y privadas
- ✅ LoginPage funcionando con validación y redirección a /tasks

## Próximos pasos
1. Página de Register (muy similar a Login)
2. Estilos con Tailwind en las páginas de auth
3. Servicios CRUD de tareas, proyectos y tags
4. Contexto de tareas con useReducer
5. Páginas y componentes de tareas
6. UI completa con Tailwind

---

## Notas importantes
- **Zod v4**: usar `z.email()` en lugar de `z.string().email()` (deprecado en v4)
- **Backend**: no tiene package.json ni npm, usa Deno. No hay que arrancar nada localmente
- **VITE_SUPABASE_URL**: solo el dominio, sin `/rest/v1/` al final
- **`.env.local`**: debe tener el punto inicial, si no Vite no lo lee
- **Commits**: `tipo(scope): descripción` — ej: `feat(frontend): add login page`
- Los componentes nunca llaman a Supabase directamente, solo los servicios
- Estado global con useReducer + Context, sin Zustand ni Redux
