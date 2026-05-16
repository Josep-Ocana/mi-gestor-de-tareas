import { createContext, useEffect, useReducer } from "react";
import { themeReducer } from "./theme.reducer";
import type { ThemeContextType, ThemeState } from "./theme.types";

export const ThemeContext = createContext<ThemeContextType | null>(null);

function getInitialTheme(): "light" | "dark" {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", state.theme);
  }, [state.theme]);

  const setTheme = (theme: "light" | "dark") =>
    dispatch({ type: "SET_THEME", payload: theme });
  const toggleTheme = () => dispatch({ type: "TOGGLE_THEME" });

  return (
    <ThemeContext.Provider value={{ state, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
