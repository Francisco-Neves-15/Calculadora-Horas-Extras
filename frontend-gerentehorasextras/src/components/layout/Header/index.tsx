"use client";
import { CSSProperties, useMemo } from "react";
import Image from "next/image";

// Styles
import fStyles from "./style.module.scss"

// Components
import View from "@/components/ui/View"

// Hooks
import { useMedia } from "@/hooks/useMedia";

// Internal
import { Navbar } from "../Navbar"


interface IHeader {
  style?: CSSProperties;
  className?: string;
}

const Header = ({
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

  const PATH_ABS_LOGO_WHITE: string = "/logo/abs/tmtc-logo-white.png";
  const PATH_ABS_LOGO_BLACK: string = "/logo/abs/tmtc-logo-black.png";
  const PATH_WORD_LOGO_WHITE: string = "/logo/word/tmtc-word-white.png";
  const PATH_WORD_LOGO_BLACK: string = "/logo/word/tmtc-word-black.png";

  // Size

  const getLogosSize = useMemo(() => {
    if (mediaScreenType === "large") {
      return { abs: headerSize - 20, word: 320 }
    } else if (mediaScreenType === "medium") {
      return { abs: headerSize - 20, word: 240 }
    } else {
      return { abs: headerSize - 12, word: 0 }
    }
  }, [mediaScreenType])

  const logoAbsDimensions: number = getLogosSize.abs; 
  const logoWordDimensions: number = getLogosSize.word;

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
            src={PATH_ABS_LOGO_WHITE}
            alt="Site Logo White in Header (Abstract 1:1 Logo)"
            width={logoAbsDimensions}
            height={logoAbsDimensions}
          />
          <Image
            className={`${fStyles.headerLogoAbs} ${fStyles.headerLogoAbsDark}`}
            src={PATH_ABS_LOGO_BLACK}
            alt="Site Logo Black in Header (Abstract 1:1 Logo)"
            width={logoAbsDimensions}
            height={logoAbsDimensions}
          />
        </>
        {mediaScreenType !== "small" && (
          <>
            <Image
              className={`${fStyles.headerLogoWord} ${fStyles.headerLogoWordLight}`}
              src={PATH_WORD_LOGO_WHITE}
              alt="Site Logo White in Header (Word/Letter Logo)"
              width={logoWordDimensions}
              height={logoWordDimensions}
            />
            <Image
              className={`${fStyles.headerLogoWord} ${fStyles.headerLogoWordDark}`}
              src={PATH_WORD_LOGO_BLACK}
              alt="Site Logo Black in Header (Word/Letter Logo)"
              width={logoWordDimensions}
              height={logoWordDimensions}
            />
          </>
        )}
      </View>
      <Navbar/>
    </header>
  )
}

export default Header;
Header.displayName = "Header";
