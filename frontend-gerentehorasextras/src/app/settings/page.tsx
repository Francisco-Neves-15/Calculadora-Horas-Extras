"use client";

import type { CSSProperties } from "react";

// 
import { useLang } from "@/contexts/useLangContext";
import { useTheme } from "@/contexts/useThemeContext";

// 
import { useI18n } from "@/hooks/useI18n";

// Lang
import { AVAILABLE_LANGCODE, ISO_LANG_MAP } from "@/lang/main";

// Metadata
import { THEME_MODE_META, ThemeModeOptions } from "@/configs/theme-mode.metadata";
import { THEME_PALETTE_META, ThemePaletteOptions } from "@/configs/theme-palette.metadata";
import { LANG_META, LangOptions } from "@/configs/lang.metadata";

// 
const MODE_ORDER = Object.keys(THEME_MODE_META) as ThemeModeOptions[];
const PALETTE_ORDER = Object.keys(
  THEME_PALETTE_META
) as ThemePaletteOptions[];
const LANG_ORDER: LangOptions[] = [
  "system",
  ...(Object.values(ISO_LANG_MAP) as AVAILABLE_LANGCODE[]),
];

const optButtonStyle = (active: boolean): CSSProperties => ({
  fontWeight: active ? 700 : 400,
  outline: active ? "2px solid currentColor" : undefined,
  marginRight: 8,
  marginBottom: 8,
});

const sectionStyle: CSSProperties = {
  marginBottom: 24,
};

export default function Settings() {

  const { langOption, setLang } = useLang();

  const {
    themeMode,
    setThemeMode,
    themePalette,
    setThemePalette,
  } = useTheme();

  // const tPage = useI18n("pag-settings");
  const tData = useI18n("data-settings");

  const paletteLabel = (p: ThemePaletteOptions) => {
    if (p === "default") return tData[THEME_PALETTE_META.default.id];
    return p;
  };

  return (
    <div style={{ padding: 16 }}>
      <section style={sectionStyle}>
        <h2 style={{ fontSize: "1rem", marginBottom: 8 }}>Theme mode</h2>
        <div>
          {MODE_ORDER.map((mode) => {
            const meta = THEME_MODE_META[mode];
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setThemeMode(mode)}
                style={optButtonStyle(themeMode === mode)}
              >
                {tData[meta.id]}
              </button>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ fontSize: "1rem", marginBottom: 8 }}>Theme palette</h2>
        <div>
          {PALETTE_ORDER.map((palette) => (
            <button
              key={palette}
              type="button"
              onClick={() => setThemePalette(palette)}
              style={optButtonStyle(themePalette === palette)}
            >
              {paletteLabel(palette)}
            </button>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ fontSize: "1rem", marginBottom: 8 }}>Idioma</h2>
        <div>
          {LANG_ORDER.map((opt) => {
            const meta = LANG_META[opt];
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setLang(opt)}
                style={optButtonStyle(langOption === opt)}
              >
                {tData[meta.id]}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
