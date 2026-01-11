"use client";

import { Bell, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    actions?: React.ReactNode;
}

export function Header({ title, subtitle, showSearch = false, actions }: HeaderProps) {
    return (
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left: Title */}
                <div>
                    <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted">{subtitle}</p>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {showSearch && (
                        <div className="relative hidden md:block">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-64 h-9 pl-9 pr-3 rounded-lg bg-surface-elevated border border-border text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    )}

                    {actions}

                    {/* Notifications */}
                    <button
                        className={cn(
                            "relative p-2 rounded-lg",
                            "text-muted hover:text-foreground hover:bg-surface-elevated",
                            "transition-colors duration-200"
                        )}
                    >
                        <Bell size={20} />
                        {/* Notification dot */}
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                    </button>

                    {/* User Menu */}
                    <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-elevated transition-colors">
                        <Avatar name="John Doe" size="sm" />
                    </button>
                </div>
            </div>
        </header>
    );
}

export function PageHeader({
    title,
    subtitle,
    primaryAction,
    secondaryAction,
}: {
    title: string;
    subtitle?: string;
    primaryAction?: {
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {subtitle && (
                    <p className="text-muted mt-1">{subtitle}</p>
                )}
            </div>
            <div className="flex items-center gap-3">
                {secondaryAction && (
                    <Button variant="secondary" onClick={secondaryAction.onClick}>
                        {secondaryAction.label}
                    </Button>
                )}
                {primaryAction && (
                    <Button
                        onClick={primaryAction.onClick}
                        leftIcon={primaryAction.icon || <Plus size={18} />}
                    >
                        {primaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
