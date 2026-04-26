import { BREAKPOINTS, HTML_KEY_LAYOUT_TYPE, HTML_KEY_SCREEN_TYPE } from "@/configs/media.metadata";

/**
 * Runs before React hydrates, applies attributes/variables
 * same as MediaProvider.
 */

export function getMediaBootInlineScript(): string {

  return `
(function () {
  var width = window.innerWidth;

  var small = ${BREAKPOINTS.small};
  var large = ${BREAKPOINTS.large};

  var screenType = "medium";
  if (width <= small) screenType = "small";
  else if (width <= large) screenType = "medium";
  else screenType = "large";

  var layoutType = width <= large ? "compact" : "expanded";

  var root = document.documentElement;
  // Important: attribute names must be quoted in the emitted inline script.
  root.setAttribute(${JSON.stringify(HTML_KEY_SCREEN_TYPE)}, screenType);
  root.setAttribute(${JSON.stringify(HTML_KEY_LAYOUT_TYPE)}, layoutType);
})();
`.trim();
}
