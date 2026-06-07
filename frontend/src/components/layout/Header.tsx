import { CheckSquare, LogOut, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import { ThemeToggle } from "../ui/ThemeToggle/ThemeToggle";

export default function Header() {
  const {
    state: { user },
    signOut,
  } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-main-bg/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <CheckSquare aria-hidden="true" className="text-white" size={22} />
          </div>
          <h1 className="truncate text-base font-semibold tracking-tight text-main-text sm:text-lg">
            Mi Gestor de <span className="text-primary">Tareas</span>
          </h1>
        </div>

        <nav
          aria-label="Navegacion principal"
          className="order-3 col-span-2 mx-auto flex w-full max-w-md items-center justify-center rounded-2xl border border-border/80 bg-card-bg/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:order-0 lg:col-span-1"
        >
          <NavLink
            to={"/tasks"}
            className={({ isActive }) =>
              `flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition-all duration-300 active:scale-[0.98] ${
                isActive
                  ? "bg-primary text-white shadow-[0_10px_24px_-18px_rgba(24,63,148,0.9)]"
                  : "text-main-text/60 hover:bg-border/60 hover:text-main-text"
              }`
            }
          >
            Tareas
          </NavLink>
          <NavLink
            to={"/projects"}
            className={({ isActive }) =>
              `flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition-all duration-300 active:scale-[0.98] ${
                isActive
                  ? "bg-primary text-white shadow-[0_10px_24px_-18px_rgba(24,63,148,0.9)]"
                  : "text-main-text/60 hover:bg-border/60 hover:text-main-text"
              }`
            }
          >
            Proyectos
          </NavLink>
          <NavLink
            to={"/tags"}
            className={({ isActive }) =>
              `flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition-all duration-300 active:scale-[0.98] ${
                isActive
                  ? "bg-primary text-white shadow-[0_10px_24px_-18px_rgba(24,63,148,0.9)]"
                  : "text-main-text/60 hover:bg-border/60 hover:text-main-text"
              }`
            }
          >
            Etiquetas
          </NavLink>
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden min-w-0 items-center gap-2 rounded-2xl border border-border/70 bg-card-bg/70 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:flex">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-border/70">
              <User
                aria-hidden="true"
                size={16}
                className="text-main-text/60"
              />
            </div>
            <span className="max-w-36 truncate text-xs font-medium text-main-text/70 md:max-w-52">
              {user?.email ?? "Usuario"}
            </span>
          </div>
          <button
            onClick={signOut}
            aria-label="Cerrar sesion"
            className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-danger-hover transition-all duration-300 hover:bg-danger/10 active:scale-[0.98] sm:px-3"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
