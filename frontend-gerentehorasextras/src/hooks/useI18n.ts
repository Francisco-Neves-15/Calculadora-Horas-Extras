"use client";

import { useLang } from "@/hooks/useLang";

// Strings
import { page_str_layoutTest } from "../lang/strings/pages/layout_test";
import { page_str_home } from "../lang/strings/pages/home";
import { page_str_settings } from "../lang/strings/pages/settings";
import { page_str_notFound } from "../lang/strings/pages/not-found";

import { errors_str } from "../lang/strings/geral/errors";
import { common_str } from "../lang/strings/geral/common";
import { data_settings_str } from "../lang/strings/geral/dataSettings";

type ModuleStrings = Record<string, string>;

type IModulesPages = "pag-home" | "pag-settings" | "pag-layout_test" | "pag-notFound";
type IModulesGeral = "common" | "data-settings" | "errors";

export function useI18n(module: IModulesPages | IModulesGeral): ModuleStrings {
  const { resolvedLang } = useLang();

  // prettier-ignore
  switch (module) {
    // Geral
    case "common": return common_str[resolvedLang];
    case "errors": return errors_str[resolvedLang];
    case "data-settings": return data_settings_str[resolvedLang];
    // Pages
    case "pag-layout_test": return page_str_layoutTest[resolvedLang];
    case "pag-home": return page_str_home[resolvedLang];
    case "pag-settings": return page_str_settings[resolvedLang];
    case "pag-notFound": return page_str_notFound[resolvedLang];
    // ==========
    default: return {};
  }
}
