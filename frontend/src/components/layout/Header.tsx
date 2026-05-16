import { CheckSquare, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth";
import { ThemeToggle } from "../ui/ThemeToggle/ThemeToggle";

export default function Header() {
  const { state: { user }, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-600 rounded-lg">
          <CheckSquare aria-hidden="true" className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight dark:text-gray-100">
          Mi Gestor de <span className="text-emerald-600">Tareas</span>
        </h1>
      </div>

      <nav aria-label="Navegación principal" className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <User aria-hidden="true" size={20} className="text-gray-600 dark:text-gray-300" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.email ?? "Usuario"}
          </span>
        </div>
        <button
          onClick={signOut}
          aria-label="Cerrar sesión"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}
