"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Building2,
    MessageSquare,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
    Search,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Automations", href: "/automations", icon: Zap },
];

const bottomNav = [
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 240 }}
            className={cn(
                "fixed left-0 top-0 h-screen z-40",
                "bg-surface border-r border-border",
                "flex flex-col"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                        <Building2 size={18} className="text-white" />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-bold text-lg text-foreground overflow-hidden whitespace-nowrap"
                            >
                                Sophicus
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Search (when expanded) */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 py-3 border-b border-border overflow-hidden"
                    >
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-elevated border border-border text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                                        "transition-colors duration-200",
                                        "hover:bg-surface-elevated",
                                        isActive
                                            ? "bg-brand/10 text-brand"
                                            : "text-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 w-0.5 h-5 bg-brand rounded-r-full"
                                        />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t border-border py-4 px-3">
                <ul className="space-y-1">
                    {bottomNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                                        "transition-colors duration-200",
                                        "hover:bg-surface-elevated",
                                        isActive
                                            ? "bg-brand/10 text-brand"
                                            : "text-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "text-muted hover:text-foreground hover:bg-surface-elevated",
                        "transition-colors duration-200"
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight size={20} className="shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft size={20} className="shrink-0" />
                            <span className="text-sm font-medium">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
