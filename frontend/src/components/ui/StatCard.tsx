"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
    title: string;
    value: string | number;
    change?: number; // percentage change
    changeLabel?: string;
    icon?: LucideIcon;
    trend?: "up" | "down" | "neutral";
    className?: string;
}

export function StatCard({
    title,
    value,
    change,
    changeLabel,
    icon: Icon,
    trend = "neutral",
    className,
}: StatCardProps) {
    const trendColors = {
        up: "text-success",
        down: "text-danger",
        neutral: "text-muted",
    };

    const trendIcons = {
        up: "↑",
        down: "↓",
        neutral: "→",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-xl",
                "bg-surface-elevated border border-border",
                "p-5",
                className
            )}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />

            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted">{title}</span>
                    {Icon && (
                        <div className="p-2 rounded-lg bg-brand/10">
                            <Icon size={18} className="text-brand" />
                        </div>
                    )}
                </div>

                <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-foreground">{value}</span>

                    {change !== undefined && (
                        <div className={cn("flex items-center text-sm", trendColors[trend])}>
                            <span className="mr-1">{trendIcons[trend]}</span>
                            <span>{Math.abs(change)}%</span>
                            {changeLabel && (
                                <span className="ml-1 text-muted text-xs">{changeLabel}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="rounded-xl bg-surface-elevated border border-border p-5 animate-pulse">
            <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-border rounded" />
                <div className="h-8 w-8 bg-border rounded-lg" />
            </div>
            <div className="h-8 w-32 bg-border rounded" />
        </div>
    );
}
