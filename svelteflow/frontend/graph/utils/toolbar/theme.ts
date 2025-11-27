import { theme } from "../../stores/themeStoreore";

export function toggleTheme() {
  theme.update((t) => (t === "light" ? "dark" : "light"));
}
