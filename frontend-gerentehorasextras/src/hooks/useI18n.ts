"use client";

import { useLang } from "@/hooks/useLang";

// Strings
import { pageHomeStrings } from "../lang/strings/pages/home";
import { pageSettingsStrings } from "../lang/strings/pages/settings";

import { commonStrings } from "../lang/strings/geral/common";
import { dataSettingsStrings } from "../lang/strings/geral/dataSettings";

type ModuleStrings = Record<string, string>;

type IModulesPages = "pag-home" | "pag-settings";
type IModulesGeral = "common" | "data-settings";

export function useI18n(module: IModulesPages | IModulesGeral): ModuleStrings {
  const { resolvedLang } = useLang();

  switch (module) {
    case "common":
      return commonStrings[resolvedLang];
    case "data-settings":
      return dataSettingsStrings[resolvedLang];
    case "pag-home":
      return pageHomeStrings[resolvedLang];
    case "pag-settings":
      return pageSettingsStrings[resolvedLang];
    default:
      return {};
  }

}
