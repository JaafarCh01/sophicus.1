"use client";

import { cn, getStatusClass } from "@/lib/utils";

export interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info" | "brand";
    size?: "sm" | "md";
    className?: string;
}

const variantStyles = {
    default: "bg-surface-elevated text-foreground border border-border",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
    info: "bg-info/15 text-info",
    brand: "bg-brand/15 text-brand",
};

const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
};

export function Badge({
    children,
    variant = "default",
    size = "sm",
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {children}
        </span>
    );
}

export function StatusBadge({
    status,
    size = "sm",
    className,
}: {
    status: string;
    size?: "sm" | "md";
    className?: string;
}) {
    const statusLabels: Record<string, string> = {
        new: "New",
        contacted: "Contacted",
        qualified: "Qualified",
        negotiation: "Negotiation",
        won: "Won",
        lost: "Lost",
        available: "Available",
        pending: "Pending",
        sold: "Sold",
        off_market: "Off Market",
        pre_launch: "Pre-Launch",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full",
                getStatusClass(status),
                sizeStyles[size],
                className
            )}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
            {statusLabels[status] || status}
        </span>
    );
}

export function ScoreBadge({
    score,
    size = "md",
    className,
}: {
    score: number;
    size?: "sm" | "md";
    className?: string;
}) {
    const getScoreVariant = (score: number) => {
        if (score >= 80) return "success";
        if (score >= 60) return "brand";
        if (score >= 40) return "warning";
        return "danger";
    };

    return (
        <Badge variant={getScoreVariant(score)} size={size} className={className}>
            {score}
        </Badge>
    );
}
