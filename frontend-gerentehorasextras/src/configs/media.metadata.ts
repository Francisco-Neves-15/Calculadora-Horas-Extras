export const HTML_KEY_LAYOUT_TYPE = "data-layout-type";
export const HTML_KEY_SCREEN_TYPE = "data-screen-type";

export const BREAKPOINTS = {
  small: 600,
  large: 1200,
} as const;

export const LAYOUT_TYPE = {
  compact: "compact",
  expanded: "expanded",
} as const;

export const SCREEN_TYPE = {
  small: "small",
  medium: "medium",
  large: "large",
} as const;

export type LayoutTypeOptions = keyof typeof LAYOUT_TYPE;
export type ScreenTypeOptions = keyof typeof SCREEN_TYPE;
