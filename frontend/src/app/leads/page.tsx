"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, ScoreBadge, Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Modal, SlideOver, ModalInput, ModalSelect, ModalTextarea, ModalButton, ModalRow } from "@/components/ui/Modal";
import { MatchedProperties, ScoreBreakdown, MessageGenerator } from "@/components/leads";
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
    Flame,
    ChevronLeft,
    ChevronRight,
    X,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    MessageSquare,
    Calendar,
    CheckCircle,
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
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLead, setNewLead] = useState({
        name: "",
        email: "",
        phone: "",
        source: "website",
        intent: "",
        notes: "",
    });
    const [creating, setCreating] = useState(false);

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

    // Create new lead
    const handleCreateLead = async () => {
        if (!newLead.name.trim()) return;

        setCreating(true);
        try {
            await leadApi.createLead({
                name: newLead.name,
                email: newLead.email || undefined,
                phone: newLead.phone || undefined,
                source: newLead.source as Lead["source"],
                intent: newLead.intent as Lead["intent"] || undefined,
                notes: newLead.notes || undefined,
            });
            setShowAddModal(false);
            setNewLead({ name: "", email: "", phone: "", source: "website", intent: "", notes: "" });
            fetchLeads();
            fetchStats();
        } catch (error) {
            console.error("Failed to create lead:", error);
        } finally {
            setCreating(false);
        }
    };

    // Update lead status
    const handleUpdateStatus = async (lead: Lead, newStatus: string) => {
        try {
            await leadApi.updateLead(lead.id, { status: newStatus as Lead["status"] });
            fetchLeads();
            if (selectedLead?.id === lead.id) {
                setSelectedLead({ ...selectedLead, status: newStatus as Lead["status"] });
            }
        } catch (error) {
            console.error("Failed to update lead:", error);
        }
    };

    // Delete lead
    const handleDeleteLead = async (lead: Lead) => {
        if (!confirm(`Are you sure you want to delete ${lead.name}?`)) return;

        try {
            await leadApi.deleteLead(lead.id);
            fetchLeads();
            fetchStats();
            if (selectedLead?.id === lead.id) {
                setSelectedLead(null);
            }
        } catch (error) {
            console.error("Failed to delete lead:", error);
        }
    };

    return (
        <MainLayout title="Leads" subtitle={`${pagination?.total ?? 0} total leads`} showSearch>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Leads" value={stats.total || 0} icon={Users} />
                <StatCard title="New This Month" value={stats.this_month || 0} icon={TrendingUp} />
                <StatCard title="Hot Leads" value={stats.hot_leads || 0} icon={Flame} />
                <StatCard title="Qualified" value={stats.qualified || 0} icon={CheckCircle} />
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

                <Button leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
                    Add Lead
                </Button>
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
                                <Select
                                    label="Status"
                                    value={filters.status || ""}
                                    onChange={(e) => updateFilter("status", e.target.value || undefined)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="negotiation">Negotiation</option>
                                    <option value="won">Won</option>
                                    <option value="lost">Lost</option>
                                </Select>

                                <Select
                                    label="Source"
                                    value={filters.source || ""}
                                    onChange={(e) => updateFilter("source", e.target.value || undefined)}
                                >
                                    <option value="">All Sources</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="website">Website</option>
                                    <option value="referral">Referral</option>
                                    <option value="portal">Portal</option>
                                </Select>

                                <Select
                                    label="Intent"
                                    value={filters.intent || ""}
                                    onChange={(e) => updateFilter("intent", e.target.value || undefined)}
                                >
                                    <option value="">All Intents</option>
                                    <option value="investor">Investor</option>
                                    <option value="end_buyer">End Buyer</option>
                                    <option value="renter">Renter</option>
                                    <option value="developer">Developer</option>
                                </Select>

                                <Select
                                    label="Min Score"
                                    value={filters.min_score?.toString() || ""}
                                    onChange={(e) => updateFilter("min_score", e.target.value ? Number(e.target.value) : undefined)}
                                >
                                    <option value="">Any Score</option>
                                    <option value="80">80+ (Hot)</option>
                                    <option value="60">60+</option>
                                    <option value="40">40+</option>
                                </Select>
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
                                        <td className="px-4 py-4"><div className="w-20 h-4 bg-border rounded ml-auto" /></td>
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
                                    <tr
                                        key={lead.id}
                                        className="border-b border-border hover:bg-surface-elevated/50 transition-colors"
                                    >
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
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm">
                                                <span>{sourceIcons[lead.source] || "🔗"}</span>
                                                <span className="capitalize">{lead.source.replace("_", " ")}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <ScoreBadge score={lead.score} />
                                        </td>
                                        <td className="px-4 py-4 text-sm text-foreground">
                                            {lead.budget_min && lead.budget_max ? (
                                                <span>
                                                    {formatCurrency(Number(lead.budget_min))} - {formatCurrency(Number(lead.budget_max))}
                                                </span>
                                            ) : (
                                                <span className="text-muted">Not specified</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-muted">
                                            {formatRelativeTime(lead.created_at)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    className="p-2 rounded-lg hover:bg-surface-elevated text-muted hover:text-foreground transition-colors"
                                                    onClick={() => setSelectedLead(lead)}
                                                    title="View details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg hover:bg-surface-elevated text-muted hover:text-brand transition-colors"
                                                    onClick={() => setSelectedLead(lead)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg hover:bg-surface-elevated text-muted hover:text-danger transition-colors"
                                                    onClick={() => handleDeleteLead(lead)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
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

            {/* Add Lead Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Lead"
                description="Enter the lead's information below."
                size="lg"
            >
                <div>
                    <ModalInput
                        label="Name *"
                        placeholder="Enter lead name"
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    />
                    <ModalRow>
                        <ModalInput
                            label="Email"
                            type="email"
                            placeholder="email@example.com"
                            value={newLead.email}
                            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                        />
                        <ModalInput
                            label="Phone"
                            placeholder="+1 234 567 8900"
                            value={newLead.phone}
                            onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        />
                    </ModalRow>
                    <ModalRow>
                        <ModalSelect
                            label="Source"
                            value={newLead.source}
                            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                        >
                            <option value="website">Website</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="facebook">Facebook</option>
                            <option value="referral">Referral</option>
                            <option value="portal">Portal</option>
                            <option value="cold_outreach">Cold Outreach</option>
                        </ModalSelect>
                        <ModalSelect
                            label="Intent"
                            value={newLead.intent}
                            onChange={(e) => setNewLead({ ...newLead, intent: e.target.value })}
                        >
                            <option value="">Select intent</option>
                            <option value="investor">Investor</option>
                            <option value="end_buyer">End Buyer</option>
                            <option value="renter">Renter</option>
                            <option value="developer">Developer</option>
                        </ModalSelect>
                    </ModalRow>
                    <ModalTextarea
                        label="Notes"
                        placeholder="Add any notes about this lead..."
                        value={newLead.notes}
                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid #2d2d32" }}>
                        <ModalButton variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </ModalButton>
                        <ModalButton
                            onClick={handleCreateLead}
                            disabled={!newLead.name.trim() || creating}
                        >
                            {creating ? "Creating..." : "Create Lead"}
                        </ModalButton>
                    </div>
                </div>
            </Modal>

            {/* Lead Detail SlideOver */}
            <SlideOver
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                title="Lead Details"
                width="lg"
            >
                {selectedLead && (
                    <div className="space-y-4">
                        {/* Lead Header */}
                        <div className="flex items-center gap-4 pb-4 border-b border-border">
                            <Avatar name={selectedLead.name} size="xl" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground">{selectedLead.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <StatusBadge status={selectedLead.status} />
                                    <ScoreBadge score={selectedLead.score} />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            {selectedLead.email && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={<Mail size={16} />}
                                    onClick={() => window.open(`mailto:${selectedLead.email}`)}
                                >
                                    Email
                                </Button>
                            )}
                            {selectedLead.phone && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={<Phone size={16} />}
                                    onClick={() => window.open(`tel:${selectedLead.phone}`)}
                                >
                                    Call
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<MessageSquare size={16} />}
                            >
                                Message
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Calendar size={16} />}
                            >
                                Schedule
                            </Button>
                        </div>

                        {/* Contact Info */}
                        <Card>
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

                        {/* Lead Details */}
                        <Card>
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

                        {/* Status Update */}
                        <Card>
                            <h4 className="font-medium text-foreground mb-3">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                                {["new", "contacted", "qualified", "negotiation", "won", "lost"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdateStatus(selectedLead, status)}
                                        className={cn(
                                            "px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize",
                                            selectedLead.status === status
                                                ? "bg-brand text-white border-brand"
                                                : "border-border text-muted hover:text-foreground hover:bg-surface-elevated"
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Tags */}
                        {selectedLead.tags && selectedLead.tags.length > 0 && (
                            <Card>
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

                        {/* Lead Score Analysis */}
                        <ScoreBreakdown leadId={selectedLead.id} currentScore={selectedLead.score} />

                        {/* AI Message Generator */}
                        <MessageGenerator leadId={selectedLead.id} leadName={selectedLead.name} />

                        {/* AI Property Matches */}
                        <MatchedProperties leadId={selectedLead.id} />

                        {/* Delete Button */}
                        <div className="pt-4 border-t border-border">
                            <Button
                                variant="danger"
                                size="sm"
                                leftIcon={<Trash2 size={16} />}
                                onClick={() => {
                                    handleDeleteLead(selectedLead);
                                }}
                            >
                                Delete Lead
                            </Button>
                        </div>
                    </div>
                )}
            </SlideOver>
        </MainLayout>
    );
}
