import { AVAILABLE_LANGCODE, ISO_LANG_MAP } from "@/lang/main";
import { resolveBrowserLang } from "@/lang/utils";

/** Preferência de idioma: fixa ou `system` (idioma do navegador). */
export type LangOptions = "system" | AVAILABLE_LANGCODE;

type LangMeta = {
  id: string;
  resolve: () => AVAILABLE_LANGCODE;
};

const concreteMeta = Object.fromEntries(
  (Object.values(ISO_LANG_MAP) as AVAILABLE_LANGCODE[]).map((code) => [
    code,
    {
      id: `lang-opt-${code}`,
      resolve: () => code,
    },
  ])
) as Record<AVAILABLE_LANGCODE, LangMeta>;

export const LANG_META: Record<LangOptions, LangMeta> = {
  ...concreteMeta,
  system: {
    id: "lang-opt-system",
    resolve: () => resolveBrowserLang(),
  },
};
