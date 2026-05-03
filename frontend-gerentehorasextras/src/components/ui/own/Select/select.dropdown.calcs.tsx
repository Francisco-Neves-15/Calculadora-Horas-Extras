import { CSSProperties, RefObject } from "react";
import { TResolvedPosition, TDropdownPosition } from "./index";

function resolveDropdownPosition({
  openButtonRef,
  preferred
}: {
  openButtonRef: RefObject<HTMLButtonElement | null>;
  preferred: TDropdownPosition;
  // spaces: { top: number; bottom: number; left: number; right: number },
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

function getDropdownStyle(
  rect: DOMRect,
  position: TResolvedPosition
): CSSProperties {

  const offset = 4;

  switch (position) {
    case "bottom-left":
      return {
        top: rect.bottom + offset,
        left: rect.right,
        transform: "translateX(-100%)",
      };

    case "bottom-right":
      return {
        top: rect.bottom + offset,
        left: rect.left,
      };

    case "top-left":
      return {
        top: rect.top - offset,
        left: rect.right,
        transform: "translateX(-100%) translateY(-100%)",
      };

    case "top-right":
      return {
        top: rect.top - offset,
        left: rect.left,
        transform: "translateX(0%) translateY(-100%)",
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

  const rect = openButtonRef.current?.getBoundingClientRect();
  if (!rect) return;

  const resolved = resolveDropdownPosition({ openButtonRef, preferred: dropdownPosition });

  const style = getDropdownStyle(rect, resolved);

  setDropdownMeta({
    position: resolved,
    style,
  });
};
