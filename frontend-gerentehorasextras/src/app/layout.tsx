import type { Metadata } from "next";
import { Urbanist, Sora } from "next/font/google";

import "./globals.css";
import "../style/pallete-theme.scss"

import { ThemeProvider } from "@/hooks/useThemeContext"

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
  //     { url: "/favicon/favicon-dark.ico", media: "(prefers-color-scheme: light)" },
  //     { url: "/favicon/favicon-light.ico", media: "(prefers-color-scheme: dark)" },
  //   ],
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="light" lang="en-US" dir="ltr">
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
