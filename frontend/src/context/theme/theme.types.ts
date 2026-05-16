export type Theme = "light" | "dark";

export type ThemeState = {
  theme: Theme;
};

export type ThemeAction =
  | { type: "SET_THEME"; payload: Theme }
  | { type: "TOGGLE_THEME" };

export type ThemeContextType = {
  state: ThemeState;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};
