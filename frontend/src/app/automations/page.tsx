"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Play,
    Pause,
    Plus,
    Users,
    MessageSquare,
    Clock,
    Target,
    TrendingUp,
    Bell,
    Mail,
    Sparkles,
    ChevronRight,
    Settings,
    Copy,
    Check,
    AlertCircle,
} from "lucide-react";

// Pre-built automation templates
const automationTemplates = [
    {
        id: "new-lead-welcome",
        name: "New Lead Welcome",
        description: "Automatically welcome new leads with a personalized message",
        category: "onboarding",
        trigger: "New lead created",
        steps: [
            { action: "Send welcome message", delay: "Immediately" },
            { action: "Wait", delay: "24 hours" },
            { action: "Send follow-up if no response", delay: "After wait" },
        ],
        icon: Users,
        color: "bg-brand",
        popularity: 95,
    },
    {
        id: "investor-nurture",
        name: "Investor Nurture Sequence",
        description: "Nurture investor leads with ROI-focused content and property pitches",
        category: "nurturing",
        trigger: "Lead intent = investor",
        steps: [
            { action: "Send investment guide", delay: "Immediately" },
            { action: "Share top ROI properties", delay: "2 days" },
            { action: "Offer consultation call", delay: "5 days" },
        ],
        icon: TrendingUp,
        color: "bg-success",
        popularity: 88,
    },
    {
        id: "hot-lead-alert",
        name: "Hot Lead Alert",
        description: "Instantly notify agents when a high-score lead comes in",
        category: "alerts",
        trigger: "Lead score > 80",
        steps: [
            { action: "Send agent notification", delay: "Immediately" },
            { action: "Add priority tag", delay: "Immediately" },
            { action: "Create task for follow-up", delay: "Immediately" },
        ],
        icon: Bell,
        color: "bg-danger",
        popularity: 92,
    },
    {
        id: "stale-lead-revival",
        name: "Stale Lead Revival",
        description: "Re-engage leads that haven't been active in a while",
        category: "re-engagement",
        trigger: "No activity for 7 days",
        steps: [
            { action: "Send re-engagement message", delay: "Immediately" },
            { action: "Share new listings", delay: "3 days" },
            { action: "Mark as cold if no response", delay: "7 days" },
        ],
        icon: Clock,
        color: "bg-warning",
        popularity: 76,
    },
    {
        id: "viewing-reminder",
        name: "Property Viewing Reminder",
        description: "Send automated reminders before scheduled property viewings",
        category: "appointments",
        trigger: "Viewing scheduled",
        steps: [
            { action: "Confirm viewing details", delay: "Immediately" },
            { action: "Send reminder", delay: "24 hours before" },
            { action: "Day-of confirmation", delay: "2 hours before" },
        ],
        icon: Target,
        color: "bg-accent",
        popularity: 84,
    },
    {
        id: "post-viewing-followup",
        name: "Post-Viewing Follow-up",
        description: "Follow up with leads after they've viewed a property",
        category: "nurturing",
        trigger: "Viewing completed",
        steps: [
            { action: "Thank you message", delay: "2 hours" },
            { action: "Request feedback", delay: "1 day" },
            { action: "Share similar properties", delay: "3 days" },
        ],
        icon: MessageSquare,
        color: "bg-info",
        popularity: 81,
    },
];

// Active automations (mock data)
const activeAutomations = [
    {
        id: "1",
        name: "New Lead Welcome",
        templateId: "new-lead-welcome",
        status: "active",
        enrolled: 45,
        completed: 38,
        createdAt: "2026-01-15",
    },
    {
        id: "2",
        name: "Hot Lead Alert",
        templateId: "hot-lead-alert",
        status: "active",
        enrolled: 12,
        completed: 12,
        createdAt: "2026-01-10",
    },
    {
        id: "3",
        name: "Investor Nurture - Custom",
        templateId: "investor-nurture",
        status: "paused",
        enrolled: 8,
        completed: 3,
        createdAt: "2026-01-08",
    },
];

const categories = [
    { id: "all", name: "All Templates" },
    { id: "onboarding", name: "Onboarding" },
    { id: "nurturing", name: "Nurturing" },
    { id: "alerts", name: "Alerts" },
    { id: "re-engagement", name: "Re-engagement" },
    { id: "appointments", name: "Appointments" },
];

