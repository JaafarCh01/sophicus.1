"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, ScoreBadge, Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { leadApi, type LeadFilters } from "@/lib/api";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import type { Lead } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    Plus,
    Mail,
    Phone,
    Users,
    TrendingUp,
    Clock,
    Flame,
    ChevronLeft,
    ChevronRight,
    X,
    MoreVertical,
    Eye,
} from "lucide-react";

// Source icons mapping
const sourceIcons: Record<string, string> = {
    whatsapp: "💬",
    instagram: "📸",
    tiktok: "🎵",
    facebook: "📘",
    website: "🌐",
    referral: "🤝",
    portal: "🏠",
    cold_outreach: "📧",
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [filters, setFilters] = useState<LeadFilters>({
        per_page: 15,
        page: 1,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Fetch leads
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const response = await leadApi.getLeads(filters);
            setLeads(response.data);
            setPagination(response.meta);
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const data = await leadApi.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
        fetchStats();
    }, [fetchLeads, fetchStats]);

    // Handle search
    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    // Handle filter change
    const updateFilter = (key: keyof LeadFilters, value: string | number | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    // Handle pagination
    const goToPage = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({ per_page: 15, page: 1 });
        setShowFilters(false);
    };

    return (
        <MainLayout title="Leads" subtitle={`${pagination?.total ?? 0} total leads`} showSearch>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Leads"
                    value={stats.total || 0}
                    icon={Users}
                />
                <StatCard
                    title="New This Month"
                    value={stats.this_month || 0}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Hot Leads"
                    value={stats.hot_leads || 0}
                    icon={Flame}
                />
                <StatCard
                    title="Qualified"
                    value={stats.qualified || 0}
                    icon={Clock}
                />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={filters.search || ""}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={cn(
                                "w-64 h-10 pl-9 pr-3 rounded-lg",
                                "bg-surface-elevated border border-border text-foreground",
                                "placeholder:text-muted",
                                "focus:outline-none focus:ring-2 focus:ring-brand"
                            )}
                        />
                    </div>

                    {/* Filter Toggle */}
                    <Button
                        variant={showFilters ? "primary" : "secondary"}
                        size="md"
                        leftIcon={<Filter size={16} />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>

                    {/* Active filters indicator */}
                    {(filters.status || filters.source || filters.intent) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear filters <X size={14} className="ml-1" />
                        </Button>
                    )}
                </div>

                <Button leftIcon={<Plus size={18} />}>Add Lead</Button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <Card className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                                    <select
                                        value={filters.status || ""}
                                        onChange={(e) => updateFilter("status", e.target.value || undefined)}
                                        className={cn(
                                            "w-full h-10 px-3 rounded-lg",
                                            "bg-surface-elevated border border-border text-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-brand"
                                        )}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="negotiation">Negotiation</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>

                                {/* Source Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Source</label>
                                    <select
                                        value={filters.source || ""}
                                        onChange={(e) => updateFilter("source", e.target.value || undefined)}
                                        className={cn(
                                            "w-full h-10 px-3 rounded-lg",
                                            "bg-surface-elevated border border-border text-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-brand"
                                        )}
                                    >
                                        <option value="">All Sources</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="website">Website</option>
                                        <option value="referral">Referral</option>
                                        <option value="portal">Portal</option>
                                    </select>
                                </div>

                                {/* Intent Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Intent</label>
                                    <select
                                        value={filters.intent || ""}
                                        onChange={(e) => updateFilter("intent", e.target.value || undefined)}
                                        className={cn(
                                            "w-full h-10 px-3 rounded-lg",
                                            "bg-surface-elevated border border-border text-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-brand"
                                        )}
                                    >
                                        <option value="">All Intents</option>
                                        <option value="investor">Investor</option>
                                        <option value="end_buyer">End Buyer</option>
                                        <option value="renter">Renter</option>
                                        <option value="developer">Developer</option>
                                    </select>
                                </div>

                                {/* Min Score Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Min Score</label>
                                    <select
                                        value={filters.min_score || ""}
                                        onChange={(e) => updateFilter("min_score", e.target.value ? Number(e.target.value) : undefined)}
                                        className={cn(
                                            "w-full h-10 px-3 rounded-lg",
                                            "bg-surface-elevated border border-border text-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-brand"
                                        )}
                                    >
                                        <option value="">Any Score</option>
                                        <option value="80">80+ (Hot)</option>
                                        <option value="60">60+</option>
                                        <option value="40">40+</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Leads Table */}
            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-surface-elevated/50">
                                <th className="text-left text-sm font-medium text-muted px-4 py-3">Lead</th>
                                <th className="text-left text-sm font-medium text-muted px-4 py-3">Source</th>
                                <th className="text-left text-sm font-medium text-muted px-4 py-3">Status</th>
                                <th className="text-left text-sm font-medium text-muted px-4 py-3">Score</th>
                                <th className="text-left text-sm font-medium text-muted px-4 py-3">Budget</th>
                                <th className="text-left text-sm font-medium text-muted px-4 py-3">Created</th>
                                <th className="text-right text-sm font-medium text-muted px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border animate-pulse">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-border" />
                                                <div>
                                                    <div className="w-32 h-4 bg-border rounded" />
                                                    <div className="w-24 h-3 bg-border rounded mt-1" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4"><div className="w-20 h-4 bg-border rounded" /></td>
                                        <td className="px-4 py-4"><div className="w-16 h-6 bg-border rounded" /></td>
                                        <td className="px-4 py-4"><div className="w-8 h-6 bg-border rounded" /></td>
                                        <td className="px-4 py-4"><div className="w-24 h-4 bg-border rounded" /></td>
                                        <td className="px-4 py-4"><div className="w-16 h-4 bg-border rounded" /></td>
                                        <td className="px-4 py-4"><div className="w-8 h-4 bg-border rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                                        No leads found. Try adjusting your filters.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <motion.tr
                                        key={lead.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-border hover:bg-surface-elevated/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        {/* Lead Info */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={lead.name} size="md" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground truncate">{lead.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted">
                                                        {lead.email && (
                                                            <span className="flex items-center gap-1 truncate">
                                                                <Mail size={12} />
                                                                {lead.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Source */}
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm">
                                                <span>{sourceIcons[lead.source] || "🔗"}</span>
                                                <span className="capitalize">{lead.source.replace("_", " ")}</span>
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            <StatusBadge status={lead.status} />
                                        </td>

                                        {/* Score */}
                                        <td className="px-4 py-4">
                                            <ScoreBadge score={lead.score} />
                                        </td>

                                        {/* Budget */}
                                        <td className="px-4 py-4 text-sm text-foreground">
                                            {lead.budget_min && lead.budget_max ? (
                                                <span>
                                                    {formatCurrency(Number(lead.budget_min))} - {formatCurrency(Number(lead.budget_max))}
                                                </span>
                                            ) : (
                                                <span className="text-muted">Not specified</span>
                                            )}
                                        </td>

                                        {/* Created */}
                                        <td className="px-4 py-4 text-sm text-muted">
                                            {formatRelativeTime(lead.created_at)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 rounded-lg hover:bg-surface-elevated text-muted hover:text-foreground transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLead(lead);
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-surface-elevated text-muted hover:text-foreground transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {(pagination?.last_page ?? 1) > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-sm text-muted">
                            Showing {(((pagination?.current_page ?? 1) - 1) * (filters.per_page || 15)) + 1} to{" "}
                            {Math.min((pagination?.current_page ?? 1) * (filters.per_page || 15), pagination?.total ?? 0)} of{" "}
                            {pagination?.total ?? 0} results
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => goToPage((pagination?.current_page ?? 1) - 1)}
                                disabled={(pagination?.current_page ?? 1) === 1}
                                leftIcon={<ChevronLeft size={16} />}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-foreground px-3">
                                Page {pagination?.current_page ?? 1} of {pagination?.last_page ?? 1}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => goToPage((pagination?.current_page ?? 1) + 1)}
                                disabled={(pagination?.current_page ?? 1) === (pagination?.last_page ?? 1)}
                                rightIcon={<ChevronRight size={16} />}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Lead Detail Slide-over (placeholder) */}
            <AnimatePresence>
                {selectedLead && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setSelectedLead(null)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 h-screen w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-foreground">Lead Details</h2>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="p-2 rounded-lg hover:bg-surface-elevated text-muted hover:text-foreground"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Lead Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar name={selectedLead.name} size="xl" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">{selectedLead.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={selectedLead.status} />
                                            <ScoreBadge score={selectedLead.score} />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <Card className="mb-4">
                                    <h4 className="font-medium text-foreground mb-3">Contact Information</h4>
                                    <div className="space-y-2 text-sm">
                                        {selectedLead.email && (
                                            <div className="flex items-center gap-2 text-muted">
                                                <Mail size={14} />
                                                <a href={`mailto:${selectedLead.email}`} className="text-brand hover:underline">
                                                    {selectedLead.email}
                                                </a>
                                            </div>
                                        )}
                                        {selectedLead.phone && (
                                            <div className="flex items-center gap-2 text-muted">
                                                <Phone size={14} />
                                                <a href={`tel:${selectedLead.phone}`} className="text-brand hover:underline">
                                                    {selectedLead.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Details */}
                                <Card className="mb-4">
                                    <h4 className="font-medium text-foreground mb-3">Lead Details</h4>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted">Source</dt>
                                            <dd className="text-foreground capitalize">{selectedLead.source.replace("_", " ")}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted">Intent</dt>
                                            <dd className="text-foreground capitalize">{selectedLead.intent?.replace("_", " ") || "Not specified"}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted">Budget</dt>
                                            <dd className="text-foreground">
                                                {selectedLead.budget_min && selectedLead.budget_max
                                                    ? `${formatCurrency(Number(selectedLead.budget_min))} - ${formatCurrency(Number(selectedLead.budget_max))}`
                                                    : "Not specified"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted">Created</dt>
                                            <dd className="text-foreground">{new Date(selectedLead.created_at).toLocaleDateString()}</dd>
                                        </div>
                                    </dl>
                                </Card>

                                {/* Tags */}
                                {selectedLead.tags && selectedLead.tags.length > 0 && (
                                    <Card className="mb-4">
                                        <h4 className="font-medium text-foreground mb-3">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLead.tags.map((tag, i) => (
                                                <Badge key={i} variant="brand">{tag}</Badge>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {/* Notes */}
                                {selectedLead.notes && (
                                    <Card>
                                        <h4 className="font-medium text-foreground mb-3">Notes</h4>
                                        <p className="text-sm text-muted">{selectedLead.notes}</p>
                                    </Card>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </MainLayout>
    );
}
