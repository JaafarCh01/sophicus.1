"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge, ScoreBadge, Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { analyticsApi, leadApi, propertyApi } from "@/lib/api";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import type { Lead } from "@/types";
import { motion } from "framer-motion";
import {
    Users,
    Building2,
    TrendingUp,
    Clock,
    Plus,
    Mail,
    ArrowRight,
    Loader2,
    Flame,
    Target,
    BarChart3,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
    leads: {
        total: number;
        this_month: number;
        last_month: number;
        by_status: Record<string, number>;
        by_source: Record<string, number>;
        hot_leads: number;
        conversion_rate: number;
    };
    properties: {
        total: number;
        active: number;
        for_sale: number;
        presale: number;
        featured: number;
        avg_price: number;
    };
    recent_activity: Array<{
        id: string;
        lead_id: string;
        type: string;
        title: string;
        created_at: string;
        lead?: { id: string; name: string };
    }>;
    acquisition_trend: Array<{ week: string; count: number }>;
}

interface FunnelData {
    funnel: Record<string, number>;
    conversions: Record<string, number>;
    lost: number;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [funnel, setFunnel] = useState<FunnelData | null>(null);
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardData, funnelData, leadsResponse] = await Promise.all([
                    analyticsApi.getDashboard().catch(() => null),
                    analyticsApi.getFunnel().catch(() => null),
                    leadApi.getLeads({ per_page: 5 }).catch(() => ({ data: [] })),
                ]);

                setData(dashboardData);
                setFunnel(funnelData);
                setRecentLeads(leadsResponse.data || []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = [
        {
            title: "Total Leads",
            value: data?.leads.total?.toLocaleString() ?? "—",
            change: data ? ((data.leads.this_month - data.leads.last_month) / Math.max(data.leads.last_month, 1) * 100) : 0,
            trend: (data?.leads.this_month ?? 0) >= (data?.leads.last_month ?? 0) ? "up" as const : "down" as const,
            icon: Users,
        },
        {
            title: "Active Properties",
            value: data?.properties.active?.toString() ?? "—",
            change: 0,
            trend: "up" as const,
            icon: Building2,
        },
        {
            title: "Conversion Rate",
            value: data ? `${data.leads.conversion_rate}%` : "—",
            change: 0,
            trend: "up" as const,
            icon: TrendingUp,
        },
        {
            title: "Hot Leads",
            value: data?.leads.hot_leads?.toString() ?? "—",
            change: 0,
            trend: "up" as const,
            icon: Flame,
        },
    ];

    return (
        <MainLayout title="Dashboard" subtitle="Welcome back">
            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                {stats.map((stat) => (
                    <motion.div key={stat.title} variants={item}>
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lead Funnel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Target size={20} className="text-brand" />
                                <CardTitle>Lead Funnel</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="animate-spin text-muted" size={32} />
                                </div>
                            ) : funnel ? (
                                <FunnelChart data={funnel} />
                            ) : (
                                <div className="text-center text-muted py-8">
                                    No funnel data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Lead Sources */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BarChart3 size={20} className="text-brand" />
                                <CardTitle>Top Sources</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-8 bg-border rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : data?.leads.by_source ? (
                                <SourceChart sources={data.leads.by_source} />
                            ) : (
                                <div className="text-center text-muted py-8">
                                    No source data
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Leads */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
            >
                <Card padding="none" className="overflow-hidden">
                    <CardHeader className="p-4 border-b border-border">
                        <CardTitle>Recent Leads</CardTitle>
                        <Link href="/leads">
                            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />}>
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="divide-y divide-border">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-4 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-border" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-border rounded w-1/3" />
                                                <div className="h-3 bg-border rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentLeads.length > 0 ? (
                            <div className="divide-y divide-border">
                                {recentLeads.map((lead) => (
                                    <Link
                                        key={lead.id}
                                        href="/leads"
                                        className="p-4 flex items-center gap-4 hover:bg-surface-elevated transition-colors cursor-pointer block"
                                    >
                                        <Avatar name={lead.name} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground truncate">
                                                    {lead.name}
                                                </span>
                                                <ScoreBadge score={lead.score} size="sm" />
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {lead.email || "No email"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={lead.status} />
                                            <p className="text-xs text-muted mt-1">
                                                {formatRelativeTime(lead.created_at)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted">
                                No leads yet. Start capturing leads!
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6"
            >
                <Card variant="glass" className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground">
                            Ready to capture more leads?
                        </h3>
                        <p className="text-sm text-muted">
                            Connect your WhatsApp or Instagram to start receiving leads automatically.
                        </p>
                    </div>
                    <Button leftIcon={<Plus size={18} />}>
                        Connect Channel
                    </Button>
                </Card>
            </motion.div>
        </MainLayout>
    );
}

// Funnel Chart Component
function FunnelChart({ data }: { data: FunnelData }) {
    const stages = [
        { key: "new", label: "New", color: "bg-info" },
        { key: "contacted", label: "Contacted", color: "bg-brand" },
        { key: "qualified", label: "Qualified", color: "bg-accent" },
        { key: "negotiation", label: "Negotiation", color: "bg-warning" },
        { key: "won", label: "Won", color: "bg-success" },
    ];

    const maxValue = Math.max(...Object.values(data.funnel), 1);

    return (
        <div className="space-y-4">
            {stages.map((stage, index) => {
                const value = data.funnel[stage.key] ?? 0;
                const width = (value / maxValue) * 100;
                const nextKey = stages[index + 1]?.key;
                const conversionKey = nextKey ? `${stage.key}_to_${nextKey}` : null;
                const conversionRate = conversionKey ? data.conversions[conversionKey] : null;

                return (
                    <div key={stage.key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground font-medium">{stage.label}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-muted">{value} leads</span>
                                {conversionRate !== null && (
                                    <span className="text-xs text-muted">
                                        → {conversionRate}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-6 bg-border rounded-full overflow-hidden">
                            <motion.div
                                className={cn("h-full rounded-full", stage.color)}
                                initial={{ width: 0 }}
                                animate={{ width: `${width}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Lost leads indicator */}
            <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted">Lost leads</span>
                <Badge variant="danger">{data.lost}</Badge>
            </div>
        </div>
    );
}

// Source Chart Component
function SourceChart({ sources }: { sources: Record<string, number> }) {
    const sourceColors: Record<string, string> = {
        instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
        whatsapp: "bg-success",
        website: "bg-brand",
        facebook: "bg-blue-500",
        tiktok: "bg-foreground",
        referral: "bg-accent",
        portal: "bg-warning",
        cold_outreach: "bg-muted",
    };

    const entries = Object.entries(sources).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    return (
        <div className="space-y-3">
            {entries.map(([source, count]) => {
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                    <div key={source} className="flex items-center gap-3">
                        <div className="w-20 text-sm text-foreground capitalize truncate">
                            {source.replace(/_/g, " ")}
                        </div>
                        <div className="flex-1 h-4 bg-border rounded-full overflow-hidden">
                            <motion.div
                                className={cn("h-full rounded-full", sourceColors[source] || "bg-brand")}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.6 }}
                            />
                        </div>
                        <div className="w-12 text-right text-sm text-muted">
                            {count}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