export default function AutomationsPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedTemplate, setSelectedTemplate] = useState<typeof automationTemplates[0] | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredTemplates = selectedCategory === "all"
        ? automationTemplates
        : automationTemplates.filter(t => t.category === selectedCategory);

    const handleUseTemplate = (template: typeof automationTemplates[0]) => {
        setCopiedId(template.id);
        setTimeout(() => setCopiedId(null), 2000);
        // In real implementation, this would create a new automation from template
    };

    return (
        <MainLayout
            title="Automations"
            subtitle="Automate your lead nurturing with pre-built sequences"
        >
            {/* Active Automations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Zap size={20} className="text-brand" />
                        Active Automations
                    </h2>
                    <Button leftIcon={<Plus size={16} />} size="sm">
                        Create Custom
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeAutomations.map((automation) => (
                        <Card key={automation.id} className="hover:border-brand/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-medium text-foreground">{automation.name}</h3>
                                    <p className="text-xs text-muted mt-0.5">
                                        Created {automation.createdAt}
                                    </p>
                                </div>
                                <Badge
                                    variant={automation.status === "active" ? "success" : "warning"}
                                >
                                    {automation.status}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted mb-4">
                                <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {automation.enrolled} enrolled
                                </span>
                                <span className="flex items-center gap-1">
                                    <Check size={14} />
                                    {automation.completed} completed
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    leftIcon={automation.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                                >
                                    {automation.status === "active" ? "Pause" : "Resume"}
                                </Button>
                                <Button variant="ghost" size="sm" leftIcon={<Settings size={14} />}>
                                    Edit
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {/* Empty state card */}
                    <Card className="border-dashed flex items-center justify-center min-h-[180px]">
                        <div className="text-center">
                            <Plus size={24} className="mx-auto text-muted mb-2" />
                            <p className="text-sm text-muted">Add Automation</p>
                        </div>
                    </Card>
                </div>
            </motion.div>

            {/* Template Library */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Template Library</h2>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                selectedCategory === category.id
                                    ? "bg-brand text-white"
                                    : "bg-surface-elevated text-muted hover:text-foreground"
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredTemplates.map((template) => (
                            <motion.div
                                key={template.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TemplateCard
                                    template={template}
                                    onUse={() => handleUseTemplate(template)}
                                    onPreview={() => setSelectedTemplate(template)}
                                    isCopied={copiedId === template.id}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Template Preview Modal */}
            <AnimatePresence>
                {selectedTemplate && (
                    <TemplatePreviewModal
                        template={selectedTemplate}
                        onClose={() => setSelectedTemplate(null)}
                        onUse={() => {
                            handleUseTemplate(selectedTemplate);
                            setSelectedTemplate(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </MainLayout>
    );
}

// Template Card Component
function TemplateCard({
    template,
    onUse,
    onPreview,
    isCopied,
}: {
    template: typeof automationTemplates[0];
    onUse: () => void;
    onPreview: () => void;
    isCopied: boolean;
}) {
    const Icon = template.icon;

    return (
        <Card className="hover:border-brand/50 transition-all hover:shadow-lg cursor-pointer group">
            <div onClick={onPreview}>
                <div className="flex items-start gap-3 mb-3">
                    <div className={cn("p-2 rounded-lg", template.color)}>
                        <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-foreground group-hover:text-brand transition-colors">
                            {template.name}
                        </h3>
                        <p className="text-xs text-muted mt-0.5">{template.trigger}</p>
                    </div>
                </div>

                <p className="text-sm text-muted mb-4 line-clamp-2">
                    {template.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                    {template.steps.slice(0, 2).map((step, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-surface rounded-full text-muted">
                            {step.action}
                        </span>
                    ))}
                    {template.steps.length > 2 && (
                        <span className="text-xs text-muted">+{template.steps.length - 2} more</span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted">
                    <TrendingUp size={12} />
                    {template.popularity}% use this
                </div>
                <Button
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onUse();
                    }}
                    leftIcon={isCopied ? <Check size={14} /> : <Copy size={14} />}
                >
                    {isCopied ? "Added!" : "Use Template"}
                </Button>
            </div>
        </Card>
    );
}

// Template Preview Modal
function TemplatePreviewModal({
    template,
    onClose,
    onUse,
}: {
    template: typeof automationTemplates[0];
    onClose: () => void;
    onUse: () => void;
}) {
    const Icon = template.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface-elevated rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={cn("p-6", template.color)}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Icon size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{template.name}</h2>
                            <p className="text-white/80 text-sm">{template.trigger}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-muted mb-6">{template.description}</p>

                    <h3 className="font-semibold text-foreground mb-4">Automation Steps</h3>
                    <div className="space-y-3">
                        {template.steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-surface rounded-lg"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-bold text-brand">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground text-sm">{step.action}</p>
                                    <p className="text-xs text-muted">{step.delay}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mt-6 p-3 bg-info/10 rounded-lg">
                        <AlertCircle size={16} className="text-info" />
                        <p className="text-sm text-info">You can customize all steps after adding this template.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onUse} leftIcon={<Plus size={16} />}>
                        Use This Template
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
