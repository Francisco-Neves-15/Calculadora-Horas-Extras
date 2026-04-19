import type { Metadata } from "next";
import Script from "next/script";

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

import { getThemeBootInlineScript } from "./theme-boot-script";

// Fonts Creating

const urbanist = localFont({
  src: "../../public/fonts/Urbanist/Urbanist-Regular.ttf",
  variable: "--font-urbanist",
});

const sora = localFont({
  src: "../../public/fonts/Sora/Sora-Regular.ttf",
  variable: "--font-sora",
});

const PATH_FAVICON_LIGHT: string = "favicon/favicon-v2/favicon-v2-black.ico";
const PATH_FAVICON_DARK: string = "favicon/favicon-v2/favicon-v2-white.ico";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" dir="ltr" suppressHydrationWarning>
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
        <LangProvider>
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
