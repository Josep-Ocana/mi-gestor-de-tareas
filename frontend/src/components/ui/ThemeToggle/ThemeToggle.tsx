import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../../context/theme/useTheme";

export function ThemeToggle() {
  const { state, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={
        state.theme === "dark"
          ? "Cambiar a modo claro"
          : "Cambiar a modo oscuro"
      }
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-main-text/70 hover:bg-border/30 rounded-md transition-colors"
    >
      {state.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
