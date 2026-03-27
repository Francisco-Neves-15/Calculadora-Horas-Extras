// ISO 3166

export const ISO_LANG_MAP = {
  BR: "pt-BR",
  US: "en-US",
  FR: "fr-FR",
  ES: "es-ES",
} as const;

// following ISO 3166-1 | A2
export type AVAILABLE_ISOCODE = keyof typeof ISO_LANG_MAP;

// following ISO 639-1 ||| ll-cc | ll: lang code | cc: country code
export type AVAILABLE_LANGCODE = typeof ISO_LANG_MAP[AVAILABLE_ISOCODE];

// generic
export type AVAILABLE_LANGCODE_GENERIC = AVAILABLE_LANGCODE extends `${infer L}-${string}` ? L : never;
