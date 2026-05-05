"use client";

import { forwardRef, useState } from "react";

// Styles
import fStyles from "./style.module.scss";

// Icons
import { LuX, LuEye, LuEyeClosed, LuSearch, LuCalendar, LuClock, LuCalendarClock } from "react-icons/lu";
import Button from "../Button";
import View from "../View";

export type TInputVariant =
  | "text"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "password"
  | "search"
  | "email";

export interface IInputVariantConfigs {
  showNumberSpinner?: boolean;
  showDatePicker?: boolean;
  showPasswordToggle?: boolean;
  showSearchButton?: boolean;
  searchButtonPosition?: "left" | "right";
  searchButtonFunction?: () => void;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: TInputVariant;
  variantsConfigs?: IInputVariantConfigs;

  containerClassName?: string;
  containerStyle?: React.CSSProperties;

  className?: string;
  style?: React.CSSProperties;

  showClear?: boolean;
  clearFunction?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "text",
      variantsConfigs = {
        showNumberSpinner: false,
        showDatePicker: true,
        showPasswordToggle: true,
        showSearchButton: true,
        searchButtonPosition: "right",
        searchButtonFunction: () => {},
      },

      placeholder,

      containerClassName,
      containerStyle,

      className,
      style,

      showClear = false,
      clearFunction,

