"use client";

import * as React from "react";
import { addDays, format, subDays } from "date-fns";
import { CalendarIcon, CircleX, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  enableLabel?: boolean;
  label?: string;
  value?: string | Date | null | undefined;
  initialDate?: Date;
  enableRange?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(
    {
      label,
      enableLabel = true,
      enableRange = false,
      value,
      onChange,
      onSelect,
      minDate,
      maxDate,
      className,
      initialDate,
      name,
      required,
      disabled,
    },
    ref
  ) {
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const [singleDate, setSingleDate] = React.useState<Date | undefined>(
      initialDate ? new Date(initialDate.setHours(0, 0, 0, 0)) : undefined
    );

    const [isOpen, setIsOpen] = React.useState(false);
    const [currentYear, setCurrentYear] = React.useState(
      new Date().getFullYear()
    );
    const [currentMonth, setCurrentMonth] = React.useState(
      new Date().getMonth()
    );

    React.useEffect(() => {
      if (value && value !== null) {
        const dateValue = typeof value === "string" ? new Date(value) : value;
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          const adjustedDate = new Date(dateValue.setHours(0, 0, 0, 0));
          setSingleDate(adjustedDate);
        }
      } else {
        setSingleDate(undefined);
        setDate(undefined);
      }
    }, [value]);

    const [selectionMode, setSelectionMode] = React.useState<
      "single" | "range"
    >("single");

    React.useEffect(() => {
      if (enableRange) {
        setSelectionMode("range");
      } else {
        setSelectionMode("single");
      }
    }, [enableRange]);

    const currentYearInPresent = new Date().getFullYear();
    const yearOptions = Array.from(
      { length: 111 },
      (_, i) => currentYearInPresent - 100 + i
    );

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const createSyntheticEvent = (
      dateValue: Date | undefined
    ): React.ChangeEvent<HTMLInputElement> => {
      const target = {
        name: name || "",
        value: dateValue ? dateValue.toISOString() : "",
        type: "date",
      } as HTMLInputElement;

      return {
        target,
        currentTarget: target,
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 2,
        isTrusted: true,
        nativeEvent: {} as Event,
        preventDefault: () => {},
        isDefaultPrevented: () => false,
        stopPropagation: () => {},
        isPropagationStopped: () => false,
        persist: () => {},
        timeStamp: Date.now(),
        type: "change",
      } as React.ChangeEvent<HTMLInputElement>;
    };

    const handleSelect = (newDate: Date | DateRange | undefined) => {
      if (selectionMode === "range" && newDate && "from" in newDate) {
        if (newDate.from && newDate.to) {
          const adjustedDateRange = {
            from: new Date(newDate.from.setHours(0, 0, 0, 0)),
            to: new Date(newDate.to.setHours(23, 59, 59, 999)),
          };
          setDate(adjustedDateRange);
          const syntheticEvent = createSyntheticEvent(adjustedDateRange.from);
          onSelect?.(syntheticEvent);
          onChange?.(syntheticEvent);
          setIsOpen(false);
        } else if (newDate.from) {
          const adjustedFrom = new Date(newDate.from.setHours(0, 0, 0, 0));
          setDate({ from: adjustedFrom, to: undefined });
          const syntheticEvent = createSyntheticEvent(adjustedFrom);
          onSelect?.(syntheticEvent);
          onChange?.(syntheticEvent);
        }
      } else if (
        selectionMode === "single" &&
        newDate &&
        !("from" in (newDate as DateRange))
      ) {
        const adjustedDate = new Date((newDate as Date).setHours(0, 0, 0, 0));
        setSingleDate(adjustedDate);

        const utcDate = new Date(
          adjustedDate.getTime() - adjustedDate.getTimezoneOffset() * 60000
        );
        const syntheticEvent = createSyntheticEvent(utcDate);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
        setIsOpen(false);
      } else if (newDate === undefined) {
        if (selectionMode === "range") {
          setDate(undefined);
        } else {
          setSingleDate(undefined);
        }
        const syntheticEvent = createSyntheticEvent(undefined);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
      }
    };

    const today = () => {
      const now = new Date();
      const adjustedNow = new Date(now.setHours(0, 0, 0, 0));

      if (selectionMode === "range") {
        const range = { from: adjustedNow, to: addDays(adjustedNow, 7) };
        setDate(range);
        const syntheticEvent = createSyntheticEvent(adjustedNow);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
      } else {
        setSingleDate(adjustedNow);
        const syntheticEvent = createSyntheticEvent(adjustedNow);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
      }

      setCurrentYear(adjustedNow.getFullYear());
      setCurrentMonth(adjustedNow.getMonth());
      setIsOpen(false);
    };

    const yesterday = () => {
      const prev = subDays(new Date(), 1);
      const adjustedPrev = new Date(prev.setHours(0, 0, 0, 0));

      if (selectionMode === "range") {
        const range = { from: adjustedPrev, to: new Date() };
        setDate(range);
        const syntheticEvent = createSyntheticEvent(adjustedPrev);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
      } else {
        setSingleDate(adjustedPrev);
        const syntheticEvent = createSyntheticEvent(adjustedPrev);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
      }

      setCurrentYear(adjustedPrev.getFullYear());
      setCurrentMonth(adjustedPrev.getMonth());
      setIsOpen(false);
    };

    const lastWeek = () => {
      const weekAgo = subDays(new Date(), 7);
      const adjustedWeekAgo = new Date(weekAgo.setHours(0, 0, 0, 0));

      if (selectionMode === "range") {
        const range = { from: adjustedWeekAgo, to: new Date() };
        setDate(range);
        const syntheticEvent = createSyntheticEvent(adjustedWeekAgo);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
      } else {
        setSingleDate(adjustedWeekAgo);
        const syntheticEvent = createSyntheticEvent(adjustedWeekAgo);
        onSelect?.(syntheticEvent);
        onChange?.(syntheticEvent);
      }

      setCurrentYear(adjustedWeekAgo.getFullYear());
      setCurrentMonth(adjustedWeekAgo.getMonth());
      setIsOpen(false);
    };

    const clearSelection = () => {
      if (selectionMode === "range") {
        setDate(undefined);
      } else {
        setSingleDate(undefined);
      }
      const syntheticEvent = createSyntheticEvent(undefined);
      onSelect?.(syntheticEvent);
      onChange?.(syntheticEvent);
    };

    const getHiddenMatchers = () => {
      const matchers = [];
      if (minDate) {
        matchers.push({ before: minDate });
      }
      if (maxDate) {
        matchers.push({ after: maxDate });
      }
      return matchers.length > 0 ? matchers : undefined;
    };

    return (
      <div className="w-full p-0">
        <input
          ref={ref}
          type="hidden"
          name={name}
          value={singleDate ? singleDate.toISOString() : ""}
          required={required}
          disabled={disabled}
        />

        {enableLabel && (
          <label className="text-sm font-medium p-0">{label}</label>
        )}
        <Popover
          open={isOpen && !disabled}
          onOpenChange={(open) => {
            if (!disabled) {
              setIsOpen(open);
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              disabled={disabled}
              variant={"outline"}
              className={cn(
                "overflow-hidden flex items-center gap-1 w-full justify-start text-left dark:focus:ring-primary border border-gray-400 dark:border-gray-600 h-[2.4rem] dark:text-gray-200 text-gray-700 font-medium py-1 px-3 hover:bg-gray-50 dark:hover:bg-zinc-900 focus:outline-none focus:border-transparent focus:ring-1 focus:ring-primary",
                "data-[state=open]:bg-white dark:data-[state=open]:bg-gray-800",
                !date && !singleDate
                  ? "text-muted-foreground dark:bg-gray-700 bg-gray-100"
                  : "text-primary dark:text-primary border-primary dark:border-primary dark:bg-slate-900 bg-white",
                disabled && "opacity-50 cursor-not-allowed",
                className
              )}
            >
              <CalendarIcon
                className={cn(
                  "h-4 w-4",
                  !date && !singleDate ? "text-muted-foreground" : "hidden"
                )}
              />
              {selectionMode === "range" ? (
                date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span className="text-muted-foreground">
                    Pick a date range
                  </span>
                )
              ) : singleDate ? (
                format(singleDate, "PPP")
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex items-center justify-between py-2 px-4 border-b">
              {enableRange ? (
                <Select
                  value={selectionMode}
                  onValueChange={(value: "single" | "range") => {
                    setSelectionMode(value);
                    if (value === "single") {
                      setDate(undefined);
                      setSingleDate(undefined);
                    } else {
                      setSingleDate(undefined);
                      setDate(undefined);
                    }
                    const syntheticEvent = createSyntheticEvent(undefined);
                    onSelect?.(syntheticEvent);
                    onChange?.(syntheticEvent);
                  }}
                >
                  <SelectTrigger className="h-8 w-[100px]">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="range">Range</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-8 flex items-center text-sm font-medium">
                  Single Date
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  aria-label="Clear"
                  title="Clear selection"
                  className="h-8 px-2"
                >
                  <span className="sr-only">Clear</span>
                  <div className="flex items-center gap-1">
                    <CircleX className="w-3.5 h-3.5" /> Clear
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="h-8 px-2"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3 p-3">
              <div className="flex gap-2 items-center">
                <Select
                  value={currentMonth.toString()}
                  onValueChange={(value: string) =>
                    setCurrentMonth(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue>{months[currentMonth]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month: string, index: number) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={currentYear.toString()}
                  onValueChange={(value: string) =>
                    setCurrentYear(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue>{currentYear}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="h-[200px]">
                    {yearOptions.map((year: number) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 bg-transparent"
                  onClick={today}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 bg-transparent"
                  onClick={yesterday}
                >
                  Yesterday
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 bg-transparent"
                  onClick={lastWeek}
                >
                  Last Week
                </Button>
              </div>
            </div>
            <div className="p-3 pt-0">
              {selectionMode === "range" ? (
                <Calendar
                  autoFocus
                  mode="range"
                  selected={date}
                  onSelect={handleSelect}
                  month={new Date(currentYear, currentMonth)}
                  onMonthChange={(month: Date) => {
                    setCurrentMonth(month.getMonth());
                    setCurrentYear(month.getFullYear());
                  }}
                  numberOfMonths={1}
                  defaultMonth={new Date()}
                  hidden={getHiddenMatchers()}
                  className="rounded-md border-0"
                />
              ) : (
                <Calendar
                  autoFocus
                  mode="single"
                  selected={singleDate}
                  onSelect={handleSelect}
                  month={new Date(currentYear, currentMonth)}
                  onMonthChange={(month: Date) => {
                    setCurrentMonth(month.getMonth());
                    setCurrentYear(month.getFullYear());
                  }}
                  numberOfMonths={1}
                  defaultMonth={new Date()}
                  hidden={getHiddenMatchers()}
                  className="rounded-md border-0"
                />
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
