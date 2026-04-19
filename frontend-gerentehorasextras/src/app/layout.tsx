import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";

// Fonts
import localFont from "next/font/local";

// Style
import "../styles/_reset.scss";
import "../styles/theme.scss";
import "./globals.css";
import "../styles/_variables.scss";
import "../styles/_mixins.scss";
import "../styles/_global.scss";
import "../styles/details/scrollbar.scss";
import "../styles/details/selection.scss";

// Providers
import { ThemeProvider } from "@/contexts/useThemeContext";
import { LangProvider } from "@/contexts/useLangContext";
import { AlertsProvider } from "@/contexts/useAlertsContext";
import { ToastsProvider } from "@/contexts/useToastsContext";

// Script
import { getThemeBootInlineScript } from "./theme-boot-script";

// Using
import { AVAILABLE_LANGCODE, ISO_LANG_MAP } from "@/lang/main";

// Fonts Creating

const urbanist = localFont({
  src: "../../public/fonts/Urbanist/Urbanist-Regular.ttf",
  variable: "--font-urbanist",
});

const sora = localFont({
  src: "../../public/fonts/Sora/Sora-Regular.ttf",
  variable: "--font-sora",
});

// Favicon

const PATH_FAVICON_LIGHT: string = "favicon/favicon-v2/favicon-v2-black.ico";
const PATH_FAVICON_DARK: string = "favicon/favicon-v2/favicon-v2-white.ico";

// Meta

export const metadata: Metadata = {
  title: "Gerente de Horas Extras",
  description: "Gerenciamento pessoal de Horas Extras",
  icons: {
    icon: [
      { url: PATH_FAVICON_DARK, media: "(prefers-color-scheme: dark)" },
      { url: PATH_FAVICON_LIGHT, media: "(prefers-color-scheme: light)" },
    ],
  },
};

function resolveRequestLang(acceptLanguage: string | null | undefined) {
  const fallback = ISO_LANG_MAP.US;
  if (!acceptLanguage) return fallback;

  const supported = Object.values(ISO_LANG_MAP);

  // e.g.: "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
  const tokens = acceptLanguage
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  for (const token of tokens) {
    const code = token.split(";")[0]?.trim();
    if (!code) continue;

    // match
    if (supported.includes(code as AVAILABLE_LANGCODE)) return code;

    // match generic (pt -> pt-BR)
    const primary = code.split("-")[0]?.toLowerCase();
    if (!primary) continue;
    const found = supported.find((l) => l.toLowerCase().startsWith(primary + "-"));
    if (found) return found;
  }

  return fallback;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const initialResolvedLang = resolveRequestLang(hdrs.get("accept-language"));

  return (
    <html lang={initialResolvedLang} dir="ltr" suppressHydrationWarning>
      <head>
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getThemeBootInlineScript() }}
        />
      </head>

      <body
        className={`${urbanist.variable} ${sora.variable} antialiased`}
        suppressHydrationWarning
      >
        <LangProvider initialResolvedLang={initialResolvedLang as AVAILABLE_LANGCODE}>
          <ThemeProvider>
            <AlertsProvider>
              <ToastsProvider>
                <main>{children}</main>
              </ToastsProvider>
            </AlertsProvider>
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}
