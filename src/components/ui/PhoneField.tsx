"use client";

import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { countryCodes } from "@/lib/data/countryCodes";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Phone, MessageCircle } from "lucide-react";

interface CountryCode {
  name: string;
  code: string;
  iso: string;
}

interface PhoneFormatOptions {
  whatsapp?: boolean;
  call?: boolean;
  display?: "international" | "national" | "local";
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
  formatOptions?: PhoneFormatOptions;
  showFormatButtons?: boolean;
  onWhatsAppClick?: (whatsappNumber: string) => void;
  onCallClick?: (callNumber: string) => void;
}

const formatPhoneNumber = (
  countryCode: string,
  localNumber: string,
  format: "whatsapp" | "call" | "international" | "national" | "local",
  countryIso: string
): string => {
  if (!localNumber) return "";

  // Clean the country code to ensure it's just digits
  const cleanCountryCode = countryCode.replace(/\D/g, "");

  switch (format) {
    case "whatsapp":
      const cleanLocal = localNumber.replace(/^0+/, "");
      return cleanCountryCode + cleanLocal;

    case "call":
      if (countryIso === "NG") {
        return localNumber.startsWith("0") ? localNumber : "0" + localNumber;
      } else if (countryIso === "US") {
        if (localNumber.length === 10) {
          return `(${localNumber.slice(0, 3)}) ${localNumber.slice(
            3,
            6
          )}-${localNumber.slice(6)}`;
        }
        return localNumber;
      } else {
        return "+" + cleanCountryCode + localNumber;
      }

    case "international":
      const cleanLocalForIntl = localNumber.replace(/^0+/, "");
      return "+" + cleanCountryCode + cleanLocalForIntl;

    case "national":
      if (countryIso === "NG" && !localNumber.startsWith("0")) {
        return "0" + localNumber;
      }
      return localNumber;

    case "local":
      return localNumber.replace(/^0+/, "");

    default:
      const cleanLocalDefault = localNumber.replace(/^0+/, "");
      return "+" + cleanCountryCode + cleanLocalDefault;
  }
};

