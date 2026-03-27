import { ISO_LANG_MAP, AVAILABLE_LANGCODE, AVAILABLE_ISOCODE, AVAILABLE_LANGCODE_GENERIC } from "./main"

// ISO -> LANGCODE (ex: "BR" -> "pt-BR")
export function isoToLangCode(
  iso: AVAILABLE_ISOCODE
): AVAILABLE_LANGCODE {
  return ISO_LANG_MAP[iso];
}

// LANGCODE -> ISO (ex: "pt-BR" -> "BR")

const LANG_TO_ISO = Object.fromEntries(
  Object.entries(ISO_LANG_MAP).map(([iso, lang]) => [lang, iso])
) as Record<AVAILABLE_LANGCODE, AVAILABLE_ISOCODE>;

export function langCodeToISO(
  lang: AVAILABLE_LANGCODE
): AVAILABLE_ISOCODE {
  return LANG_TO_ISO[lang];
}

// Generalize LANGCODE (ex: "pt-BR" -> "pt")
export function generalizeLang(
  lang: AVAILABLE_LANGCODE
): AVAILABLE_LANGCODE_GENERIC {
  return lang.split("-")[0] as AVAILABLE_LANGCODE_GENERIC;
}
