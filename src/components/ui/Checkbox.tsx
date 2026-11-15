import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const describedBy = description ? `${checkboxId}-description` : undefined;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              "peer h-4 w-4 appearance-none rounded-sm border-2",
              "border-border bg-surface text-primary",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
              "checked:bg-primary checked:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            aria-describedby={describedBy}
            {...props}
          />
          <Check
            className={cn(
              "absolute w-3.5 h-3.5 text-white opacity-0 scale-50",
              "peer-checked:opacity-100 peer-checked:scale-100",
              "transition-all duration-200",
              "pointer-events-none"
            )}
            aria-hidden="true"
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-text cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p id={describedBy} className="text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };