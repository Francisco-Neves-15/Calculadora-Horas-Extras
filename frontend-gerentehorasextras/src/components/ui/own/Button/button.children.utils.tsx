import { ReactNode, isValidElement, Children } from "react";

import fStyles from "./style.module.scss";
import Text from "@/components/ui/own/Text";

type ResolveChildrenOptions = {
  underline?: boolean;
};

// Safely merge className
const mergeClassName = (existing?: string, underline?: boolean) => {
  const classesToAdd = [fStyles.buttonText];

  if (underline) classesToAdd.push(fStyles.buttonTextUnderline);
  if (!existing) return classesToAdd.join(" ");

  const missingClasses = classesToAdd.filter((className) => !existing.includes(className));

  if (missingClasses.length === 0) return existing;

  return `${missingClasses.join(" ")} ${existing}`;
};

// Recursive children resolver
export const resolveButtonChildren = (
  children: ReactNode,
  options: ResolveChildrenOptions = {}
): ReactNode => {
  return Children.map(children, (child) => {

    // Treat only plain text/number. If an element is passed (Text, p, span, etc),
    // preserve it as-is to avoid invalid nested markup (<p> inside <p>).

    if (typeof child === "string" || typeof child === "number") {
      if (String(child).trim() === "") return null;

      return (
        <Text size="button" className={mergeClassName(undefined, options.underline)}>
          {child}
        </Text>
      );
    }

    // Case: not a valid React element
    if (!isValidElement(child)) return child;
    return child;
  });
};
