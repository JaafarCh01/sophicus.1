"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, children, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            "w-full h-10 px-3 pr-10 rounded-lg appearance-none cursor-pointer",
                            "bg-surface-elevated border border-border text-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            // Dark mode styling for options
                            "[&>option]:bg-surface-elevated [&>option]:text-foreground",
                            error && "border-danger focus:ring-danger",
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <ChevronDown size={16} />
                    </div>
                </div>
                {error && <p className="mt-1 text-sm text-danger">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select };
