"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
// type ThemeResolved = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  // resolvedTheme: ThemeResolved;

  setTheme: (t: Theme) => void;

  colorPrimary: string;
  setColorPrimary: (c: string) => void;

  colorPrimaryContrast: string;
  setColorPrimaryContrast: (c: string) => void;
};

const ThemeContext = createContext({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const [colorPrimary, setColorPrimary] = useState("#27427F");
  const [colorPrimaryContrast, setColorPrimaryContrast] = useState("#ffffff");

  // const resolvedTheme = theme;

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme", theme);

    root.style.setProperty("--color-primary", colorPrimary);
    root.style.setProperty("--color-primary-contrast", colorPrimaryContrast);
  }, [theme, colorPrimary, colorPrimaryContrast]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        // resolvedTheme,
        setTheme,
        colorPrimary,
        setColorPrimary,
        colorPrimaryContrast,
        setColorPrimaryContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
