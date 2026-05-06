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
import { createPortal } from "react-dom";

// Icons
import { LuX, LuChevronDown } from "react-icons/lu";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "./style.module.scss"

// Components
import { View } from "@/components/ui/own/View"
import { Text } from "@/components/ui/own/Text"
import { Button, TButtonColors, TButtonProportion, TButtonSize, TButtonVariants } from "@/components/ui/own/Button"
import { Input } from "@/components/ui/own/Input"
import { DivisorLine } from "@/components/ui/own/DivisorLine"

// Hooks
import { useI18n } from "@/hooks/useI18n";
import { useMedia } from "@/hooks/useMedia";

// Utils
import { extractTextFromNode, normalizeSearchText } from "@/utils/strings";

// Dropdown
import { calculateDropdown } from "./select.dropdown.calcs";



// Types & Interfaces

interface IListSelect {
  value: unknown;
  labelBox?: string | React.ReactNode;
  labelList?: string | React.ReactNode;
  id: string;
}

export type TSelectItems = IListSelect | number | string;
type TSelectVariant = TButtonVariants;
type TSelectColors = TButtonColors;
type TSelectSize = TButtonSize;
type TSelectProportion = TButtonProportion;

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
  hideChevron?: boolean;
  disabled?: boolean;
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
  boxStyles?: {
    boxVariant?: TSelectVariant;
    boxColor?: TSelectColors;
    boxSize?: TSelectSize;
    boxProportion?: TSelectProportion;
    icon?: boolean;
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
  search = false,
  defaultValueIdOrIndex = null,
  placeholder,
  behavoir = "adapt",
  hideButton = false,
  hideChevron = false,
  disabled = false,
  dropdownPosition = "adapt",
  fixTexts,
  // Styles
  boxStyles,
  modalStyles,
  dropdownStyles,
}, ref) => {

  // const pathname = usePathname();
  const tCommon = useI18n("common");
  const { gColors } = useGlobalStyles();

  const { mediaScreenType } = useMedia();

  // For Select
  const [searchQuery, setSearchQuery] = useState("");

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
    if (disabled) return;

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
    if (disabled) return;

    setState(prev => ({
      ...prev,
      mounted: false
    }));
    setState(prev => ({
      ...prev,
      open: false,
      runtimeBehavior: null
    }));
    setSearchQuery("");
  };

  const toggle = (options?: TShowOptions) => {
    if (disabled) return;
    if (state.open) close();
    else open(options);
  };

  // Autofocus on buttons
  useEffect(() => {
    if (!isModal) return;
    if (state.open) {
      closeButtonRef.current?.focus();
    } else {
      openButtonRef.current?.focus();
    };
  }, [state.open, isModal]);

  // Auto Select if "defaultValue"
  useEffect(() => {
    if (disabled) return;
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

  // Autoclose on change media
  useEffect(() => {
    close();
  }, [mediaScreenType]);

  // Auto Calc for the Dropdown
  useEffect(() => {
    if (!state.open || isModal || !isDropdown) return;

    if (hideButton) {
      console.warn("Dropdown calculation skipped: hideButton is true.");
      return;
    }

    calculateDropdown({ openButtonRef, dropdownPosition, setDropdownMeta });

    const handleScroll = (event: Event) => {
      const target = event.target;

      if (dropdownRef.current?.contains(target as Node)) return;

      close();
    };

    window.addEventListener("resize", close);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [state.open]);

  // Controls (when dropdown)
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

  // Controls (when modal)
  useEffect(() => {
    if (!state.open || isDropdown || !isModal) return;

    const handlePressEsc = (event: globalThis.KeyboardEvent) => {
      if (event.code === "Escape") close();
    };

    document.addEventListener("keydown", handlePressEsc);

    return () => {
      document.removeEventListener("keydown", handlePressEsc);
    };
  }, [state.open, isDropdown, isModal]);

  // Current Showing
  const currentDisplaying = useMemo<React.ReactNode>(() => {
    if (!value) return <Text size="body">{resolvedPlaceholder}</Text>;

    if (selectValueIsPrimitive(value)) {
      const first = items[0];
      const itemsAreObjects = first !== undefined && !selectValueIsPrimitive(first);

      if (itemsAreObjects) {
        const found = (items as IListSelect[]).find((it) => it.value === value || it.id === String(value));
        if (found) {
          if (typeof found.labelBox === "string") return <Text size="body">{found.labelBox}</Text>;
          if (found.labelBox) return found.labelBox;
          if (typeof found.labelList === "string") return <Text size="body">{found.labelList}</Text>;
          if (found.labelList) return found.labelList;
          return <Text size="body">{String(found.value ?? found.id)}</Text>;
        }
      }

      return <Text size="body">{String(value)}</Text>;
    }

    if (typeof value.labelBox === "string") return <Text size="body">{value.labelBox}</Text>;
    if (value.labelBox) return value.labelBox;

    // default fallback's
    if (typeof value.labelList === "string") return <Text size="body">{value.labelList}</Text>;
    if (value.labelList) return value.labelList;
    return <Text size="body">{String(value.value ?? value.id)}</Text>;

  }, [value, items, resolvedPlaceholder]);

  // Filtred Items
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    if (!normalizedQuery) return items;

    return items.filter((item) => {
      if (selectValueIsPrimitive(item)) {
        return normalizeSearchText(item).includes(normalizedQuery);
      }

      const labelAsText = extractTextFromNode(item.labelList);
      // const fallbackValue = item.value;

      return (
        normalizeSearchText(labelAsText).includes(normalizedQuery)
      );
      // to include "item.value" on search
      // normalizeSearchText(fallbackValue).includes(normalizedQuery)
    });
  }, [items, searchQuery]);

  // On Select Value
  const onSelectValue = (value: TSelectItems) => {
    if (disabled) return;
    onChangeValue(value);
    close();
    // DEBUG
    // selectValueIsPrimitive(value) ?
    //   console.log(value)
    //   :
    //   console.log(`${value.id} ${value.labelBox} ${value.labelList} ${value.value}`)
  }

  // Render
  return (
    <>

      {!hideButton && (
        <div className={fStyles.dropdownAnchor}>
          <Button
            ref={openButtonRef}
            variant={boxStyles?.boxVariant ?? "secondary"}
            color={boxStyles?.boxColor ?? "theme"}
            size={boxStyles?.boxSize ?? "normal"}
            proportion={boxStyles?.boxProportion ?? "normal"}
            icon={boxStyles?.icon ?? false}
            className={`${fStyles.boxContainer} ${boxStyles?.className}`} 
            style={{ ...boxStyles?.style }}
            onClick={toggle}
            disabled={disabled}
          >
            <View className="flex flex-row gap-4">
              {fixTexts?.boxPrefix && (
                <Text size="button">{fixTexts?.boxPrefix}</Text>
              )}
              {currentDisplaying}
              {fixTexts?.boxSuffix && (
                <Text size="button">{fixTexts?.boxSuffix}</Text>
              )}
            </View>
            {!hideChevron && (
              <View
                className={`transform transition-transform ${!state.open ? "rotate-0" : "-rotate-180"}`} 
              >
                <LuChevronDown size={24} />
              </View>
            )}
          </Button>
          {state.open && isDropdown && dropdownMeta && (
            <View
              ref={dropdownRef}
              className={`
                ${fStyles.dropdownContent} 
                ${fStyles[dropdownMeta.position]}
                ${dropdownStyles?.className} 
                ${state.open ? fStyles.open : ""}
              `} 
              style={{
                ...dropdownMeta.style,
                ...dropdownStyles?.style
              }}
            >
              <View className={`${fStyles.dropdownContentList}`}>
                {search && (
                  <View className="w-full" style={{ marginBottom: 8 }}>
                    <Input
                      variant="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={tCommon["common-search"]}
                      clearFunction={() => setSearchQuery("")}
                      variantsConfigs={{
                        showSearchButton: false,
                      }}
                      containerClassName="w-full"
                      style={{ fontSize: 14 }}
                    />
                  </View>
                )}
                {filteredItems.map((value, index, array) => (
                  <React.Fragment key={`${index}-dropdown-list-item`}>
                    <button
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
                    <DivisorLine show={(index + 1) !== array.length} />
                  </React.Fragment>
                ))}
                {(filteredItems.length === 0 && search) && (
                  <Text size="caption" style={{ marginTop: 8, marginBottom: 8 }}>{tCommon["common-search-empty"]}</Text>
                )}
                {items.length === 0 && (
                  <Text size="caption" style={{ marginTop: 8, marginBottom: 8 }}>{tCommon["common-list-empty"]}</Text>
                )}
              </View>
            </View>
          )}
        </div>
      )}

      {!state.open ? null : (
        <>
          {isModal &&
            createPortal(
              <>
                {/* Modal Overlay */}
                <div onClick={close} className={`${fStyles.modalOverlay} ${state.open ? fStyles.open : ""}`}/>
                {/* Modal */}
                <View
                  className={`${fStyles.modalContent} ${modalStyles?.className} ${state.open ? fStyles.open : ""}`} 
                  style={{ ...modalStyles?.style }}
                >
                  <Button
                    ref={closeButtonRef}
                    icon
                    proportion="square"
                    variant={"main"}
                    color="danger"
                    onClick={close}
                    className={`${fStyles.modalCloseButton}`}
                  >
                    <LuX size={24} color={gColors.light} />
                  </Button>
                  <View className={`${fStyles.modalContentList}`}>
                    {search && (
                      <View className="w-full" style={{ marginBottom: 8 }}>
                        <Input
                          variant="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={tCommon["common-search"]}
                          clearFunction={() => setSearchQuery("")}
                          variantsConfigs={{
                            showSearchButton: false,
                          }}
                          containerClassName="w-full"
                        />
                      </View>
                    )}
                    {filteredItems.map((value, index, array) => (
                      <React.Fragment key={`${index}-modal-list-item`}>
                        <button
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
                        <DivisorLine show={(index + 1) !== array.length} />
                      </React.Fragment>
                    ))}
                    {(filteredItems.length === 0 && search) && (
                      <Text size="body" style={{ marginTop: 8 }}>{tCommon["common-search-empty"]}</Text>
                    )}
                    {items.length === 0 && (
                      <Text size="body" style={{ marginTop: 8 }}>{tCommon["common-list-empty"]}</Text>
                    )}
                  </View>
                </View>
              </>,
              document.body
            )
          }
        </>
      )}

    </>
  )
});
