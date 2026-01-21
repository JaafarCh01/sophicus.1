"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { analyticsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Target,
    BarChart3,
    PieChart,
    Calendar,
    Download,
    RefreshCw,
    Loader2,
    Award,
    Clock,
    DollarSign,
    ArrowRight,
} from "lucide-react";

interface SourceData {
    source: string;
    total: number;
    won: number;
    lost: number;
    avg_score: number;
    conversion_rate: number;
}

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<"7" | "30" | "90">("30");
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [funnelData, setFunnelData] = useState<any>(null);
    const [sourceData, setSourceData] = useState<SourceData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [dashboard, funnel, sources] = await Promise.all([
                    analyticsApi.getDashboard().catch(() => null),
                    analyticsApi.getFunnel().catch(() => null),
                    analyticsApi.getSourcePerformance().catch(() => []),
                ]);
                setDashboardData(dashboard);
                setFunnelData(funnel);
                setSourceData(sources);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    return (
        <MainLayout
            title="Analytics"
            subtitle="Track performance and understand your sales pipeline"
        >
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as "7" | "30" | "90")}
                        className="w-40"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </Select>
                    <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<RefreshCw size={14} />}
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </Button>
                </div>
                <Button variant="secondary" leftIcon={<Download size={16} />}>
                    Export Report
                </Button>
            </div>

            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <KPICard
                    title="Total Leads"
                    value={dashboardData?.leads?.total?.toLocaleString() ?? "—"}
                    change={dashboardData ? Math.round(((dashboardData.leads.this_month - dashboardData.leads.last_month) / Math.max(dashboardData.leads.last_month, 1)) * 100) : 0}
                    icon={Users}
                    loading={loading}
                />
                <KPICard
                    title="Conversion Rate"
                    value={dashboardData?.leads?.conversion_rate ? `${dashboardData.leads.conversion_rate}%` : "—"}
                    change={2.3}
                    icon={Target}
                    loading={loading}
                />
                <KPICard
                    title="Hot Leads"
                    value={dashboardData?.leads?.hot_leads?.toString() ?? "—"}
                    change={15}
                    icon={TrendingUp}
                    loading={loading}
                />
                <KPICard
                    title="Avg. Response Time"
                    value="2.4h"
                    change={-18}
                    invertColors
                    icon={Clock}
                    loading={loading}
                />
            </motion.div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Funnel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Target size={20} className="text-brand" />
                                <CardTitle>Sales Funnel</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="animate-spin text-muted" size={32} />
                                </div>
                            ) : funnelData ? (
                                <FunnelVisualization data={funnelData} />
                            ) : (
                                <EmptyState message="No funnel data available" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Lead Sources Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <PieChart size={20} className="text-brand" />
                                <CardTitle>Lead Sources</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="animate-spin text-muted" size={32} />
                                </div>
                            ) : sourceData.length > 0 ? (
                                <SourcePerformanceChart data={sourceData} />
                            ) : (
                                <EmptyState message="No source data available" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Source Performance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card padding="none">
                    <CardHeader className="p-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={20} className="text-brand" />
                            <CardTitle>Source Performance Breakdown</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="animate-spin text-muted mx-auto" size={32} />
                            </div>
                        ) : sourceData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left p-4 text-sm font-medium text-muted">Source</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted">Total Leads</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted">Won</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted">Lost</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted">Conversion</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted">Avg Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sourceData.map((source) => (
                                            <tr key={source.source} className="border-b border-border hover:bg-surface-elevated transition-colors">
                                                <td className="p-4">
                                                    <span className="font-medium text-foreground capitalize">
                                                        {source.source.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right text-foreground">{source.total}</td>
                                                <td className="p-4 text-right text-success">{source.won}</td>
                                                <td className="p-4 text-right text-danger">{source.lost}</td>
                                                <td className="p-4 text-right">
                                                    <Badge variant={source.conversion_rate >= 20 ? "success" : source.conversion_rate >= 10 ? "warning" : "default"}>
                                                        {source.conversion_rate}%
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={cn(
                                                        "font-medium",
                                                        source.avg_score >= 70 ? "text-success" :
                                                            source.avg_score >= 50 ? "text-warning" : "text-muted"
                                                    )}>
                                                        {source.avg_score}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted">
                                No source data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Top Performers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Award size={20} className="text-warning" />
                            <CardTitle>Top Performers</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((rank) => (
                                <div
                                    key={rank}
                                    className={cn(
                                        "p-4 rounded-lg border",
                                        rank === 1 ? "border-warning/50 bg-warning/5" : "border-border"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                                            rank === 1 ? "bg-warning text-black" :
                                                rank === 2 ? "bg-muted-foreground text-white" :
                                                    "bg-orange-600 text-white"
                                        )}>
                                            {rank}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {rank === 1 ? "Maria Garcia" : rank === 2 ? "Carlos Mendez" : "Ana Rodriguez"}
                                            </p>
                                            <p className="text-sm text-muted">
                                                {rank === 1 ? "15 deals closed" : rank === 2 ? "12 deals closed" : "9 deals closed"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </MainLayout>
    );
}

// KPI Card Component
function KPICard({
    title,
    value,
    change,
    icon: Icon,
    loading,
    invertColors = false,
}: {
    title: string;
    value: string;
    change: number;
    icon: any;
    loading: boolean;
    invertColors?: boolean;
}) {
    const isPositive = invertColors ? change < 0 : change > 0;

    return (
        <Card>
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-brand/10">
                    <Icon size={20} className="text-brand" />
                </div>
                {!loading && change !== 0 && (
                    <div className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        isPositive ? "text-success" : "text-danger"
                    )}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            {loading ? (
                <div className="space-y-2">
                    <div className="h-8 bg-border rounded animate-pulse w-24" />
                    <div className="h-4 bg-border rounded animate-pulse w-20" />
                </div>
            ) : (
                <>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-sm text-muted">{title}</p>
                </>
            )}
        </Card>
    );
}

// Funnel Visualization
function FunnelVisualization({ data }: { data: any }) {
    const stages = [
        { key: "new", label: "New", color: "bg-info" },
        { key: "contacted", label: "Contacted", color: "bg-brand" },
        { key: "qualified", label: "Qualified", color: "bg-accent" },
        { key: "negotiation", label: "Negotiation", color: "bg-warning" },
        { key: "won", label: "Won", color: "bg-success" },
    ];

    const maxValue = Math.max(...Object.values(data.funnel as Record<string, number>), 1);

    return (
        <div className="space-y-4">
            {stages.map((stage, index) => {
                const value = data.funnel[stage.key] ?? 0;
                const widthPercent = (value / maxValue) * 100;
                const nextKey = stages[index + 1]?.key;
                const conversionKey = nextKey ? `${stage.key}_to_${nextKey}` : null;
                const conversionRate = conversionKey ? data.conversions?.[conversionKey] : null;

                return (
                    <div key={stage.key}>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-foreground">{stage.label}</span>
                            <span className="text-muted">{value} leads</span>
                        </div>
                        <div className="relative">
                            <div className="h-10 bg-border rounded-lg overflow-hidden">
                                <motion.div
                                    className={cn("h-full rounded-lg flex items-center justify-end pr-3", stage.color)}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${widthPercent}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                >
                                    {widthPercent > 20 && (
                                        <span className="text-white text-sm font-medium">
                                            {Math.round(widthPercent)}%
                                        </span>
                                    )}
                                </motion.div>
                            </div>
                            {conversionRate !== null && (
                                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs text-muted">
                                    <ArrowRight size={12} />
                                    {conversionRate}%
                                </div>
                            )}
                        </div>
                        {conversionRate !== null && <div className="h-4" />}
                    </div>
                );
            })}

            <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
                <span className="text-muted">Lost leads</span>
                <Badge variant="danger">{data.lost ?? 0}</Badge>
            </div>
        </div>
    );
}

// Source Performance Chart
function SourcePerformanceChart({ data }: { data: SourceData[] }) {
    const total = data.reduce((sum, s) => sum + s.total, 0);
    const colors = [
        "bg-brand",
        "bg-success",
        "bg-accent",
        "bg-warning",
        "bg-info",
        "bg-danger",
    ];

    return (
        <div className="space-y-4">
            {/* Donut representation */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {data.map((source, index) => {
                            const percentage = total > 0 ? (source.total / total) * 100 : 0;
                            const offset = data.slice(0, index).reduce((sum, s) => sum + (total > 0 ? (s.total / total) * 100 : 0), 0);
                            const colorClass = colors[index % colors.length];

                            return (
                                <circle
                                    key={source.source}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="20"
                                    strokeDasharray={`${percentage * 2.51} 251`}
                                    strokeDashoffset={-offset * 2.51}
                                    className={cn("text-brand", {
                                        "text-brand": index === 0,
                                        "text-success": index === 1,
                                        "text-accent": index === 2,
                                        "text-warning": index === 3,
                                        "text-info": index === 4,
                                    })}
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-foreground">{total}</span>
                        <span className="text-xs text-muted">Total</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {data.slice(0, 5).map((source, index) => {
                    const percentage = total > 0 ? ((source.total / total) * 100).toFixed(1) : 0;

                    return (
                        <div key={source.source} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", colors[index % colors.length])} />
                                <span className="text-sm text-foreground capitalize">
                                    {source.source.replace(/_/g, " ")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted">{source.total}</span>
                                <span className="text-xs text-muted">({percentage}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Empty State
function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3 size={48} className="text-muted mb-4 opacity-50" />
            <p className="text-muted">{message}</p>
        </div>
    );
}
