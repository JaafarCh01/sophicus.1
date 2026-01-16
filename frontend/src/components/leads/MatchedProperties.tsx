"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { leadApi } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import type { Property } from "@/types";
import {
    Sparkles,
    MapPin,
    Bed,
    Bath,
    Square,
    ExternalLink,
    ChevronRight,
    Loader2,
    Building2,
} from "lucide-react";
import Image from "next/image";

interface MatchedPropertiesProps {
    leadId: string;
    onViewProperty?: (property: Property) => void;
}

interface MatchedProperty extends Property {
    match_score: number;
    match_reasons: string[];
}

export function MatchedProperties({ leadId, onViewProperty }: MatchedPropertiesProps) {
    const [properties, setProperties] = useState<MatchedProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await leadApi.getMatchedProperties(leadId);
                setProperties(response.data || []);
            } catch (err) {
                console.error("Failed to fetch matched properties:", err);
                setError("Failed to load property matches");
            } finally {
                setLoading(false);
            }
        };

        if (leadId) {
            fetchMatches();
        }
    }, [leadId]);

    if (loading) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-accent" />
                    <h3 className="font-semibold text-foreground">AI Property Matches</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-muted" size={24} />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-accent" />
                    <h3 className="font-semibold text-foreground">AI Property Matches</h3>
                </div>
                <p className="text-muted text-sm">{error}</p>
            </Card>
        );
    }

    if (properties.length === 0) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-accent" />
                    <h3 className="font-semibold text-foreground">AI Property Matches</h3>
                </div>
                <div className="text-center py-6">
                    <Building2 size={32} className="mx-auto text-muted mb-2" />
                    <p className="text-muted text-sm">No matching properties found</p>
                    <p className="text-muted text-xs mt-1">Try updating the lead's preferences or budget</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-accent" />
                    <h3 className="font-semibold text-foreground">AI Property Matches</h3>
                    <Badge variant="brand">{properties.length} found</Badge>
                </div>
            </div>

            <div className="space-y-3">
                {properties.slice(0, 5).map((property) => (
                    <MatchedPropertyCard
                        key={property.id}
                        property={property}
                        onView={() => onViewProperty?.(property)}
                    />
                ))}
            </div>

            {properties.length > 5 && (
                <div className="mt-4 pt-4 border-t border-border text-center">
                    <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
                        View all {properties.length} matches
                    </Button>
                </div>
            )}
        </Card>
    );
}

function MatchedPropertyCard({
    property,
    onView,
}: {
    property: MatchedProperty;
    onView: () => void;
}) {
    const primaryImage = property.images?.[0];
    const scoreColor =
        property.match_score >= 70
            ? "text-success"
            : property.match_score >= 50
                ? "text-warning"
                : "text-muted";

    return (
        <div
            className={cn(
                "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                "bg-surface-elevated border border-border hover:border-brand/50"
            )}
            onClick={onView}
        >
            {/* Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-border relative">
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={24} className="text-muted" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">
                        {property.title}
                    </h4>
                    <div className={cn("text-lg font-bold flex-shrink-0", scoreColor)}>
                        {property.match_score}%
                    </div>
                </div>

                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {property.zone ? `${property.zone}, ` : ""}{property.city}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted mt-1">
                    {property.bedrooms && (
                        <span className="flex items-center gap-0.5">
                            <Bed size={10} /> {property.bedrooms}
                        </span>
                    )}
                    {property.bathrooms && (
                        <span className="flex items-center gap-0.5">
                            <Bath size={10} /> {property.bathrooms}
                        </span>
                    )}
                    {property.sqm_built && (
                        <span className="flex items-center gap-0.5">
                            <Square size={10} /> {property.sqm_built}m²
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-brand font-bold text-sm">
                        {formatCurrency(property.price)}
                    </span>
                    <div className="flex gap-1 flex-wrap justify-end">
                        {property.match_reasons.slice(0, 2).map((reason, i) => (
                            <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 bg-brand/10 text-brand rounded"
                            >
                                {reason}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
