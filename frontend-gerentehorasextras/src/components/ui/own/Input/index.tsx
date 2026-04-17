"use client";

import { forwardRef, useState } from "react";

// Styles
import fStyles from "./style.module.scss";

// Icons
import { LuEye, LuEyeClosed, LuSearch, LuCalendar, LuClock, LuCalendarClock } from "react-icons/lu";
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
  showSearchCancelButton?: boolean;
}


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: TInputVariant;
  variantsConfigs?: IInputVariantConfigs;

  containerClassName?: string;
  containerStyle?: React.CSSProperties;

  className?: string;
  style?: React.CSSProperties;
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
        showSearchCancelButton: false,
      },

      placeholder,

      containerClassName,
      containerStyle,

      className,
      style,

      ...props
    },
    ref
  ) => {

    const [focused, setFocused] = useState(false);
    const [isVisiblePassword, setVisiblePassword] = useState(false);

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
      search: `
        ${fStyles.inputSearch}
        ${variantsConfigs.showSearchCancelButton ? undefined : fStyles.noSearchCancel}
      `,
      email: `${fStyles.inputContainerEmail}`,
    } as const;

    const getClassContainerConfig = (variant: TInputVariant) => {
      return classContainerConfig[variant];
    };
    const getClassInputConfig = (variant: TInputVariant) => {
      return classInputConfig[variant];
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
        {variant === "text" && (
          <input
            ref={ref}
            type="text"
            inputMode="text"
            placeholder={placeholder}
            className={`${getClassInputConfig(variant)} ${className}`}
            style={style}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
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
            style={style}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
              style={style}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
              style={style}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
              style={style}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
              style={{
                ...style,
                ...(variantsConfigs.showPasswordToggle ? { marginRight: 20 + 12 } : {}),
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              {...props}
            />
            {variantsConfigs.showPasswordToggle && (
              <Button
                size="small"
                variant="ghost"
                color="theme"
                onClick={() => setVisiblePassword((prev) => !prev)}
                style={{ aspectRatio: 1, padding: 4, right: 12 }}
                className={`${fStyles.inputBtnInternal}`}
              >
                <View
                  className="flex justify-center items-center"
                  style={{ aspectRatio: 1, width: 20 }}
                >
                  {isVisiblePassword ? <LuEye size={20} /> : <LuEyeClosed size={20} />}
                </View>
              </Button>
            )}
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
              style={{
                ...style,
                ...(variantsConfigs.showSearchButton ? { marginRight: 20 + 12 } : {}),
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              {...props}
            />
            {variantsConfigs.showSearchButton && (
              <Button
                size="small"
                variant="ghost"
                color="theme"
                onClick={() => setVisiblePassword((prev) => !prev)}
                style={{ aspectRatio: 1, padding: 4, right: 12 }}
                className={`${fStyles.inputBtnInternal}`}
              >
                <View
                  className="flex justify-center items-center"
                  style={{ aspectRatio: 1, width: 20 }}
                >
                  <LuSearch size={20} />
                </View>
              </Button>
            )}
          </>
        )}

        {variant === "email" && (
          <input
            ref={ref}
            type="email"
            inputMode="email"
            placeholder={placeholder}
            className={`${getClassInputConfig(variant)} ${className}`}
            style={style}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        )}
      </div>
    );
  }
);

export default Input;
Input.displayName = "Input";
