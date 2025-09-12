"use client";

import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { countryCodes } from "@/lib/data/countryCodes";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

interface CountryCode {
  name: string;
  code: string;
  iso: string;
}

interface PhoneFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "onBlur" | "value" | "ref" | "type"
  > {
  label: string;
  instruction?: string;
  labelClassName?: string;
  inputClassName?: string;
  width?: string;
  error?: string | false | undefined;
  touched?: boolean;
  value?: string | number | string[] | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
}

const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      label,
      instruction,
      id,
      name,
      value, // This is the value from RHF or parent
      placeholder = "",
      required = false,
      className = "",
      labelClassName = "",
      inputClassName = "",
      disabled = false,
      width = "100%",
      error,
      touched,
      autoFocus,
      onKeyDown,
      onChange, // This is the onChange from RHF or parent
      onBlur, // This is the onBlur from RHF or parent
      ...htmlInputProps
    },
    ref
  ) => {
    const [showCountryCode, setShowCountryCode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initialize selectedCode and localPhoneNumber based on value prop and default to Nigeria
    const [selectedCode, setSelectedCode] = useState<CountryCode>(() => {
      if (typeof value === "string") {
        const codeMatch = countryCodes.find((country) =>
          value.startsWith(country.code)
        );
        return (
          codeMatch ||
          countryCodes.find((c) => c.iso === "NG") ||
          countryCodes[0]
        );
      }
      return countryCodes.find((c) => c.iso === "NG") || countryCodes[0];
    });

    const [localPhoneNumber, setLocalPhoneNumber] = useState<string>(() => {
      if (typeof value === "string") {
        const codeMatch = countryCodes.find((country) =>
          value.startsWith(country.code)
        );
        return codeMatch ? value.substring(codeMatch.code.length) : value;
      }
      return "";
    });

    // Effect to parse the external 'value' prop into 'selectedCode' and 'localPhoneNumber' for display
    useEffect(() => {
      console.log("[PhoneField] External value changed:", value);
      if (typeof value === "string") {
        const foundCode = countryCodes.find((country) =>
          value.startsWith(country.code)
        );
        if (foundCode) {
          setSelectedCode(foundCode);
          setLocalPhoneNumber(value.substring(foundCode.code.length)); // Extract local part
          console.log(
            `[PhoneField] Parsed: Code=${
              foundCode.code
            }, Local=${value.substring(foundCode.code.length)}`
          );
        } else {
          // If value doesn't start with any known code, assume it's just the local number
          // and default to Nigeria's code for display.
          setSelectedCode(
            countryCodes.find((c) => c.iso === "NG") || countryCodes[0]
          );
          setLocalPhoneNumber(value); // Treat the whole value as local number
          console.log(
            `[PhoneField] No code match: Defaulting to NG, Local=${value}`
          );
        }
      } else {
        // Reset when value is not a string or not provided
        setSelectedCode(
          countryCodes.find((c) => c.iso === "NG") || countryCodes[0]
        );
        setLocalPhoneNumber("");
        console.log("[PhoneField] Value not string, resetting.");
      }
    }, [value]);

    const filteredCountryCodes = useMemo(() => {
      if (!searchQuery) return countryCodes;
      const query = searchQuery.toLowerCase();
      return countryCodes.filter(
        (country) =>
          country.code.includes(searchQuery) ||
          country.name.toLowerCase().includes(query)
      );
    }, [searchQuery]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setShowCountryCode(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCountrySelect = (country: CountryCode) => {
      setSelectedCode(country);
      setShowCountryCode(false);
      const newFullValue = country.code + localPhoneNumber; // Use current local number
      console.log(
        `[PhoneField] Country selected: ${country.code}, New full value: ${newFullValue}`
      );
      if (onChange) {
        const syntheticEvent = {
          target: { value: newFullValue, name: name || "" },
          currentTarget: { value: newFullValue, name: name || "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent); // Propagate to RHF
      }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, ""); // Remove non-digits
      console.log(
        `[PhoneField] Raw input: ${e.target.value}, Cleaned digits: ${val}`
      );

      // Remove leading '0' if present and not part of a country code
      if (val.startsWith("0") && val.length > 1) {
        val = val.substring(1);
        console.log(`[PhoneField] Removed leading '0': ${val}`);
      }

      setLocalPhoneNumber(val); // Update local state for display

      const newFullValue = selectedCode.code + val;
      console.log(`[PhoneField] New full value to propagate: ${newFullValue}`);

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: newFullValue },
        };
        onChange(syntheticEvent); // Propagate to RHF
      }
    };

    return (
      <div
        className={cn(
          `flex flex-col space-y-1`,
          className,
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ width }}
        ref={wrapperRef}
      >
        {label && (
          <div className="flex flex-col">
            <label
              htmlFor={id}
              className={cn(
                `block text-sm font-medium text-foreground/90 tracking-wide`,
                labelClassName
              )}
            >
              {label}
            </label>
            {instruction && (
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                {instruction}
              </p>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryCode(!showCountryCode)}
              className={cn(
                `flex items-center py-[0.5rem] gap-1 pr-2 h-full min-w-[90px] border rounded-l-md border-r-0 hover:bg-secondary/80 placeholder:text-muted-foreground`,
                value &&
                  "text-primary font-medium border-primary bg-background",
                "bg-secondary text-secondary-foreground border-input"
              )}
            >
              <div className="px-2  flex items-center gap-1 whitespace-nowrap">
                <div className="w-6 h-4 relative overflow-hidden rounded-xs">
                  <Image
                    src={`https://flagcdn.com/w40/${selectedCode.iso.toLowerCase()}.png`}
                    alt={selectedCode.name}
                    fill
                    sizes="100% 100%"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className="text-sm">{selectedCode.code}</span>
              </div>
              <ChevronDown size={14} />
            </button>
            {showCountryCode && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-popover shadow-lg rounded-md border border-border">
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search country..."
                      className="w-full pl-10 pr-3 py-2 text-sm bg-transparent focus:outline-none text-foreground"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountryCodes.map((country) => (
                    <button
                      key={country.code + country.name}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-accent/10 hover:text-accent-foreground flex items-center gap-2 text-foreground"
                    >
                      <div className="w-6 h-4 relative overflow-hidden rounded-sm">
                        <Image
                          src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
                          alt={country.name}
                          fill
                          sizes="100% 100%"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span>{country.name}</span>
                      <span className="ml-auto">{country.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            {...htmlInputProps}
            type="tel"
            ref={ref}
            id={id}
            name={name}
            value={localPhoneNumber} // Display local part only
            onChange={handlePhoneChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            className={cn(
              `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-sm`,
              "pl-3 rounded-l-none",
              value &&
                !placeholder &&
                "text-foreground font-medium border-primary bg-background",
              "focus:ring-primary focus:border-primary text-foreground border-input",
              inputClassName,
              touched && error ? "border-destructive text-destructive" : ""
            )}
          />
        </div>
        <div>
          {touched && error ? (
            <p className="mt-1 text-sm text-destructive text-left">{error}</p>
          ) : null}
        </div>
      </div>
    );
  }
);

PhoneField.displayName = "PhoneField";

export default PhoneField;
