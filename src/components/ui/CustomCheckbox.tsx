"use client";

import React from "react";

// Define the available variants
type CheckboxVariant =
  | "rounded-fill" // Default rounded with fill
  | "rounded-tick" // Rounded with tick mark
  | "square-fill" // Square with fill
  | "square-tick" // Square with tick mark
  | "switch" // Toggle switch style
  | "minimal"; // Minimal style with color change only

interface CustomCheckboxProps {
  id: string;
  isChecked?: boolean;
  onChange: (checked: boolean) => void;
  label: string | React.ReactNode;
  error?: string;
  className?: string;
  activeClass?: string;
  inactiveClass?: string;
  containerSize?: string; // Renamed from 'size' to avoid conflict with native input size
  disabled?: boolean;
  variant?: CheckboxVariant;
  required?: boolean;
  name?: string; // Added name prop for react-hook-form Controller
  onBlur?: React.FocusEventHandler<HTMLInputElement>; // Added onBlur for react-hook-form Controller
  touched?: boolean; // Added touched prop for react-hook-form Controller
  // Additional props for react-hook-form Controller
  ref?: React.Ref<HTMLInputElement>; // Added ref for react-hook-form Controller
}

const CustomCheckbox = React.forwardRef<HTMLInputElement, CustomCheckboxProps>(
  (
    {
      id,
      isChecked = false,
      onChange,
      label = "",
      className = "",
      error,
      activeClass = "border-primary hover:bg-accent-hover",
      inactiveClass = "border-muted hover:border-primary-hover",
      containerSize = "w-4 h-4", // Default value for renamed prop
      disabled = false,
      variant = "rounded-fill", // Default variant
      required,
      name, // Destructure name
      onBlur, // Destructure onBlur
      touched, // Destructure touched
      ...rest // Capture any other props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange(e.target.checked);
    };

    // Determine cursor style based on disabled state
    const cursorStyle = disabled ? "cursor-not-allowed" : "cursor-pointer";

    // Add opacity when disabled
    const disabledStyle = disabled ? "opacity-80" : "";

    // Get border radius based on variant
    const getBorderRadius = () => {
      if (variant.startsWith("rounded")) return "rounded-full";
      if (variant === "switch") return "rounded-full";
      return "rounded-sm";
    };

    // Get size for the inner element
    const getInnerSize = () => {
      if (variant === "switch") {
        return containerSize.replace("w-4", "w-2").replace("h-4", "h-4");
      }
      return containerSize.replace("w-4", "w-2").replace("h-4", "h-2");
    };

    // Get container styles based on variant
    const getContainerStyles = () => {
      let baseStyles = `mt-0.5 grid place-items-center border-2 transition-all duration-200 ${containerSize} ${getBorderRadius()}`;

      if (variant === "switch") {
        baseStyles = `relative border-2 transition-all duration-200 ${containerSize.replace(
          "w-4",
          "w-8"
        )} ${getBorderRadius()}`;
      }

      if (variant === "minimal") {
        baseStyles = `grid place-items-center transition-all duration-200 ${containerSize} ${getBorderRadius()}`;
        if (!isChecked) {
          return `${baseStyles} border border-gray-300 dark:border-gray-600`;
        }
        return `${baseStyles} border-2`;
      }

      if (disabled) {
        return `${baseStyles} border-gray-300 dark:border-gray-700`;
      }

      return `${baseStyles} ${isChecked ? activeClass : inactiveClass}`;
    };

    // Render the appropriate check indicator based on variant
    const renderCheckIndicator = () => {
      if (!isChecked) return null;

      const indicatorColor = disabled ? "bg-gray-400" : "bg-primary";

      switch (variant) {
        case "rounded-fill":
          return (
            <div
              className={`rounded-full ${getInnerSize()} ${indicatorColor}`}
            />
          );

        case "square-fill":
          return (
            <div className={`rounded-sm ${getInnerSize()} ${indicatorColor}`} />
          );

        case "rounded-tick":
        case "square-tick":
          return (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={disabled ? "#9CA3AF" : "currentColor"}
              className={`w-3 h-3 text-primary stroke-[0.2rem] bg-primary}`}
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );

        case "switch":
          return (
            <div
              className={`absolute top-0 left-0 rounded-full transform transition-transform duration-200 ${
                isChecked ? "translate-x-full" : "translate-x-0"
              } ${getInnerSize()} ${indicatorColor}`}
              style={{ marginLeft: "2px" }}
            />
          );

        case "minimal":
          return (
            <div className="flex items-center justify-center w-full h-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={disabled ? "#9CA3AF" : "currentColor"}
                className="w-3 h-3 text-primary stroke-2"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );

        default:
          return null;
      }
    };

    // Get label styles
    const getLabelStyles = () => {
      if (disabled) return "text-gray-400 dark:text-gray-500";
      if (isChecked && variant !== "minimal")
        return "text-primary font-semibold";
      return "text-foreground";
    };

    return (
      <>
        <label
          htmlFor={id}
          className={`flex items-start ${cursorStyle} ${className} ${disabledStyle}`}
        >
          <input
            id={id}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            onBlur={onBlur} // Pass onBlur
            name={name} // Pass name
            disabled={disabled}
            className="hidden" // Hide the default checkbox
            required={required}
            ref={ref} // Forward the ref
            {...rest}
          />
          <div className={getContainerStyles()}>{renderCheckIndicator()}</div>
          {label && (
            <span className={`ml-2 text-sm ${getLabelStyles()}`}>{label}</span>
          )}
        </label>
        {touched && error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
        {/* Display error message if exists */}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";

export default CustomCheckbox;
