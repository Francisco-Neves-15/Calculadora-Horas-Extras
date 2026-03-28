import { AVAILABLE_LANGCODE } from "@/lang/main";
import { LANG_META, LangOptions } from "@/configs/lang.metadata";

export function getResolvedLang(option: LangOptions): AVAILABLE_LANGCODE {
  return LANG_META[option].resolve();
}