      ...props
    },
    ref
  ) => {

    const [focused, setFocused] = useState(false);
    const [isVisiblePassword, setVisiblePassword] = useState(false);

    const isControlled = props.value !== undefined;
    const currentValue = isControlled ? props.value : undefined;
    const hasValue = String(currentValue ?? props.defaultValue ?? "").length > 0;

    // Container
    const classContainerConfig: Record<TInputVariant, string> = {
      text: ``,
      number: ``,
      date: `${fStyles.inputContainerDateOrTime}`,
      time: `${fStyles.inputContainerDateOrTime}`,
      datetime: `${fStyles.inputContainerDateOrTime}`,
      password: `${fStyles.inputContainerPassword}`,
      search: `${fStyles.inputContainerSearch}`,
      email: `${fStyles.inputContainerEmail}`,
    } as const;

    // Input
    const classInputConfig: Record<TInputVariant, string> = {
      text: `${fStyles.inputText}`,
      number: `${fStyles.inputNumber} ${variantsConfigs.showNumberSpinner ? undefined : fStyles.noNumberSpinner}`,
      date: `${fStyles.inputDateOrTime} ${variantsConfigs.showDatePicker ? undefined : fStyles.noDatePicker}`,
      time: `${fStyles.inputDateOrTime} ${variantsConfigs.showDatePicker ? undefined : fStyles.noDatePicker}`,
      datetime: `${fStyles.inputDateOrTime} ${variantsConfigs.showDatePicker ? undefined : fStyles.noDatePicker}`,
      password: `${fStyles.inputPassword}`,
      search: `${fStyles.inputSearch}`,
      email: `${fStyles.inputContainerEmail}`,
    } as const;

    const getClassContainerConfig = (variant: TInputVariant) => {
      return classContainerConfig[variant];
    };
    const getClassInputConfig = (variant: TInputVariant) => {
      return classInputConfig[variant];
    };

    // Handle's

    const handleClear = () => {

      if (clearFunction) {
        clearFunction();
        return;
      }

      if (props.onChange) {
        props.onChange({
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>);
        return;
      }

      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.value = "";
        ref.current.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      if (process.env.NODE_ENV !== "production") {
        alert("Input: clearFunction not provided");
      }

    };

    const handleInput = (el: HTMLInputElement) => {
      if (showClear && !props.onChange && !props.value && process.env.NODE_ENV !== "production") {
        console.warn(
          `[Input] showClear enabled but component is uncontrolled and no value/onChange provided. Clear behavior may be limited.\nElement: ${el}`
        );
      }

    }

    // Extras Items

    const leftItems: React.ReactNode[] = [];
    const rightItems: React.ReactNode[] = [];

    // Clear Icon

    if (showClear && hasValue) {

      if (!(variant === "date" || variant === "time" || variant === "datetime")) {

        const clearBtn = (
          <Button
            key="btn-inputClear"
            size="small"
            variant="ghost"
            color="theme"
            onClick={handleClear}
            className={fStyles.inputBtnInternal}
          >
            <View className="flex justify-center items-center" style={{ width: 20 }}>
              <LuX size={20} />
            </View>
          </Button>
        );
  
        rightItems.push(clearBtn);

      };

    };

    // Search

    if (variant === "search" && variantsConfigs.showSearchButton) {

      const searchBtn = (
        <Button
          key="btn-inputSearch"
          size="small"
          variant="ghost"
          color="theme"
          onClick={variantsConfigs.searchButtonFunction}
          className={fStyles.inputBtnInternal}
        >
          <View className="flex justify-center items-center" style={{ width: 20 }}>
            <LuSearch size={20} />
          </View>
        </Button>
      );

      if (variantsConfigs.searchButtonPosition === "left") {
        leftItems.push(searchBtn);
      } else {
        rightItems.push(searchBtn);
      }

    } else if (variant === "password" && variantsConfigs.showPasswordToggle) {

      const passwordToggleBtn = (
        <Button
          key="btn-togglePassword"
          size="small"
          variant="ghost"
          color="theme"
          onClick={() => setVisiblePassword((prev) => !prev)}
          className={`${fStyles.inputBtnInternal}`}
        >
          <View className="flex justify-center items-center" style={{ aspectRatio: 1, width: 20 }}>
            {isVisiblePassword ? <LuEye size={20} /> : <LuEyeClosed size={20} />}
          </View>
        </Button>
      );

      rightItems.push(passwordToggleBtn);

    }

    // Slots
    
    const leftSlot = leftItems.length ? (
      <div className={fStyles.leftSlot}>{leftItems}</div>
    ) : null;

    const rightSlot = rightItems.length ? (
      <div className={fStyles.rightSlot}>{rightItems}</div>
    ) : null;

    // Math on spacing:
    // if you have leftItems/rightItems, add a spacing of 24 (icon size + padding in .inputBtnInternal);
    // plus a default space (4);
    // plus the gap in .leftSlot and .rightSlot (4 * number of items).

    const iconsFullSize = 24; // icon size + padding in .inputBtnInternal
    const gapBetween = 8; // gap between icon's and input field
    const gapsPerItems = 4; // gap in .leftSlot and .rightSlot

    const leftSpace1 = (iconsFullSize * leftItems.length);
    const leftSpace2 = (gapBetween * leftItems.length);
    const leftSpace3 = (leftItems.length > 1 ? gapsPerItems * leftItems.length : 0);
    const rightSpace1 = ( iconsFullSize * rightItems.length);
    const rightSpace2 = (gapBetween * rightItems.length);
    const rightSpace3 = (rightItems.length > 1 ? gapsPerItems * rightItems.length : 0);

    const inputStyle = {
      ...style,
      ...(leftItems.length > 0 && { marginLeft: leftSpace1 + leftSpace2 + leftSpace3 }),
      ...(rightItems.length > 0 && { marginRight: rightSpace1 + rightSpace2 + rightSpace3 }),
    };

    return (
      <div
        className={`
          ${fStyles.inputContainer}
          ${getClassContainerConfig(variant)}
          ${focused ? fStyles.inputContainerFocused : ""}
          ${containerClassName ?? ""}
        `}
        style={containerStyle}
      >

        {leftSlot}

        {variant === "text" && (
          <input
            ref={ref}
            type="text"
            inputMode="text"
            placeholder={placeholder}
            className={`${getClassInputConfig(variant)} ${className}`}
            style={inputStyle}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => props.onChange?.(e)}
            onInput={(e) => handleInput(e.currentTarget)}
            {...props}
          />
        )}

        {variant === "number" && (
          <input
            ref={ref}
            type="number"
            inputMode="numeric"
            placeholder={placeholder}
            className={`${getClassInputConfig(variant)} ${className}`}
            style={inputStyle}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            onChange={(e) => props.onChange?.(e)}
            onInput={(e) => handleInput(e.currentTarget)}
            {...props}
          />
        )}

        {variant === "date" && (
          <>
            <input
              ref={ref}
              type="date"
              placeholder={placeholder}
              className={`${getClassInputConfig(variant)} ${className}`}
              style={inputStyle}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => props.onChange?.(e)}
              {...props}
            />
            {variantsConfigs.showDatePicker && (
              <div className={fStyles.iconDatePicker}>
                <LuCalendar size={16} />
              </div>
            )}
          </>
        )}

        {variant === "time" && (
          <>
            <input
              ref={ref}
              type="time"
              className={`${getClassInputConfig(variant)} ${className}`}
              style={inputStyle}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => props.onChange?.(e)}
              {...props}
            />
            {variantsConfigs.showDatePicker && (
              <div className={fStyles.iconDatePicker}>
                <LuClock size={16} />
              </div>
            )}
          </>
        )}

        {variant === "datetime" && (
          <>
            <input
              ref={ref}
              type="datetime-local"
              className={`${getClassInputConfig(variant)} ${className}`}
              style={inputStyle}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => props.onChange?.(e)}
              {...props}
            />
            {variantsConfigs.showDatePicker && (
              <div className={fStyles.iconDatePicker}>
                <LuCalendarClock size={16} />
              </div>
            )}
          </>
        )}

        {variant === "password" && (
          <>
            <input
              ref={ref}
              type={`${isVisiblePassword ? "text" : "password"}`}
              inputMode="text"
              placeholder={placeholder}
              className={`${getClassInputConfig(variant)} ${className}`}
              style={inputStyle}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => props.onChange?.(e)}
              onInput={(e) => handleInput(e.currentTarget)}
              {...props}
            />
          </>
        )}

        {variant === "search" && (
          <>
            <input
              ref={ref}
              type="search"
              inputMode="search"
              placeholder={placeholder}
              className={`${getClassInputConfig(variant)} ${className}`}
              style={inputStyle}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => props.onChange?.(e)}
              onInput={(e) => handleInput(e.currentTarget)}
              {...props}
            />
          </>
        )}

        {variant === "email" && (
          <input
            ref={ref}
            type="email"
            inputMode="email"
            placeholder={placeholder}
            className={`${getClassInputConfig(variant)} ${className}`}
            style={inputStyle}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => props.onChange?.(e)}
            onInput={(e) => handleInput(e.currentTarget)}
            {...props}
          />
        )}

        {rightSlot}

      </div>
    );
  }
);

export default Input;
Input.displayName = "Input";
