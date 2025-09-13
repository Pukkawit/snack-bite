"use client";

import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Plus, ChevronDown } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

// Types
export interface TimeSlot {
  start: string;
  end: string;
  id: string;
}

export interface OperationalHoursData {
  [key: string]: TimeSlot[];
}

export interface OperationalHoursProps {
  value?: string | OperationalHoursData;
  label?: string;
  onChange?: (value: string | OperationalHoursData) => void;
  onBlur?: () => void;
  name?: string;
  variant?: "default" | "compact" | "expanded";
  size?: "sm" | "md" | "lg";
  timeFormat?: "12h" | "24h";
  disabled?: boolean;
  className?: string;
  days?: string[];
  placeholder?: string;
  required?: boolean;
}

const DEFAULT_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Time Picker Component
const TimePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  timeFormat: "12h" | "24h";
  size: "sm" | "md" | "lg";
  disabled?: boolean;
}> = ({ value, onChange, timeFormat, size, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (time: string) => {
    if (!time) return "";
    if (timeFormat === "12h") {
      const [hours, minutes] = time.split(":");
      const hour = Number.parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))]
          flex items-center justify-between min-w-0 flex-1
          hover:border-[hsl(var(--input))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--primary))]
          disabled:bg-[hsl(var(--muted))] disabled:text-[hsl(var(--muted-foreground))] disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      >
        <span className="truncate">
          {value ? formatTime(value) : "Select time"}
        </span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-md shadow-lg max-h-60 overflow-auto">
            {generateTimeOptions().map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 hover:bg-[hsl(var(--secondary-hover))] focus:bg-[hsl(var(--secondary-hover))] focus:outline-none
                  ${
                    value === time
                      ? "bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))]"
                      : "text-[hsl(var(--foreground))"
                  }
                  ${sizeClasses[size]}
                `}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Time Slot Component
const TimeSlotComponent: React.FC<{
  slot: TimeSlot;
  onUpdate: (slot: TimeSlot) => void;
  onRemove: () => void;
  timeFormat: "12h" | "24h";
  size: "sm" | "md" | "lg";
  disabled?: boolean;
  canRemove: boolean;
}> = ({ slot, onUpdate, onRemove, timeFormat, size, disabled, canRemove }) => {
  const handleStartChange = (start: string) => {
    onUpdate({ ...slot, start });
  };

  const handleEndChange = (end: string) => {
    onUpdate({ ...slot, end });
  };

  const sizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} w-full`}>
      <TimePicker
        value={slot.start}
        onChange={handleStartChange}
        timeFormat={timeFormat}
        size={size}
        disabled={disabled}
      />
      <span className="text-[hsl(var(--muted-foreground))] flex-shrink-0">
        to
      </span>
      <TimePicker
        value={slot.end}
        onChange={handleEndChange}
        timeFormat={timeFormat}
        size={size}
        disabled={disabled}
      />
      {canRemove && <DeleteButton onClick={onRemove} icon="trash" />}
    </div>
  );
};

