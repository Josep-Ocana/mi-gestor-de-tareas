import { CheckSquare, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth";
import { ThemeToggle } from "../ui/ThemeToggle/ThemeToggle";

export default function Header() {
  const {
    state: { user },
    signOut,
  } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-main-bg border-b border-border shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary rounded-lg">
          <CheckSquare aria-hidden="true" className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold text-main-text tracking-tight">
          Mi Gestor de <span className="text-primary">Tareas</span>
        </h1>
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex items-center gap-4"
      >
        <ThemeToggle />
        <div className="flex items-center gap-3 pr-4 border-r border-border">
          <div className="w-10 h-10 bg-border rounded-full flex items-center justify-center border border-border">
            <User
              aria-hidden="true"
              size={20}
              className="text-main-text/70"
            />
          </div>
          <span className="text-sm font-medium text-main-text">
            {user?.email ?? "Usuario"}
          </span>
        </div>
        <button
          onClick={signOut}
          aria-label="Cerrar sesión"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-danger-hover hover:bg-danger/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}
