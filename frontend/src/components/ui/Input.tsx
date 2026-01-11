"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = "text",
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        disabled={disabled}
                        className={cn(
                            "w-full h-10 px-3 py-2 rounded-lg",
                            "bg-surface-elevated border border-border text-foreground",
                            "placeholder:text-muted",
                            "transition-colors duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            error && "border-danger focus:ring-danger",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && (
                    <p className="mt-1 text-sm text-danger">{error}</p>
                )}
                {hint && !error && (
                    <p className="mt-1 text-sm text-muted">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
