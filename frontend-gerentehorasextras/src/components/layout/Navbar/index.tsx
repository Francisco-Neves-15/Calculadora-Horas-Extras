"use client";
import { usePathname } from "next/navigation";
import { CSSProperties, useEffect, useRef, useState } from "react";

// Icons
import { LuMenu, LuX, LuSun, LuMoon, LuMonitorSmartphone } from "react-icons/lu";

// Styles
import fStyles from "./style.module.scss"

// Components
import View from "@/components/ui/own/View"
import Text from "@/components/ui/own/Text"
import Button from "@/components/ui/own/Button"

// Hooks
// Hooks
import { useI18n } from "@/hooks/useI18n";
import { useMedia } from "@/hooks/useMedia";
import { useTheme } from "@/hooks/useTheme";

// Configs
import { LayoutTypeOptions } from "@/configs/media.metadata";



type INavbarDir = "horizontal" | "vertical";

interface INavbar {
  style?: CSSProperties;
  className?: string;
  direction?: INavbarDir | null;
}

export const Navbar = ({
  style,
  className,
  direction = null,
}: INavbar) => {

  // const pathname = usePathname();
  const tDataSettings = useI18n("data-settings");

  const { mediaLayoutType, mediaScreenType } = useMedia();
  const { resolvedThemeMode, themeMode, setThemeMode } = useTheme();

  const [currentLayout, setCurrentLayout] = useState<LayoutTypeOptions | null>(null)

  const [navbarExpanded, setNavbarExpanded] = useState(false);
  const [navbarMounted, setNavbarMounted] = useState(false);

  // Button's Ref
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Layout
  const isCompact = currentLayout === "compact";
  const resolvedListDirectionClassName = direction ? direction : isCompact ? fStyles.navbarListCol : fStyles.navbarListRow;

  // Toggle
  const openNavbar = () => {
    setNavbarMounted(true);
    requestAnimationFrame(() => {
      setNavbarExpanded(true);
    });
  };

  const closeNavbar = () => {
    setNavbarExpanded(false);
    setTimeout(() => {
      setNavbarMounted(false);
    }, 200);
  };

  const handleToggle = () => {
    if (navbarExpanded) closeNavbar();
    else openNavbar();
  };

  // Autofocus on buttons
  useEffect(() => {
    if (navbarExpanded) {
      closeButtonRef.current?.focus();
    } else {
      openButtonRef.current?.focus();
    };
  }, [navbarExpanded]);

  // Autoclose
  useEffect(() => {
    if (mediaLayoutType !== currentLayout) {
      setCurrentLayout(mediaLayoutType);
      setNavbarExpanded(false);
    };
  }, [mediaLayoutType]);

  // Handle's
  const handleChangeTheme = () => {
    if (resolvedThemeMode === "light") setThemeMode("dark");
    else setThemeMode("light");
  }

  // Render's

  // Navbar List
  const NavBarList = () => {
    return (
      <div className={`${resolvedListDirectionClassName}`}>
        <View className="w-full flex flex-row justify-between items-center">
          {isCompact && (
            <Text size="h3">{tDataSettings["th-mode-title"]}</Text>
          )}
          <Button
            icon={!isCompact}
            variant={!isCompact ? "ghost" : "outline"}
            onClick={handleChangeTheme}
          >
            {isCompact && (
              <Text size="button">
                {`${tDataSettings[`th-mode-opt-${resolvedThemeMode}`]}`}
              </Text>
            )}
            {resolvedThemeMode === "light" ? <LuSun size={32} /> : <LuMoon size={32} />}
          </Button>
        </View>
      </div>
    )
  }

  return (
    <nav
      aria-expanded={navbarExpanded}
      aria-controls="main-navbar"
      className={`${fStyles.navbar} ${className}`} 
      style={{ ...style }}
    >
      {isCompact && (
        <Button
          ref={openButtonRef}
          icon
          variant="ghost"
          onClick={handleToggle}
        >
          <LuMenu size={32} />
        </Button>
      )}
      {isCompact ? <>
        {navbarMounted && (
          <>
            <div 
              onClick={handleToggle}
              className={`${fStyles.navbarOverlay} ${navbarExpanded ? fStyles.open : ""}`} 
            />
            <View
              className={`${fStyles.navbarCompactedContent} ${navbarExpanded ? fStyles.open : ""}`}
            >
              <View className={`${fStyles.navbarHeader}`}>
                <Button
                  ref={closeButtonRef}
                  icon
                  variant="ghost"
                  onClick={handleToggle}
                >
                  <LuX size={32} />
                </Button>
              </View>
              <NavBarList />
            </View>
          </>
        )}
      </>
        : <NavBarList />
      }
    </nav>
  )
}

Navbar.displayName = "Navbar";
