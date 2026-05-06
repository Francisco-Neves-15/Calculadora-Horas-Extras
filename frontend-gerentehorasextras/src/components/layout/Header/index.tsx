"use client";
import { CSSProperties, useMemo } from "react";
import Image from "next/image";

// Styles
import fStyles from "./style.module.scss"

// Components
import { View } from "@/components/ui/own/View";

// Hooks
import { useMedia } from "@/hooks/useMedia";

// Internal
import { Navbar } from "../Navbar"


interface IHeader {
  style?: CSSProperties;
  className?: string;
}

export const Header = ({
  style,
  className,
}: IHeader) => {
  const { mediaScreenType } = useMedia();

  // Size
  const getHeaderSize = () => {
    if (mediaScreenType === "large") return 80;
    else if (mediaScreenType === "medium") return 70;
    else return 60;
  };
  const headerSize: number = getHeaderSize();

  // Logo

  const PATH_LOGO_WHITE: string = "/logo/hx-logos-v2/Logo-v2-EX-White.png";
  const PATH_LOGO_BLACK: string = "/logo/hx-logos-v2/Logo-v2-EX-Black.png";

  // Size

  const getLogosSize = useMemo(() => {
    if (mediaScreenType === "large") {
      return { abs: headerSize - 20 }
    } else if (mediaScreenType === "medium") {
      return { abs: headerSize - 20 }
    } else {
      return { abs: headerSize - 12 }
    }
  }, [mediaScreenType])

  const logoAbsDimensions: number = getLogosSize.abs; 

  return (
    <header 
      className={`${fStyles.header} ${className}`}
      style={{
        "--header-size": `${headerSize}px`,
        ...style
      } as React.CSSProperties}
    >
      <View className={fStyles.headerLogo}>
        <>
          <Image
            className={`${fStyles.headerLogoAbs} ${fStyles.headerLogoAbsLight}`}
            src={PATH_LOGO_WHITE}
            alt="Site Logo White in Header (Abstract 1:1 Logo)"
            width={logoAbsDimensions}
            height={logoAbsDimensions}
          />
          <Image
            className={`${fStyles.headerLogoAbs} ${fStyles.headerLogoAbsDark}`}
            src={PATH_LOGO_BLACK}
            alt="Site Logo Black in Header (Abstract 1:1 Logo)"
            width={logoAbsDimensions}
            height={logoAbsDimensions}
          />
        </>
      </View>
      <Navbar/>
    </header>
  )
};
