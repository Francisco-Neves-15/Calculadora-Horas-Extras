import { THEME_STORAGE_KEYS } from "@/configs/theme-storage";
import { THEMES_PALETTES } from "@/configs/theme-palette.metadata";

/**
 * Executa antes do React hidratar: lê localStorage e aplica atributos / variáveis
 * igual ao ThemeProvider, evitando flash de tema (light → dark).
 */

export function getThemeBootInlineScript(): string {
  const keysJson = JSON.stringify(THEME_STORAGE_KEYS);
  const palettesJson = JSON.stringify(Object.keys(THEMES_PALETTES));

  return `
(function () {
  try {
    var K = ${keysJson};
    var PALETTES = ${palettesJson};
    var html = document.documentElement;
    var storedMode = localStorage.getItem(K.mode);
    var resolved =
      storedMode === "light" || storedMode === "dark"
        ? storedMode
        : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    html.setAttribute("data-theme-mode", resolved);

    var palRaw = localStorage.getItem(K.palette);
    var palette = PALETTES.indexOf(palRaw) !== -1 ? palRaw : "default";
    html.setAttribute("data-theme-palette", palette);

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
