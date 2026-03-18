import type { Metadata } from "next";
import { Urbanist, Sora } from "next/font/google";

import "./globals.css";
import "../style/pallete-theme.scss"

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="light" lang="en-US">
      <body
        className={`${urbanist.variable} ${sora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
