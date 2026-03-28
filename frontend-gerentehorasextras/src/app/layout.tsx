import type { Metadata } from "next";

// Fonts
import { Urbanist, Sora } from "next/font/google";

// Style
import "./globals.css";
import "../style/theme.scss"

// Providers
import { ThemeProvider } from "@/contexts/useThemeContext"
import { LangProvider } from "@/contexts/useLangContext"

// Fonts Creating

const urbanist = Urbanist({
  variable: "--font-urbanist-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-urbanist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerente de Horas Extras",
  description: "Gerenciamento pessoal de Horas Extras",
  // icons: {
  //   icon: [
  //     { url: "/favicon/favicon-v2/favicon-v2-white.ico", media: "(prefers-color-scheme: dark)" },
  //     { url: "/favicon/favicon-v2/favicon-v2-black.ico", media: "(prefers-color-scheme: light)" },
  //   ],
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme-mode="light" data-theme-palette="default" lang="en-US" dir="ltr">
      <body
        className={`${urbanist.variable} ${sora.variable} antialiased`}
      >
        <ThemeProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
