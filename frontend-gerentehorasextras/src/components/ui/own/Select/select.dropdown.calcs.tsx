import { CSSProperties, RefObject } from "react";
import { TResolvedPosition, TDropdownPosition } from "./index";

function resolveDropdownPosition({
  openButtonRef,
  preferred
}: {
  openButtonRef: RefObject<HTMLButtonElement | null>;
  preferred: TDropdownPosition;
}): TResolvedPosition {
  if (!openButtonRef) return "bottom-right";

  const rect = openButtonRef.current?.getBoundingClientRect();
  if (!rect) return "bottom-right";

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const spaces = {
    top: rect.top,
    bottom: viewport.height - rect.bottom,
    left: rect.left,
    right: viewport.width - rect.right,
  };

  // Force
  if (preferred !== "adapt" && preferred !== "top" && preferred !== "bottom") {
    return preferred;
  }

  // Vertical Axis (top or bottom)
  let vertical: "top" | "bottom";

  if (preferred === "top") vertical = "top";
  else if (preferred === "bottom") vertical = "bottom";
  else vertical = spaces.bottom >= spaces.top ? "bottom" : "top";

  // Horizontal Axis (left or right)
  const horizontal: "left" | "right" =
    spaces.right >= spaces.left ? "right" : "left";

  return `${vertical}-${horizontal}` as TResolvedPosition;
}

function getDropdownStyle(position: TResolvedPosition): CSSProperties {
  const offset = 4;

  const base: CSSProperties = {
    position: "absolute",
    transform: "none",
  };

  switch (position) {
    case "bottom-left":
      return {
        ...base,
        top: "100%",
        left: "auto",
        right: 0,
        marginTop: offset,
      };

    case "bottom-right":
      return {
        ...base,
        top: "100%",
        left: 0,
        right: "auto",
        marginTop: offset,
      };

    case "top-left":
      return {
        ...base,
        bottom: "100%",
        top: "auto",
        left: "auto",
        right: 0,
        marginBottom: offset,
      };

    case "top-right":
      return {
        ...base,
        bottom: "100%",
        top: "auto",
        left: 0,
        right: "auto",
        marginBottom: offset,
      };
  }
}

export const calculateDropdown = ({
  openButtonRef,
  dropdownPosition,
  setDropdownMeta
}: {
  openButtonRef: RefObject<HTMLButtonElement | null>;
  dropdownPosition: TDropdownPosition;
  setDropdownMeta: (args: { position: TResolvedPosition; style: CSSProperties; } ) => void;
}) => {
  if (!openButtonRef) return;

  if (!openButtonRef.current) return;

  const resolved = resolveDropdownPosition({ openButtonRef, preferred: dropdownPosition });

  const style = getDropdownStyle(resolved);

  setDropdownMeta({
    position: resolved,
    style,
  });
};
