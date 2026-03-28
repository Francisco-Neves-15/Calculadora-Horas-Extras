import { useLang } from "../contexts/useLangContext";

// Strings
import { homeStrings } from "../lang/strings/home";
import { commonStrings } from "../lang/strings/common";

type ModuleStrings = Record<string, string>;

export function useStrings(module: "home" | "settings" | "common"): ModuleStrings {
  const { lang } = useLang();

  switch (module) {
    case "home":
      return homeStrings[lang];
    case "common":
      return commonStrings[lang];
    default:
      return {};
  }
}
