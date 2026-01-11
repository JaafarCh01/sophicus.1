"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const variantStyles = {
    primary: "bg-brand text-white hover:bg-brand/90 shadow-md shadow-brand/25",
    secondary: "bg-surface-elevated text-foreground hover:bg-surface-elevated/80 border border-border",
    ghost: "bg-transparent text-foreground hover:bg-surface-elevated",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-md shadow-danger/25",
    outline: "bg-transparent border border-brand text-brand hover:bg-brand/10",
};

const sizeStyles = {
    sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
    md: "h-10 px-4 text-sm gap-2 rounded-lg",
    lg: "h-12 px-6 text-base gap-2 rounded-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...(props as HTMLMotionProps<"button">)}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="shrink-0">{leftIcon}</span>
                ) : null}
                {children}
                {rightIcon && !isLoading && (
                    <span className="shrink-0">{rightIcon}</span>
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";

export { Button };
