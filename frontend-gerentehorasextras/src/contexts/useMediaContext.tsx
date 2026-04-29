"use client";

import { createContext, useEffect, useState } from "react";

// Configs
import { 
  LayoutTypeOptions, 
  ScreenTypeOptions, 
  BREAKPOINTS, 
  HTML_KEY_LAYOUT_TYPE, 
  HTML_KEY_SCREEN_TYPE
} from "@/configs/media.metadata";

// Configs

// Contexts
export const MediaContext = createContext({} as MediaContextType);

type MediaContextType = {
  mediaLayoutType: LayoutTypeOptions;
  mediaScreenType: ScreenTypeOptions;
  windowWidth: number;
  windowHeight: number;
  screenWidth: number;
  screenHeight: number;
};

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [mediaLayoutType, setMediaLayoutType] = useState<LayoutTypeOptions>("compact");
  const [mediaScreenType, setMediaScreenType] = useState<ScreenTypeOptions>("medium");

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;

      const sWidth = window.screen.width;
      const sHeight = window.screen.height;

      // screen type
      let screenType: ScreenTypeOptions = "medium";

      if (wWidth <= BREAKPOINTS.small) {
        screenType = "small";
      } else if (wWidth <= BREAKPOINTS.large) {
        screenType = "medium";
      } else {
        screenType = "large";
      }

      // layout type
      const layoutType: LayoutTypeOptions = wWidth <= BREAKPOINTS.large ? "compact" : "expanded";

      setMediaScreenType(screenType);
      setMediaLayoutType(layoutType);

      setWindowSize({ width: wWidth, height: wHeight });
      setScreenSize({ width: sWidth, height: sHeight });

      // ===== DOM sync

      const root = document.documentElement;

      root.setAttribute(HTML_KEY_SCREEN_TYPE, screenType);
      root.setAttribute(HTML_KEY_LAYOUT_TYPE, layoutType);

      root.style.setProperty("--breakpoint-small", `${BREAKPOINTS.small}px`);
      root.style.setProperty("--breakpoint-large", `${BREAKPOINTS.large}px`);

      root.style.setProperty("--window-width", `${wWidth}px`);
      root.style.setProperty("--window-height", `${wHeight}px`);
    };

    update();

    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <MediaContext.Provider
      value={{
        mediaLayoutType,
        mediaScreenType,
        windowWidth: windowSize.width,
        windowHeight: windowSize.height,
        screenWidth: screenSize.width,
        screenHeight: screenSize.height,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}