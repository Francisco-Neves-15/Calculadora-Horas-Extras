"use client";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  CSSProperties,
  useMemo
} from "react";

// Icons
import { LuX, LuChevronDown } from "react-icons/lu";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "./style.module.scss"

// Components
import View from "@/components/ui/View"
import Text from "@/components/ui/Text"
import Button, { TButtonVariants } from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import DivisorLine from "@/components/ui/DivisorLine"

// Hooks
import { useI18n } from "@/hooks/useI18n";
import { useMedia } from "@/hooks/useMedia";

// Utils
import { throttle } from "@/utils/geral";

// Dropdown
import { calculateDropdown } from "./select.dropdown.calcs";



// Types & Interfaces

interface IListSelect {
  value: unknown;
  labelBox?: string;
  labelList?: string | React.ReactNode;
  id: string;
}

export type TSelectItems = IListSelect | number | string;
type TSelectVariant = TButtonVariants;

type TResolvedBehavoir = "dropdown" | "modal";
type TSelectBehavoir = "adapt" | TResolvedBehavoir;

export type TResolvedPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type TDropdownPosition = "adapt" | "top" | "bottom" | TResolvedPosition;

// Ref Control
type TShowOptions = {
  behavior?: TSelectBehavoir;
};

export interface ISelectRef {
  open: (options?: TShowOptions) => void;
  close: () => void;
  toggle: (options?: TShowOptions) => void;
}

type TState = {
  open: boolean;
  mounted: boolean;
  runtimeBehavior: TSelectBehavoir | null;
};

// Component

interface ISelect {
  items: TSelectItems[];
  value: TSelectItems | null;
  onChangeValue: (item: TSelectItems) => void;
  search?: boolean;
  defaultValueIdOrIndex?: string | number | null;
  placeholder?: string;
  hideButton?: boolean;
  behavoir?: TSelectBehavoir;
  dropdownPosition?: TDropdownPosition;
  // Fixs Values (Suffix's and Prefix's)
  fixTexts?: {
    boxSuffix?: string | null;
    boxPrefix?: string | null;
    listSuffix?: string | null;
    listPrefix?: string | null;
  };
  // Styles
  boxVariant?: TSelectVariant;
  boxStyles?: {
    style?: CSSProperties;
    className?: string;
  };
  modalStyles?: {
    style?: CSSProperties;
    className?: string;
    listItemStyle?: CSSProperties;
    listItemClassName?: string;
  };
  dropdownStyles?: {
    style?: CSSProperties;
    className?: string;
    listItemStyle?: CSSProperties;
    listItemClassName?: string;
  };
};

// Util
export function selectValueIsPrimitive(item: TSelectItems): item is string | number {
  return typeof item === "string" || typeof item === "number";
}

