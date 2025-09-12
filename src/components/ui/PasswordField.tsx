"use client";

import React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
/* import { FaEye } from "react-icons/fa"; */
import {
  X,
  EyeClosed,
  CheckCircle,
  XCircle,
  Eye,
  Asterisk,
} from "lucide-react"; //
import { cn } from "@/lib/utils";
import CustomCheckbox from "./CustomCheckbox";
import AlertModal from "../AlertModal";
import Notification from "../Notification";
import { Progress } from "@/components/ui/progress";

interface NotificationState {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
}

interface AlertModalState {
  isOpen: boolean;
  message: string;
  alertType: "success" | "error" | "warning" | "info";
  title: string;
}

interface PasswordFieldProps
  extends Omit<
    React.HTMLAttributes<HTMLInputElement>,
    "onChange" | "onBlur" | "value" | "ref" | "type"
  > {
  label: string;
  instruction?: string;
  labelClassName?: string;
  inputClassName?: string;
  width?: string;
  error?: string | false | undefined;
  touched?: boolean;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rememberMe?: boolean;
  forgotPassword?: boolean;
  rememberMeValue?: boolean;
  rememberMeEmailValue?: string;
  autoComplete?: string;
  onRememberMeChange?: (checked: boolean) => void;
  value?: string | number | string[] | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
  showPasswordToggle?: boolean;
  showPasswordStrength?: boolean;
}

// Internal component for password strength checking
interface PasswordStrengthCheckerProps {
  password: string;
  isVisible: boolean;
}

