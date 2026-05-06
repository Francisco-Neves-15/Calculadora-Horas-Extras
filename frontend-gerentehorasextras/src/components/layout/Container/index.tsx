"use client";
import { CSSProperties } from "react";

// Components
import { Header } from "@/components/layout/Header";
import { View } from "@/components/ui/own/View";



interface IContainer {
  children: React.ReactNode;
  style?: CSSProperties;
  className?: string;
  padding?: number | boolean;
  header?: boolean;
  footer?: boolean;
}

export const Container = ({
  children,
  style,
  className,
  padding = false,
  header = true,
  footer = true,
}: IContainer) => {

  // auto padding | has padding and is a number: use the entered value, else: use the default "16", else: don't use padding
  const paddingV = padding ? ( typeof(padding) === "number" ? padding : 16 ) : 0 

  return (
    <View style={{ flex: 1 }}>
      {header && (
        <Header/>
      )}
      <div style={{ flex: 1, padding: paddingV, ...style }} className={className}>
        {children}
      </div>
      {footer && (
        <></>
      )}
    </View>
  )
};
