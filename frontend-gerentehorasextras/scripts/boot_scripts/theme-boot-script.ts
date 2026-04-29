import { THEME_STORAGE_KEYS, HTML_KEY_MODE } from "@/configs/theme-storage";

/**
 * Runs before React hydrates: reads localStorage and applies attributes/variables
 * same as ThemeProvider, avoiding theme flash (light → dark).
 */

export function getThemeBootInlineScript(): string {
  const keysJson = JSON.stringify(THEME_STORAGE_KEYS);

  return `
(function () {
  try {
    var K = ${keysJson};
    var html = document.documentElement;
    var storedMode = localStorage.getItem(K.mode);
    var resolved =
      storedMode === "light" || storedMode === "dark"
        ? storedMode
        : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    html.setAttribute(${JSON.stringify(HTML_KEY_MODE)}, resolved);

    var cp = localStorage.getItem(K.colorPrimary);
    var cc = localStorage.getItem(K.colorPrimaryContrast);
    var ca = localStorage.getItem(K.colorPrimaryAlpha);
    if (cp) html.style.setProperty("--color-primary", cp);
    if (cc) html.style.setProperty("--color-primaryContrast", cc);
    if (ca) html.style.setProperty("--color-primaryAlpha", ca);

  } catch (e) {}
})();
`.trim();
}