const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({
  password,
  isVisible,
}) => {
  const rules = useMemo(
    () => [
      { name: "8 characters minimum", regex: /.{8,}/ },
      { name: "One uppercase letter", regex: /[A-Z]/ },
      { name: "One lowercase letter", regex: /[a-z]/ },
      { name: "One number", regex: /[0-9]/ },
      { name: "One special character", regex: /[!@#$%^&*(),.?":{}|<>]/ },
    ],
    []
  );

  const passedRules = useMemo(() => {
    return rules.filter((rule) => rule.regex.test(password)).length;
  }, [password, rules]);

  const strengthPercentage = useMemo(() => {
    return (passedRules / rules.length) * 100;
  }, [passedRules, rules.length]);

  const progressBarColor = useMemo(() => {
    if (strengthPercentage < 40) return "bg-red-500";
    if (strengthPercentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  }, [strengthPercentage]);

  if (!isVisible) return null;

  return (
    <div className="absolute z-10 top-10 w-full bg-popover border border-border rounded-md shadow-lg p-4 animate-in fade-in-0 zoom-in-95 duration-200">
      <h4 className="text-sm font-semibold mb-2 text-foreground">
        Password Strength
      </h4>
      <Progress
        value={strengthPercentage}
        className={cn("h-2 transition-colors duration-300", progressBarColor)}
      />
      <div className="mt-3 space-y-1">
        {rules.map((rule, index) => {
          const isPassed = rule.regex.test(password);
          return (
            <div
              key={index}
              className={cn(
                "flex items-center text-sm",
                isPassed ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {isPassed ? (
                <CheckCircle size={16} className="mr-2" />
              ) : (
                <XCircle size={16} className="mr-2 opacity-50" />
              )}
              <span>{rule.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      instruction,
      id,
      name,
      value,
      placeholder = "",
      required = false,
      className = "",
      labelClassName = "",
      inputClassName = "",
      disabled = false,
      width = "100%",
      error,
      touched,
      rememberMe = false,
      forgotPassword = true,
      rememberMeValue = false,
      autoComplete = "new-password",
      onRememberMeChange,
      rememberMeEmailValue,
      onChange, // onChange from RHF or parent
      onBlur, // onBlur from RHF or parent
      autoFocus,
      onKeyDown,
      showPasswordToggle = true,
      showPasswordStrength = false, // Default to false
      ...htmlInputProps
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false); // New state for focus

    // Internal state to manage the input's displayed value
    const [internalValue, setInternalValue] = useState<string>(() =>
      Array.isArray(value) ? value.join(",") : value?.toString() || ""
    );

    // Sync external value prop with internal state
    useEffect(() => {
      setInternalValue(
        Array.isArray(value) ? value.join(",") : value?.toString() || ""
      );
    }, [value]);

    const [notification, setNotification] = useState<NotificationState>({
      message: "",
      type: "error",
      visible: false,
    });

    const [alertModal, setAlertModal] = useState<AlertModalState>({
      title: "",
      message: "",
      alertType: "error",
      isOpen: false,
    });

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value); // Update internal state for display
      if (onChange) {
        onChange(e); // Propagate change to RHF
      }
    };

    const handleInputFocus = () => {
      setIsFocused(true);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) {
        onBlur(e); // Propagate blur to RHF
      }
    };

    const handleRememberMeChange = (checked: boolean) => {
      if (onRememberMeChange) {
        onRememberMeChange(checked);
      }
    };

    const handleForgotPassword = async () => {
      if (!rememberMeEmailValue) {
        setNotification({
          message: "Please enter your email address",
          type: "error",
          visible: true,
        });
        return;
      }

      console.log(`Email: ${rememberMeEmailValue}`);

      try {
        const response = await fetch("/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: rememberMeEmailValue }),
        });

        if (response.ok) {
          setAlertModal({
            title: "Password Reset",
            message: `Password reset instructions sent to ${rememberMeEmailValue}`,
            alertType: "success",
            isOpen: true,
          });
        }
      } catch (error) {
        console.error("Error sending reset email:", error);
        setNotification({
          message: "Failed to send reset email. Please try again.",
          type: "error",
          visible: true,
        });
      }
    };

    return (
      <>
        <div
          className={cn(
            `flex flex-col space-y-1`,
            className,
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ width }}
        >
          {label && (
            <div className="flex flex-col">
              <label
                htmlFor={id}
                className={cn(
                  `cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-start`,
                  labelClassName
                )}
              >
                {label}
                {required && (
                  <Asterisk size={14} className="text-destructive" />
                )}
              </label>
              {instruction && (
                <p className="text-xs text-muted-foreground">{instruction}</p>
              )}
            </div>
          )}
          <div className="relative flex flex-col">
            {" "}
            {/* Flex-col to stack input and checker */}
            <div className="relative flex items-center">
              {" "}
              {/* Wrapper for input and toggle */}
              <input
                {...htmlInputProps}
                type={showPassword ? "text" : "password"}
                ref={(node) => {
                  if (typeof ref === "function") {
                    ref(node);
                  } else if (ref) {
                    (
                      ref as React.MutableRefObject<HTMLInputElement | null>
                    ).current = node;
                  }
                  inputRef.current = node;
                }}
                id={id}
                name={name}
                value={internalValue} // Use internal state for display
                onChange={handleInputChange} //  internal handler
                onFocus={handleInputFocus} // Handle focus
                onBlur={handleInputBlur} // Handle blur
                autoComplete={autoComplete} //  autoComplete prop
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoFocus={autoFocus}
                onKeyDown={onKeyDown}
                className={cn(
                  `flex w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-sm`,
                  internalValue && // InternalValue for styling
                    "text-foreground font-medium border-primary bg-background",
                  "focus:ring-primary focus:border-primary bg-background text-foreground border-input placeholder:text-muted-foreground",
                  inputClassName,
                  touched && error ? "border-destructive text-destructive" : ""
                )}
              />
              {showPasswordToggle && internalValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInternalValue("");
                    if (onChange) {
                      const syntheticEvent = {
                        target: { value: "", name: name || "" },
                        currentTarget: { value: "", name: name || "" },
                      } as React.ChangeEvent<HTMLInputElement>;
                      onChange(syntheticEvent); // Propagate empty string to RHF
                    }
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear input"
                  className={`absolute right-12 grid place-items-center bg-muted-foreground/30 hover:bg-muted-foreground/40 group rounded-full p-[0.2rem]`}
                >
                  <X size={12} className="opacity-80 group:hover:opacity-100" />
                </button>
              )}
              {showPasswordToggle && (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={cn(
                    `cursor-pointer absolute inset-y-0 right-0 px-3 flex items-center bg-foreground/10 border border-l-0 rounded-tr-md rounded-br-md text-sm text-foreground hover:text-primary`,
                    touched && error ? "border-destructive" : "border-input",
                    isFocused && "ring-primary border-primary"
                  )}
                >
                  {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            {showPasswordStrength && (
              <PasswordStrengthChecker
                password={internalValue}
                isVisible={isFocused}
              />
            )}
          </div>
          <div>
            {touched && error ? (
              <p className="mt-1 text-sm text-destructive text-left">{error}</p>
            ) : null}
          </div>
          {rememberMe && (
            <div className="flex items-center justify-between mt-1">
              <CustomCheckbox
                label="Remember me"
                id={`rememberMe-${id}`} // Unique ID for checkbox
                isChecked={rememberMeValue}
                onChange={handleRememberMeChange}
              />
              {forgotPassword && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-primary hover:underline text-sm"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}
        </div>

        <AlertModal
          title={alertModal.title}
          alertType={alertModal.alertType}
          isOpen={alertModal.isOpen}
          message={alertModal.message}
          onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        />

        <Notification
          isVisible={notification.visible}
          message={notification.message}
          onClose={() =>
            setNotification((prev) => ({ ...prev, visible: false }))
          }
          type={notification.type}
        />
      </>
    );
  }
);

PasswordField.displayName = "PasswordField";

export default PasswordField;
