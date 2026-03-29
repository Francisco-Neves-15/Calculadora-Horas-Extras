import type { Metadata } from "next";

// Fonts
import { Urbanist, Sora } from "next/font/google";

// Style
import "./globals.css";
import "../styles/theme.scss";

// Providers
import { ThemeProvider } from "@/contexts/useThemeContext"
import { LangProvider } from "@/contexts/useLangContext"
import { AlertsProvider } from "@/contexts/useAlertsContext"

// Fonts Creating

const urbanist = Urbanist({
  variable: "--font-urbanist-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-urbanist-sans",
  subsets: ["latin"],
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
    <html data-theme-mode="light" data-theme-palette="default" lang="en-US" dir="ltr">
      <LangProvider>
        <ThemeProvider>
          <AlertsProvider>
            <body className={`${urbanist.variable} ${sora.variable} antialiased`}>
              {children}
            </body>
          </AlertsProvider>
        </ThemeProvider>
      </LangProvider>
    </html>
  );
}
