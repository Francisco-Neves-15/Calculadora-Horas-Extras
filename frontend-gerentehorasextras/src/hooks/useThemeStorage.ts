import { ThemeModeOptions } from "@/configs/theme-mode.metadata";
import { ThemePaletteOptions } from "@/configs/theme-palette.metadata";

// Tyles
import { TCustomPalettesColors } from "@/types/theme";


// Storage

const STORAGE_KEY_MODE = "client-theme-mode";
const STORAGE_KEY_PALETTE = "client-theme-palette";

const STORAGE_KEY_CUSTOM_PALETTES = "client-theme-custom-palettes";
const STORAGE_KEY_CUSTOM_PALETTE_SELECTED = "client-theme-custom-palette-id";

export const HTML_KEY_MODE = "data-theme-mode";
export const HTML_KEY_PALETTE = "data-theme-palette";

export function useThemeStorage() {
  const getThemeMode = () =>
    localStorage.getItem(STORAGE_KEY_MODE) as ThemeModeOptions | null;

  const getThemePalette = () =>
    localStorage.getItem(STORAGE_KEY_PALETTE) as ThemePaletteOptions | null;

  const getCustomPalettes = () => {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PALETTES);

    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as TCustomPalettesColors) : [];
    } catch {
      return [];
    }
  };

  const getSelectedCustomPaletteId = () =>
    localStorage.getItem(STORAGE_KEY_CUSTOM_PALETTE_SELECTED);

  const setThemeMode = (mode: ThemeModeOptions) => {
    if (mode === "system") {
      localStorage.removeItem(STORAGE_KEY_MODE);
      return;
    }

    localStorage.setItem(STORAGE_KEY_MODE, mode);

    // API sync point:
    // send the chosen theme mode to backend here
  };

  const setThemePalette = (palette: ThemePaletteOptions) => {
    if (palette === "default") {
      localStorage.removeItem(STORAGE_KEY_PALETTE);
      return;
    }

    localStorage.setItem(STORAGE_KEY_PALETTE, palette);
  };

  const setCustomPalettes = (list: TCustomPalettesColors) => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PALETTES, JSON.stringify(list));

    // API sync point:
    // send the updated custom palette list to backend here
  };

  const setSelectedCustomPaletteId = (id: string | null) => {
    if (!id) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_PALETTE_SELECTED);
      return;
    }

    localStorage.setItem(STORAGE_KEY_CUSTOM_PALETTE_SELECTED, id);

    // API sync point:
    // send the selected custom palette id to backend here
  };

  return {
    getThemeMode,
    getThemePalette,
    getCustomPalettes,
    getSelectedCustomPaletteId,
    setThemeMode,
    setThemePalette,
    setCustomPalettes,
    setSelectedCustomPaletteId,
  };
}
