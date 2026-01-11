"use client";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

export interface AvatarProps {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeStyles = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
};

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
    const initials = name ? getInitials(name) : "?";

    if (src) {
        return (
            <img
                src={src}
                alt={alt || name || "Avatar"}
                className={cn(
                    "rounded-full object-cover ring-2 ring-border",
                    sizeStyles[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-brand to-accent",
                "text-white font-medium",
                sizeStyles[size],
                className
            )}
        >
            {initials}
        </div>
    );
}

export function AvatarGroup({
    avatars,
    max = 4,
    size = "sm",
    className,
}: {
    avatars: { src?: string | null; name?: string }[];
    max?: number;
    size?: "xs" | "sm" | "md";
    className?: string;
}) {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
        <div className={cn("flex -space-x-2", className)}>
            {visibleAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    name={avatar.name}
                    size={size}
                    className="ring-2 ring-background"
                />
            ))}
            {remainingCount > 0 && (
                <div
                    className={cn(
                        "rounded-full flex items-center justify-center",
                        "bg-surface-elevated text-muted font-medium",
                        "ring-2 ring-background",
                        sizeStyles[size]
                    )}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}