// Day Schedule Component
const DaySchedule: React.FC<{
  day: string;
  slots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  timeFormat: "12h" | "24h";
  size: "sm" | "md" | "lg";
  variant: "default" | "compact" | "expanded";
  disabled?: boolean;
}> = ({
  day,
  slots,
  onSlotsChange,
  timeFormat,
  size,
  /* variant, */ disabled,
}) => {
  const [isEnabled, setIsEnabled] = useState(slots.length > 0);

  // Update isEnabled when slots change from parent
  useEffect(() => {
    setIsEnabled(slots.length > 0);
  }, [slots.length]);

  const handleToggleDay = () => {
    if (disabled) return;

    if (isEnabled) {
      setIsEnabled(false);
      onSlotsChange([]);
    } else {
      setIsEnabled(true);
      onSlotsChange([{ start: "09:00", end: "17:00", id: generateId() }]);
    }
  };

  const handleAddSlot = () => {
    const newSlot: TimeSlot = {
      start: "09:00",
      end: "17:00",
      id: generateId(),
    };
    onSlotsChange([...slots, newSlot]);
  };

  const handleUpdateSlot = (index: number, updatedSlot: TimeSlot) => {
    const newSlots = [...slots];
    newSlots[index] = updatedSlot;
    onSlotsChange(newSlots);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    onSlotsChange(newSlots);
    if (newSlots.length === 0) {
      setIsEnabled(false);
    }
  };

  const sizeClasses = {
    sm: "text-sm p-3",
    md: "text-base p-4",
    lg: "text-lg p-5",
  };

  const checkboxSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] ${sizeClasses[size]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggleDay}
            disabled={disabled}
            className={`
              ${checkboxSizeClasses[size]} text-[hsl(var(--primary))] border-[hsl(var(--border))] rounded
              focus:ring-[hsl(var(--ring))] focus:ring-2 disabled:cursor-not-allowed
            `}
          />
          <span
            className={`ml-3 font-medium text-[hsl(var(--foreground))] ${
              disabled ? "text-[hsl(var(--muted-foreground))]" : ""
            }`}
          >
            {day}
          </span>
        </label>

        {isEnabled && (
          <button
            type="button"
            onClick={handleAddSlot}
            disabled={disabled}
            className={`
              text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))] disabled:text-[hsl(var(--muted-foreground))] disabled:cursor-not-allowed
              flex items-center transition-colors duration-200
              ${
                size === "sm"
                  ? "text-xs"
                  : size === "md"
                  ? "text-sm"
                  : "text-base"
              }
            `}
          >
            <Plus className={`mr-1 ${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`} />
            Add Hours
          </button>
        )}
      </div>

      {isEnabled && (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <TimeSlotComponent
              key={slot.id}
              slot={slot}
              onUpdate={(updatedSlot) => handleUpdateSlot(index, updatedSlot)}
              onRemove={() => handleRemoveSlot(index)}
              timeFormat={timeFormat}
              size={size}
              disabled={disabled}
              canRemove={slots.length > 1}
            />
          ))}
        </div>
      )}

      {!isEnabled && (
        <div
          className={`text-[hsl(var(--muted-foreground))] italic ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          Closed
        </div>
      )}
    </div>
  );
};

// Main Operational Hours Component
export const OperationalHours = forwardRef<
  HTMLInputElement,
  OperationalHoursProps
>(
  (
    {
      label,
      value = "",
      onChange,
      onBlur,
      name,
      variant = "default",
      size = "md",
      timeFormat = "12h",
      disabled = false,
      className = "",
      days = DEFAULT_DAYS,
      placeholder,
      required = false,
    },
    ref
  ) => {
    // Parse value - handle both string (from RHF) and object
    const parseValue = useCallback(
      (val: string | OperationalHoursData): OperationalHoursData => {
        if (typeof val === "string") {
          try {
            return val ? JSON.parse(val) : {};
          } catch {
            return {};
          }
        }
        return val || {};
      },
      []
    );

    // Initialize internal value from prop
    const [internalValue, setInternalValue] = useState<OperationalHoursData>(
      () => parseValue(value)
    );
    const hiddenInputRef = React.useRef<HTMLInputElement>(null);
    const isControlledRef = React.useRef(onChange !== undefined);

    useImperativeHandle(ref, () => hiddenInputRef.current!);

    // Only update internal value if the component is controlled and the value actually changed
    useEffect(() => {
      if (isControlledRef.current) {
        const parsedValue = parseValue(value);
        const currentStringified = JSON.stringify(internalValue);
        const newStringified = JSON.stringify(parsedValue);

        if (currentStringified !== newStringified) {
          setInternalValue(parsedValue);
        }
      }
    }, [value, parseValue, internalValue]);

    const handleDayChange = useCallback(
      (day: string, slots: TimeSlot[]) => {
        setInternalValue((prevValue) => {
          const newValue = { ...prevValue };
          if (slots.length === 0) {
            delete newValue[day.toLowerCase()];
          } else {
            newValue[day.toLowerCase()] = slots;
          }

          // Only call onChange if component is controlled
          if (isControlledRef.current && onChange) {
            setTimeout(() => {
              onChange(newValue); // ✅ Pass the object directly
            }, 0);
          }

          return newValue;
        });
      },
      [onChange]
    );

    const variantClasses = {
      default: "space-y-4",
      compact: "space-y-2",
      expanded: "space-y-6",
    };

    const containerClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    return (
      <div
        className={`operational-hours ${containerClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        {label && <label>{label}</label>}
        {/* Hidden input for form compatibility */}
        <input
          ref={hiddenInputRef}
          type="hidden"
          name={name}
          value={JSON.stringify(internalValue)} // still fine for native form submission
          required={required}
          onBlur={onBlur}
        />

        {placeholder && Object.keys(internalValue).length === 0 && (
          <div
            className={`text-[hsl(var(--muted-foreground))] italic mb-4 ${
              size === "sm" ? "text-xs" : "text-sm"
            }`}
          >
            {placeholder}
          </div>
        )}

        <div className="space-y-3">
          {days.map((day) => (
            <DaySchedule
              key={day}
              day={day}
              slots={internalValue[day.toLowerCase()] || []}
              onSlotsChange={(slots) => handleDayChange(day, slots)}
              timeFormat={timeFormat}
              size={size}
              variant={variant}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    );
  }
);

OperationalHours.displayName = "OperationalHours";

export default OperationalHours;
