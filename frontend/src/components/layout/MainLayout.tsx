"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    actions?: React.ReactNode;
}

export function MainLayout({
    children,
    title,
    subtitle,
    showSearch = false,
    actions,
}: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            {/* Main Content - offset by sidebar width */}
            <div className="pl-[240px]">
                <Header
                    title={title}
                    subtitle={subtitle}
                    showSearch={showSearch}
                    actions={actions}
                />

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
