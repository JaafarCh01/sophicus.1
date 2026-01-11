"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: "default" | "glass" | "elevated";
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
    onClick?: () => void;
}

const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
};

const variantStyles = {
    default: "bg-surface border border-border",
    glass: "glass",
    elevated: "bg-surface-elevated border border-border shadow-lg",
};

export function Card({
    children,
    className,
    variant = "default",
    hover = false,
    padding = "md",
    onClick,
}: CardProps) {
    const Component = hover || onClick ? motion.div : "div";

    const hoverProps = hover || onClick
        ? {
            whileHover: { y: -2, boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.2)" },
            transition: { duration: 0.2 },
        }
        : {};

    return (
        <Component
            className={cn(
                "rounded-xl",
                variantStyles[variant],
                paddingStyles[padding],
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
            {...hoverProps}
        >
            {children}
        </Component>
    );
}

export function CardHeader({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            {children}
        </div>
    );
}

export function CardTitle({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <h3 className={cn("text-lg font-semibold text-foreground", className)}>
            {children}
        </h3>
    );
}

export function CardDescription({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p className={cn("text-sm text-muted", className)}>
            {children}
        </p>
    );
}

export function CardContent({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return <div className={cn("", className)}>{children}</div>;
}

export function CardFooter({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center gap-2 mt-4 pt-4 border-t border-border", className)}>
            {children}
        </div>
    );
}
