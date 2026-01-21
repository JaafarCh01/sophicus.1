"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { leadApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    Zap,
    DollarSign,
    Target,
    Clock,
    User,
    Globe,
    RefreshCw,
    TrendingUp,
    Loader2,
} from "lucide-react";

interface ScoreBreakdownProps {
    leadId: string;
    currentScore: number;
    onScoreUpdate?: (newScore: number) => void;
}

interface ScoreComponent {
    score: number;
    max: number;
    label: string;
}

interface BreakdownData {
    total: number;
    components: {
        engagement: ScoreComponent;
        budget: ScoreComponent;
        intent: ScoreComponent;
        recency: ScoreComponent;
        completeness: ScoreComponent;
        source_quality: ScoreComponent;
    };
}

const componentIcons: Record<string, React.ReactNode> = {
    engagement: <Zap size={14} />,
    budget: <DollarSign size={14} />,
    intent: <Target size={14} />,
    recency: <Clock size={14} />,
    completeness: <User size={14} />,
    source_quality: <Globe size={14} />,
};

const componentColors: Record<string, string> = {
    engagement: "bg-brand",
    budget: "bg-success",
    intent: "bg-accent",
    recency: "bg-info",
    completeness: "bg-warning",
    source_quality: "bg-brand",
};

export function ScoreBreakdown({ leadId, currentScore, onScoreUpdate }: ScoreBreakdownProps) {
    const [breakdown, setBreakdown] = useState<BreakdownData | null>(null);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBreakdown = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await leadApi.getScoreBreakdown(leadId);
                setBreakdown(data);
            } catch (err) {
                console.error("Failed to fetch score breakdown:", err);
                setError("Failed to load score breakdown");
            } finally {
                setLoading(false);
            }
        };

        if (leadId) {
            fetchBreakdown();
        }
    }, [leadId]);

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            const result = await leadApi.recalculateScore(leadId);
            // Refetch breakdown
            const data = await leadApi.getScoreBreakdown(leadId);
            setBreakdown(data);
            onScoreUpdate?.(result.data.new_score);
        } catch (err) {
            console.error("Failed to recalculate score:", err);
        } finally {
            setRecalculating(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-brand" />
                    <h3 className="font-semibold text-foreground">Lead Score Analysis</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-muted" size={24} />
                </div>
            </Card>
        );
    }

    if (error || !breakdown) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-brand" />
                    <h3 className="font-semibold text-foreground">Lead Score Analysis</h3>
                </div>
                <p className="text-muted text-sm">{error || "No data available"}</p>
            </Card>
        );
    }

    const scoreColor =
        breakdown.total >= 70 ? "text-success" :
            breakdown.total >= 50 ? "text-warning" :
                breakdown.total >= 30 ? "text-accent" : "text-danger";

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand" />
                    <h3 className="font-semibold text-foreground">Lead Score Analysis</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw size={14} className={recalculating ? "animate-spin" : ""} />}
                    onClick={handleRecalculate}
                    disabled={recalculating}
                >
                    Recalculate
                </Button>
            </div>

            {/* Total Score */}
            <div className="text-center mb-6 pb-4 border-b border-border">
                <div className={cn("text-5xl font-bold", scoreColor)}>
                    {breakdown.total}
                </div>
                <div className="text-muted text-sm mt-1">out of 100</div>
            </div>

            {/* Score Components */}
            <div className="space-y-3">
                {Object.entries(breakdown.components).map(([key, component]) => (
                    <ScoreBar
                        key={key}
                        icon={componentIcons[key]}
                        label={component.label}
                        score={component.score}
                        max={component.max}
                        colorClass={componentColors[key]}
                    />
                ))}
            </div>

            {/* Score Legend */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success"></span> 70+ Hot
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-warning"></span> 50-69 Warm
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent"></span> 30-49 Cool
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-danger"></span> &lt;30 Cold
                    </span>
                </div>
            </div>
        </Card>
    );
}

function ScoreBar({
    icon,
    label,
    score,
    max,
    colorClass,
}: {
    icon: React.ReactNode;
    label: string;
    score: number;
    max: number;
    colorClass: string;
}) {
    const percentage = max > 0 ? (score / max) * 100 : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="text-muted w-5">{icon}</div>
            <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground">{label}</span>
                    <span className="text-muted">{score}/{max}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500", colorClass)}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
