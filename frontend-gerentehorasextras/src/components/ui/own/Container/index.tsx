"use client";
import { CSSProperties } from "react";

// Components
import View from "@/components/ui/own/View"


interface IContainer {
  children: React.ReactNode;
  style?: CSSProperties;
  className?: string;
  padding?: number | boolean;
}

const Container = ({
  children,
  style,
  className,
  padding = false,
}: IContainer) => {

  // auto padding | has padding and is a number: use the entered value, else: use the default "16", else: don't use padding
  const paddingV = padding ? ( typeof(padding) === "number" ? padding : 16 ) : 0 

  return (
    <View style={{ flex: 1 }}>
      <header style={{ height: 20, backgroundColor: "blue" }}>
        test
      </header>
      <div style={{ flex: 1, padding: paddingV, ...style }} className={className}>
        {children}
      </div>
      <footer style={{ height: 20, backgroundColor: "green" }}>
        test
      </footer>
    </View>
  )
}

export default Container;
Container.displayName = "Container";
