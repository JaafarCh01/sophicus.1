"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/Header";
import { StatCard, StatCardSkeleton } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge, ScoreBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Users,
    Building2,
    TrendingUp,
    Clock,
    Plus,
    Mail,
    Phone,
    ArrowRight,
} from "lucide-react";

// Mock data for demonstration
const stats = [
    {
        title: "Total Leads",
        value: "1,234",
        change: 12.5,
        trend: "up" as const,
        icon: Users,
    },
    {
        title: "Active Properties",
        value: "89",
        change: 3.2,
        trend: "up" as const,
        icon: Building2,
    },
    {
        title: "Conversion Rate",
        value: "24.8%",
        change: 2.1,
        trend: "up" as const,
        icon: TrendingUp,
    },
    {
        title: "Avg. Response Time",
        value: "2.4h",
        change: -15,
        trend: "up" as const,
        icon: Clock,
    },
];

const recentLeads = [
    {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        source: "instagram",
        score: 85,
        status: "qualified",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: "2",
        name: "Michael Chen",
        email: "m.chen@company.com",
        source: "website",
        score: 72,
        status: "contacted",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: "3",
        name: "Emma Williams",
        email: "emma.w@gmail.com",
        source: "whatsapp",
        score: 91,
        status: "new",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
        id: "4",
        name: "David Martinez",
        email: "david.m@outlook.com",
        source: "referral",
        score: 68,
        status: "new",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
];

const featuredProperties = [
    {
        id: "1",
        title: "Beachfront Condo - Playa del Carmen",
        price: 450000,
        type: "condo",
        status: "available",
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400",
    },
    {
        id: "2",
        title: "Luxury Villa - Tulum",
        price: 1250000,
        type: "villa",
        status: "pending",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    },
    {
        id: "3",
        title: "Ocean View Penthouse - Cancun",
        price: 890000,
        type: "penthouse",
        status: "available",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
    return (
        <MainLayout title="Dashboard" subtitle="Welcome back, John">
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
                {/* Recent Leads */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card padding="none" className="overflow-hidden">
                        <CardHeader className="p-4 border-b border-border">
                            <CardTitle>Recent Leads</CardTitle>
                            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />}>
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {recentLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="p-4 flex items-center gap-4 hover:bg-surface-elevated transition-colors cursor-pointer"
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
                                                    {lead.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={lead.status} />
                                            <p className="text-xs text-muted mt-1">
                                                {formatRelativeTime(lead.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Featured Properties */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card padding="none" className="overflow-hidden">
                        <CardHeader className="p-4 border-b border-border">
                            <CardTitle>Featured Properties</CardTitle>
                            <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />}>
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {featuredProperties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="p-4 flex gap-3 hover:bg-surface-elevated transition-colors cursor-pointer"
                                    >
                                        <img
                                            src={property.image}
                                            alt={property.title}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm truncate">
                                                {property.title}
                                            </p>
                                            <p className="text-brand font-semibold">
                                                {formatCurrency(property.price)}
                                            </p>
                                            <StatusBadge status={property.status} size="sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
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
