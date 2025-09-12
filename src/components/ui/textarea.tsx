import * as React from "react";

import { cn } from "@/lib/utils";
import { Asterisk } from "lucide-react";

interface TextareaPropsLabel
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  instruction?: string;
  required?: boolean;
  id?: string;
}

/* type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>; */

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaPropsLabel>(
  ({ className, label, instruction, required, id, ...props }, ref) => {
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
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring  disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
