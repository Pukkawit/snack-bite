"use client";

import type React from "react";
import { forwardRef, useRef } from "react";

interface RegisterOptions {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  validate?: (value: string) => boolean | string;
}

interface RegisterReturn {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  name: string;
  ref: React.Ref<HTMLInputElement>;
}

type RegisterFunction = (
  name: string,
  options?: RegisterOptions
) => RegisterReturn;

interface ColorInputProps {
  // Basic props
  label?: string;
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;

  // Styling props
  labelClassName?: string;
  inputClassName?: string;
  previewClassName?: string;

  // Event handlers
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;

  // Validation props (for form libraries)
  error?: string;
  helperText?: string;

  // Color picker specific props
  showPreview?: boolean;
  previewSize?: "sm" | "md" | "lg";
  showHexInput?: boolean;

  register?: RegisterFunction;

  autoComplete?: string;
  autoFocus?: boolean;
  form?: string;
  list?: string;
  readOnly?: boolean;
  size?: number;
  spellCheck?: boolean;
  tabIndex?: number;
  title?: string;
  "data-testid"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      label,
      name,
      id,
      value,
      defaultValue = "#000000",
      placeholder = "#000000",
      disabled = false,
      required = false,
      className = "",
      labelClassName = "",
      inputClassName = "",
      previewClassName = "",
      onChange,
      onBlur,
      onFocus,
      error,
      helperText,
      showPreview = true,
      previewSize = "md",
      showHexInput = true,
      register,
      autoComplete,
      autoFocus,
      form,
      list,
      readOnly,
      size,
      spellCheck,
      tabIndex,
      title,
      "data-testid": dataTestId,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
    },
    ref
  ) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    // Use provided ref or fallback to internal ref
    const inputRef = ref || colorInputRef;

    // Get current color value (controlled or uncontrolled)
    const currentValue = value ?? defaultValue;

    const registerProps = register ? register(name || "") : null;
    const registerOnChange = registerProps?.onChange;
    const registerOnBlur = registerProps?.onBlur;
    const otherRegisterProps = registerProps
      ? {
          name: registerProps.name,
          ref: registerProps.ref,
        }
      : {};

    // Handle color picker change
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;

      // Update text input if it exists
      if (textInputRef.current) {
        textInputRef.current.value = newColor;
      }

      // Call provided onChange
      if (onChange) {
        onChange(e);
      }

      // Call register onChange if available
      if (registerOnChange) {
        registerOnChange(e);
      }
    };

    // Handle text input change
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;

      // Validate hex color format
      if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
        // Update color picker if it exists
        if (colorInputRef.current) {
          colorInputRef.current.value = newColor;
        }

        // Create synthetic event for color input
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            name: name || "",
            value: newColor,
            type: "color",
          },
        } as React.ChangeEvent<HTMLInputElement>;

        // Call provided onChange
        if (onChange) {
          onChange(syntheticEvent);
        }

        // Call register onChange if available
        if (registerOnChange) {
          registerOnChange(syntheticEvent);
        }
      } else {
        // Still call onChange for validation purposes
        if (onChange) {
          onChange(e);
        }
        if (registerOnChange) {
          registerOnChange(e);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e);
      }
      if (registerOnBlur) {
        registerOnBlur(e);
      }
    };

    // Handle preview click
    const handlePreviewClick = () => {
      if (!disabled && colorInputRef.current) {
        colorInputRef.current.click();
      }
    };

    // Get preview size classes
    const getPreviewSizeClass = () => {
      switch (previewSize) {
        case "sm":
          return "w-6 h-6";
        case "lg":
          return "w-12 h-12";
        default:
          return "w-9 h-9";
      }
    };

    // Generate unique IDs if not provided
    const colorInputId = id ? `${id}-color` : `color-${name || "input"}`;
    const textInputId = id ? `${id}-text` : `text-${name || "input"}`;

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={showHexInput ? textInputId : colorInputId}
            className={`block text-sm font-medium text-foreground ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="flex items-center">
          {/* Color Preview & Hidden Color Input */}
          {showPreview && (
            <div className="relative">
              <input
                ref={inputRef}
                type="color"
                id={colorInputId}
                name={name}
                value={currentValue}
                onChange={handleColorChange}
                onBlur={handleBlur}
                onFocus={onFocus}
                disabled={disabled}
                required={required}
                className="absolute opacity-0 w-full h-full cursor-pointer"
                readOnly={readOnly}
                tabIndex={tabIndex}
                title={title}
                data-testid={dataTestId}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                {...otherRegisterProps}
              />
              <div
                className={`${getPreviewSizeClass()} rounded-l-md border h-[2.6rem] border-primary cursor-pointer transition-all hover:border-primary ${previewClassName} ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: currentValue }}
                onClick={handlePreviewClick}
                title={`Current color: ${currentValue}`}
              />
            </div>
          )}

          {/* Text Input for Hex Value */}
          {showHexInput && (
            <input
              ref={textInputRef}
              type="text"
              id={textInputId}
              name={showPreview ? `${name}-text` : name}
              value={currentValue}
              onChange={handleTextChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={`flex-1 px-3 py-2 border border-input bg-background border-l-0 rounded-r-md shadow-sm focus:outline-none focus:ring focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                currentValue && "border-primary"
              } ${inputClassName} ${
                error
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : ""
              }`}
              pattern="^#[0-9A-Fa-f]{6}$"
              title="Enter a valid hex color (e.g., #FF0000)"
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              form={form}
              list={list}
              readOnly={readOnly}
              size={size}
              spellCheck={spellCheck}
              tabIndex={tabIndex}
              data-testid={dataTestId}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              {...(!showPreview ? otherRegisterProps : {})}
            />
          )}

          {/* Hidden color input when preview is disabled */}
          {!showPreview && (
            <input
              ref={inputRef}
              type="color"
              id={colorInputId}
              name={name}
              value={currentValue}
              onChange={handleColorChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              disabled={disabled}
              required={required}
              className={`w-12 h-10 border border-input bg-background rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName}`}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              form={form}
              list={list}
              readOnly={readOnly}
              size={size}
              spellCheck={spellCheck}
              tabIndex={tabIndex}
              title={title}
              data-testid={dataTestId}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              {...otherRegisterProps}
            />
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

ColorInput.displayName = "ColorInput";

export default ColorInput;
