import * as React from "react";

import { cn } from "@/lib/utils";
import { Asterisk } from "lucide-react";

interface InputPropsLabel extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  instruction?: string;
  required?: boolean;
  id?: string;
  error?: string | false | undefined;
  touched?: boolean;
}

/* type InputProps = React.InputHTMLAttributes<HTMLInputElement>; */

const Input = React.forwardRef<HTMLInputElement, InputPropsLabel>(
  ({ className, type, label, instruction, required, id, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1">
        {label && (
          <div className="flex flex-col">
            <label
              htmlFor={id}
              className={cn(
                `cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-start`
              )}
            >
              {label}
              {required && <Asterisk size={14} className="text-destructive" />}
            </label>
            {instruction && (
              <p className="text-xs text-muted-foreground">{instruction}</p>
            )}
          </div>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary  disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