const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
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
      autoFocus,
      onKeyDown,
      onChange,
      onBlur,
      formatOptions = { whatsapp: true, call: true, display: "international" },
      showFormatButtons = true,
      onWhatsAppClick,
      onCallClick,
      ...htmlInputProps
    },
    ref
  ) => {
    const [showCountryCode, setShowCountryCode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
      console.log("[PhoneField] External value changed:", value);
      if (typeof value === "string") {
        const foundCode = countryCodes.find((country) =>
          value.startsWith(country.code)
        );
        if (foundCode) {
          setSelectedCode(foundCode);
          setLocalPhoneNumber(value.substring(foundCode.code.length));
          console.log(
            `[PhoneField] Parsed: Code=${
              foundCode.code
            }, Local=${value.substring(foundCode.code.length)}`
          );
        } else {
          setSelectedCode(
            countryCodes.find((c) => c.iso === "NG") || countryCodes[0]
          );
          setLocalPhoneNumber(value);
          console.log(
            `[PhoneField] No code match: Defaulting to NG, Local=${value}`
          );
        }
      } else {
        setSelectedCode(
          countryCodes.find((c) => c.iso === "NG") || countryCodes[0]
        );
        setLocalPhoneNumber("");
        console.log("[PhoneField] Value not string, resetting.");
      }
    }, [value]);

    const formattedNumbers = useMemo(() => {
      if (!localPhoneNumber) return {};

      const cleanCountryCode = selectedCode.code.replace(/\D/g, "");

      return {
        whatsapp: formatPhoneNumber(
          cleanCountryCode,
          localPhoneNumber,
          "whatsapp",
          selectedCode.iso
        ),
        call: formatPhoneNumber(
          cleanCountryCode,
          localPhoneNumber,
          "call",
          selectedCode.iso
        ),
        international: formatPhoneNumber(
          cleanCountryCode,
          localPhoneNumber,
          "international",
          selectedCode.iso
        ),
        national: formatPhoneNumber(
          cleanCountryCode,
          localPhoneNumber,
          "national",
          selectedCode.iso
        ),
        local: formatPhoneNumber(
          cleanCountryCode,
          localPhoneNumber,
          "local",
          selectedCode.iso
        ),
      };
    }, [selectedCode, localPhoneNumber]);

    const handleWhatsAppClick = () => {
      if (formattedNumbers.whatsapp && onWhatsAppClick) {
        onWhatsAppClick(formattedNumbers.whatsapp);
      } else if (formattedNumbers.whatsapp) {
        window.open(`https://wa.me/${formattedNumbers.whatsapp}`, "_blank");
      }
    };

    const handleCallClick = () => {
      if (formattedNumbers.call && onCallClick) {
        onCallClick(formattedNumbers.call);
      } else if (formattedNumbers.call) {
        window.open(`tel:${formattedNumbers.call}`, "_self");
      }
    };

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
      const cleanCountryCode = country.code.replace(/\D/g, "");
      const cleanLocal = localPhoneNumber.replace(/^0+/, "");
      const newFullValue = "+" + cleanCountryCode + cleanLocal;
      console.log(
        `[PhoneField] Country selected: ${country.code}, New full value: ${newFullValue}`
      );
      if (onChange) {
        const syntheticEvent = {
          target: { value: newFullValue, name: name || "" },
          currentTarget: { value: newFullValue, name: name || "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, "");
      console.log(
        `[PhoneField] Raw input: ${e.target.value}, Cleaned digits: ${val}`
      );

      if (val.startsWith("0") && val.length > 1) {
        val = val.substring(1);
        console.log(`[PhoneField] Removed leading '0': ${val}`);
      }

      setLocalPhoneNumber(val);

      const cleanCountryCode = selectedCode.code.replace(/\D/g, "");
      const newFullValue = "+" + cleanCountryCode + val;
      console.log(`[PhoneField] New full value to propagate: ${newFullValue}`);

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: newFullValue },
        };
        onChange(syntheticEvent);
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
            value={localPhoneNumber}
            onChange={handlePhoneChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            className={cn(
              `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-sm`,
              showFormatButtons ? "rounded-r-none" : "rounded-l-none",
              value &&
                !placeholder &&
                "text-foreground font-medium border-primary bg-background",
              "focus:ring-primary focus:border-primary text-foreground border-input",
              inputClassName,
              touched && error ? "border-destructive text-destructive" : ""
            )}
          />

          {showFormatButtons && localPhoneNumber && (
            <div className="flex border border-l-0 rounded-r-md bg-secondary/50">
              {formatOptions.whatsapp && (
                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="px-3 py-2 hover:bg-green-100 hover:text-green-700 transition-colors border-r border-border/50 last:border-r-0"
                  title={`WhatsApp: ${formattedNumbers.whatsapp}`}
                >
                  <MessageCircle size={16} className="text-green-600" />
                </button>
              )}
              {formatOptions.call && (
                <button
                  type="button"
                  onClick={handleCallClick}
                  className="px-3 py-2 hover:bg-blue-100 hover:text-blue-700 transition-colors border-r border-border/50 last:border-r-0"
                  title={`Call: ${formattedNumbers.call}`}
                >
                  <Phone size={16} className="text-blue-600" />
                </button>
              )}
            </div>
          )}
        </div>

        {localPhoneNumber && (formatOptions.whatsapp || formatOptions.call) && (
          <div className="text-xs text-muted-foreground space-y-1 mt-2">
            {formatOptions.whatsapp && (
              <div className="flex items-center gap-2">
                <MessageCircle size={12} className="text-green-600" />
                <span>WhatsApp: {formattedNumbers.whatsapp}</span>
              </div>
            )}
            {formatOptions.call && (
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-blue-600" />
                <span>Call: {formattedNumbers.call}</span>
              </div>
            )}
          </div>
        )}

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