export const Select = forwardRef<ISelectRef, ISelect>(({
  items = [],
  value,
  onChangeValue,
  defaultValueIdOrIndex = null,
  placeholder,
  behavoir = "adapt",
  dropdownPosition = "adapt",
  fixTexts,
  // Styles
  boxVariant = "sub",
  boxStyles,
  modalStyles,
  dropdownStyles,
  hideButton = false,
}, ref) => {

  // const pathname = usePathname();
  const tCommon = useI18n("common");
  const { gColors } = useGlobalStyles();

  const { mediaScreenType } = useMedia();

  // For Select
  
  const [state, setState] = useState<TState>({
    open: false,
    mounted: false,
    runtimeBehavior: null
  });
  
  // For Dropdown
  const [dropdownMeta, setDropdownMeta] = useState<{
    position: TResolvedPosition;
    style: CSSProperties;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    open: (options?: TShowOptions) => open(options),
    close: () => close(),
    toggle: (options?: TShowOptions) => toggle(options)
  }));

  // Button's Ref
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Dropdown Ref
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Ui
  const resolvedPlaceholder = placeholder ? placeholder : tCommon["common-select"];

  // Layout

  const isSmall = mediaScreenType === "small";

  const resolveBehavior = (): "modal" | "dropdown" => {
    const behavior = state.runtimeBehavior ?? behavoir;

    if (behavior !== "adapt") return behavior;

    return isSmall ? "modal" : "dropdown";
  };

  // Flags

  const behavior = resolveBehavior();

  const isModal = behavior === "modal";
  const isDropdown = behavior === "dropdown";

  // Toggle

  const open = (options?: TShowOptions) => {

    if (options?.behavior === "dropdown" && hideButton) {
      console.error(
        `DEVs: Cannot open Select with behavior="dropdown" when hideButton=true. Dropdown will not be rendered.`
      );
      return;
    }

    setState(prev => ({
      ...prev,
      open: true,
      runtimeBehavior: options?.behavior ?? null
    }));

    requestAnimationFrame(() => {
      setState(prev => ({
        ...prev,
        mounted: true
      }));
    });
  };

  const close = () => {
    setState(prev => ({
      ...prev,
      mounted: false
    }));
    setState(prev => ({
      ...prev,
      open: false,
      runtimeBehavior: null
    }));
  };

  const toggle = (options?: TShowOptions) => {
    if (state.open) close();
    else open(options);
  };

  // Autofocus on buttons
  useEffect(() => {
    if (state.open && isModal) {
      closeButtonRef.current?.focus();
    } else {
      openButtonRef.current?.focus();
    };
  }, [state.open]);

  // Autoclose
  // useEffect(() => {
  //   if (isSmall) close();
  //   if (!isSmall) close();
  // }, [mediaScreenType]);

  // Auto Select if "defaultValue"
  useEffect(() => {
    if (defaultValueIdOrIndex === null || defaultValueIdOrIndex === undefined) return;
    if (!items.length) return;

    let selectedItem: TSelectItems | undefined;

    // Primitive List
    if (selectValueIsPrimitive(items[0])) {
      if (typeof defaultValueIdOrIndex === "number") {
        selectedItem = items[defaultValueIdOrIndex];
      } else {
        console.error(`DEVs: For primitive items (number list or string list), defaultValue must be an index.`);
        return;
      }
    } else {
      // Obj's List
      selectedItem = (items as IListSelect[]).find(
        item => item.id === defaultValueIdOrIndex
      );
    };

    if (selectedItem !== undefined) {
      onChangeValue(selectedItem);
    }

  }, [defaultValueIdOrIndex, items]);

  // Auto Calc for the Dropdown
  useEffect(() => {
    if (!state.open || isModal || !isDropdown) return;

    if (hideButton) {
      console.warn("Dropdown calculation skipped: hideButton is true.");
      return;
    }

    const handler = throttle(() => {
      calculateDropdown({ openButtonRef, dropdownPosition, setDropdownMeta });
    }, 100);

    handler();

    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [state.open]);

  // Click's Controls
  useEffect(() => {
    if (!state.open || isModal || !isDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const buttonEl = openButtonRef.current;
      const dropdownEl = dropdownRef.current;

      if (!buttonEl || !dropdownEl) return;

      const clickedInsideButton = buttonEl.contains(target);
      const clickedInsideDropdown = dropdownEl.contains(target);

      if (!clickedInsideButton && !clickedInsideDropdown) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [state.open, isDropdown, isModal]);

  // Current Showing
  const currentDisplayText = useMemo(() => {
    if (!value) return resolvedPlaceholder;
    let final: unknown;
    if (selectValueIsPrimitive(value)) {
      final = value;
    } else {
      final = value.labelBox ?? value.labelList ?? value.value ?? value.id;
    };
    return String(final);
  }, [value]);

  // On Select Hidden
  const onSelectValue = (value: TSelectItems) => {
    onChangeValue(value);
    close();
    // DEBUG
    selectValueIsPrimitive(value) ?
      console.log(value)
      :
      console.log(`${value.id} ${value.labelBox} ${value.labelList} ${value.value}`)
  }

  useEffect(() => {
    console.log(state.open)
  }, [state.open]);

  // Render
  return (
    <>

      {!hideButton && (
        <Button
          ref={openButtonRef}
          variant={boxVariant}
          className={`${fStyles.boxContainer} ${boxStyles?.className}`} 
          style={{ ...boxStyles?.style }}
          onClick={toggle}
        >
          <Text size="button">
            {fixTexts?.boxPrefix && fixTexts?.boxPrefix}
            {currentDisplayText}
            {fixTexts?.boxSuffix && fixTexts?.boxSuffix}
          </Text>
          <View
            className={`transform transition-transform ${!state.open ? "rotate-0" : "-rotate-180"}`} 
          >
            <LuChevronDown size={24} color={gColors.text} />
          </View>
        </Button>
      )}

      {!state.open ? null : (
        <>
          {isModal && (
            <>
              {/* Modal Overlay */}
              <div onClick={close} className={`${fStyles.modalOverlay} ${state.open ? fStyles.open : ""}`}/>
              {/* Modal */}
              <View
                className={`${fStyles.modalContent} ${modalStyles?.className} ${state.open ? fStyles.open : ""}`} 
                style={{ ...modalStyles?.style }}
              >
                <View className={`${fStyles.modalContentList}`}>
                  {items.map((value, index, array) => (
                    <>
                      <button
                        key={`${index}-list-item-button`}
                        className={`${fStyles.modalContentListItem} ${modalStyles?.listItemClassName}`}
                        style={{ ...modalStyles?.listItemStyle }}
                        onClick={() => onSelectValue(value)}
                      >
                        {selectValueIsPrimitive(value) ? (
                          <Text size="body">{String(value)}</Text>
                        ) : typeof value.labelList === "string" ? (
                          <Text size="body">{value.labelList}</Text>
                        ) : (
                          value.labelList
                        )}
                      </button>
                      <DivisorLine key={`${index}-list-item-dl`} show={(index + 1) !== array.length} />
                    </>
                  ))}
                </View>
              </View>
            </>
          )}
          {isDropdown && dropdownMeta && (
            <View
              ref={dropdownRef}
              className={`
                ${fStyles.dropdownContent} 
                ${fStyles[dropdownMeta.position]}
                ${dropdownStyles?.className} 
                ${state.open ? fStyles.open : ""}
              `} 
              style={{
                position: "fixed",
                ...dropdownMeta.style,
                ...dropdownStyles?.style
              }}
            >
              <View className={`${fStyles.dropdownContentList}`}>
                {items.map((value, index, array) => (
                  <>
                    <button
                      key={`${index}-list-item-button`}
                      className={`${fStyles.dropdownContentListItem} ${dropdownStyles?.listItemClassName}`}
                      style={{ ...dropdownStyles?.listItemStyle }}
                      onClick={() => onSelectValue(value)}
                    >
                      {selectValueIsPrimitive(value) ? (
                        <Text size="caption">{String(value)}</Text>
                      ) : typeof value.labelList === "string" ? (
                        <Text size="caption">{value.labelList}</Text>
                      ) : (
                        value.labelList
                      )}
                    </button>
                    <DivisorLine key={`${index}-list-item-dl`} show={(index + 1) !== array.length} />
                  </>
                ))}
              </View>
            </View>
          )}
        </>
      )}

    </>
  )
});

Select.displayName = "Select";
