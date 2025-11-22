import { theme } from "../stores/themeStore";

export function toggleTheme() {
  theme.update((t) => (t === "light" ? "dark" : "light"));
}
