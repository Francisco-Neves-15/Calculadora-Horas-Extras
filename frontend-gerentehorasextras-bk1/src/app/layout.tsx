import type { Metadata } from "next";
import { Urbanist, Sora } from "next/font/google";

import "./globals.css";
import "../style/theme.scss"

import { ThemeProvider } from "@/contexts/useThemeContext"

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
    <html data-theme-mode="light" lang="en-US" dir="ltr">
      <body
        className={`${urbanist.variable} ${sora.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
