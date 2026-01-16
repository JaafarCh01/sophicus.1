"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Modal, ModalInput, ModalSelect, ModalTextarea, ModalButton, ModalRow, SlideOver } from "@/components/ui/Modal";
import { propertyApi, type PropertyFilters } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import type { Property } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    Plus,
    Grid3X3,
    List,
    MapPin,
    Map,
    Bed,
    Bath,
    Square,
    Building2,
    Home,
    ChevronLeft,
    ChevronRight,
    Heart,
    Star,
    X,
    Eye,
    Edit,
    Trash2,
    ExternalLink,
} from "lucide-react";
import Image from "next/image";

// Dynamic import for map component (SSR disabled)
const PropertyMap = dynamic(() => import("@/components/map/PropertyMap").then(mod => mod.PropertyMap), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-surface-elevated rounded-lg animate-pulse" />,
});

// Property type icons
const propertyTypeIcons: Record<string, React.ReactNode> = {
    condo: <Building2 size={16} />,
    villa: <Home size={16} />,
    house: <Home size={16} />,
    penthouse: <Building2 size={16} />,
    land: <Square size={16} />,
    commercial: <Building2 size={16} />,
    hotel: <Building2 size={16} />,
    development: <Building2 size={16} />,
};

// Status badge colors
const statusColors: Record<string, string> = {
    active: "bg-success/15 text-success",
    pending: "bg-warning/15 text-warning",
    sold: "bg-danger/15 text-danger",
    rented: "bg-info/15 text-info",
    off_market: "bg-muted/30 text-muted",
};

// Listing type badge colors
const listingTypeColors: Record<string, string> = {
    sale: "bg-brand/15 text-brand",
    rent: "bg-accent/15 text-accent",
    presale: "bg-info/15 text-info",
};

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, unknown>>({});
    const [filters, setFilters] = useState<PropertyFilters>({
        per_page: 12,
        page: 1,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProperty, setNewProperty] = useState({
        title: "",
        property_type: "condo",
        listing_type: "sale",
        price: "",
        city: "Playa del Carmen",
        zone: "",
        bedrooms: "",
        bathrooms: "",
        sqm_built: "",
        description: "",
    });
    const [creating, setCreating] = useState(false);

    // Fetch properties
    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const response = await propertyApi.getProperties(filters);
            setProperties(response.data);
            setPagination(response.meta);
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const data = await propertyApi.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
        fetchStats();
    }, [fetchProperties, fetchStats]);

    // Handle search
    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    // Handle filter change
    const updateFilter = (key: keyof PropertyFilters, value: string | number | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    // Handle pagination
    const goToPage = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({ per_page: 12, page: 1 });
        setShowFilters(false);
    };

    // Create new property
    const handleCreateProperty = async () => {
        if (!newProperty.title.trim() || !newProperty.price) return;

        setCreating(true);
        try {
            await propertyApi.createProperty({
                title: newProperty.title,
                property_type: newProperty.property_type as Property["property_type"],
                listing_type: newProperty.listing_type as Property["listing_type"],
                price: parseFloat(newProperty.price),
                city: newProperty.city,
                zone: newProperty.zone || undefined,
                bedrooms: newProperty.bedrooms ? parseInt(newProperty.bedrooms) : undefined,
                bathrooms: newProperty.bathrooms ? parseInt(newProperty.bathrooms) : undefined,
                sqm_built: newProperty.sqm_built ? parseInt(newProperty.sqm_built) : undefined,
                description: newProperty.description || undefined,
            });
            setShowAddModal(false);
            setNewProperty({
                title: "",
                property_type: "condo",
                listing_type: "sale",
                price: "",
                city: "Playa del Carmen",
                zone: "",
                bedrooms: "",
                bathrooms: "",
                sqm_built: "",
                description: "",
            });
            fetchProperties();
            fetchStats();
        } catch (error) {
            console.error("Failed to create property:", error);
        } finally {
            setCreating(false);
        }
    };

    // Delete property
    const handleDeleteProperty = async (property: Property) => {
        if (!confirm(`Are you sure you want to delete "${property.title}"?`)) return;

        try {
            await propertyApi.deleteProperty(property.id);
            fetchProperties();
            fetchStats();
            if (selectedProperty?.id === property.id) {
                setSelectedProperty(null);
            }
        } catch (error) {
            console.error("Failed to delete property:", error);
        }
    };

    return (
        <MainLayout title="Properties" subtitle={`${pagination?.total ?? 0} total properties`} showSearch>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Properties" value={typeof stats.total === 'number' ? stats.total : 0} icon={Building2} />
                <StatCard title="For Sale" value={typeof stats.for_sale === 'number' ? stats.for_sale : 0} icon={Home} />
                <StatCard title="Pre-Sale" value={typeof stats.presale === 'number' ? stats.presale : 0} icon={Star} />
                <StatCard title="Featured" value={typeof stats.featured === 'number' ? stats.featured : 0} icon={Heart} />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search properties..."
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

                    {/* View Mode Toggle */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-2 transition-colors",
                                viewMode === "grid" ? "bg-brand text-white" : "text-muted hover:text-foreground"
                            )}
                            title="Grid View"
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-2 transition-colors",
                                viewMode === "list" ? "bg-brand text-white" : "text-muted hover:text-foreground"
                            )}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={cn(
                                "p-2 transition-colors",
                                viewMode === "map" ? "bg-brand text-white" : "text-muted hover:text-foreground"
                            )}
                            title="Map View"
                        >
                            <Map size={18} />
                        </button>
                    </div>

                    {/* Active filters indicator */}
                    {(filters.property_type || filters.listing_type || filters.city) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear filters <X size={14} className="ml-1" />
                        </Button>
                    )}
                </div>

                <Button leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
                    Add Property
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
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <Select
                                    label="Type"
                                    value={filters.property_type || ""}
                                    onChange={(e) => updateFilter("property_type", e.target.value || undefined)}
                                >
                                    <option value="">All Types</option>
                                    <option value="condo">Condo</option>
                                    <option value="villa">Villa</option>
                                    <option value="house">House</option>
                                    <option value="penthouse">Penthouse</option>
                                    <option value="land">Land</option>
                                    <option value="commercial">Commercial</option>
                                </Select>

                                <Select
                                    label="Listing"
                                    value={filters.listing_type || ""}
                                    onChange={(e) => updateFilter("listing_type", e.target.value || undefined)}
                                >
                                    <option value="">All Listings</option>
                                    <option value="sale">For Sale</option>
                                    <option value="rent">For Rent</option>
                                    <option value="presale">Pre-Sale</option>
                                </Select>

                                <Select
                                    label="City"
                                    value={filters.city || ""}
                                    onChange={(e) => updateFilter("city", e.target.value || undefined)}
                                >
                                    <option value="">All Cities</option>
                                    <option value="Playa del Carmen">Playa del Carmen</option>
                                    <option value="Tulum">Tulum</option>
                                    <option value="Cancun">Cancun</option>
                                    <option value="Puerto Aventuras">Puerto Aventuras</option>
                                </Select>

                                <Select
                                    label="Bedrooms"
                                    value={filters.bedrooms?.toString() || ""}
                                    onChange={(e) => updateFilter("bedrooms", e.target.value ? Number(e.target.value) : undefined)}
                                >
                                    <option value="">Any Beds</option>
                                    <option value="1">1+</option>
                                    <option value="2">2+</option>
                                    <option value="3">3+</option>
                                    <option value="4">4+</option>
                                </Select>

                                <Select
                                    label="Status"
                                    value={filters.status || ""}
                                    onChange={(e) => updateFilter("status", e.target.value || undefined)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="sold">Sold</option>
                                </Select>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Properties Grid/List/Map */}
            {loading ? (
                <div className={cn(
                    viewMode === "map" ? "h-[600px] bg-surface-elevated rounded-lg animate-pulse" : "grid gap-6",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
                    viewMode === "list" ? "grid-cols-1" : ""
                )}>
                    {viewMode !== "map" && Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-[4/3] bg-border rounded-t-lg" />
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-border rounded w-3/4" />
                                <div className="h-4 bg-border rounded w-1/2" />
                                <div className="h-4 bg-border rounded w-1/4" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : properties.length === 0 ? (
                <Card className="py-12 text-center">
                    <Building2 size={48} className="mx-auto text-muted mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No properties found</h3>
                    <p className="text-muted mb-4">Try adjusting your filters or add a new property.</p>
                    <Button onClick={() => setShowAddModal(true)} leftIcon={<Plus size={16} />}>
                        Add Property
                    </Button>
                </Card>
            ) : viewMode === "map" ? (
                <div className="h-[600px] rounded-lg overflow-hidden border border-border">
                    <PropertyMap
                        properties={properties}
                        onPropertyClick={(property) => setSelectedProperty(property)}
                        selectedPropertyId={selectedProperty?.id}
                        className="w-full h-full"
                    />
                </div>
            ) : (
                <div className={cn(
                    "grid gap-6",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            viewMode={viewMode}
                            onView={() => setSelectedProperty(property)}
                            onDelete={() => handleDeleteProperty(property)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {(pagination?.last_page ?? 1) > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted">
                        Page {pagination?.current_page ?? 1} of {pagination?.last_page ?? 1} ({pagination?.total ?? 0} properties)
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

            {/* Add Property Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Property"
                description="Enter the property details below."
                size="2xl"
            >
                <div>
                    <ModalInput
                        label="Title *"
                        placeholder="e.g. Luxury Condo in Playacar"
                        value={newProperty.title}
                        onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                    />
                    <ModalRow>
                        <ModalSelect
                            label="Type"
                            value={newProperty.property_type}
                            onChange={(e) => setNewProperty({ ...newProperty, property_type: e.target.value })}
                        >
                            <option value="condo">Condo</option>
                            <option value="villa">Villa</option>
                            <option value="house">House</option>
                            <option value="penthouse">Penthouse</option>
                            <option value="land">Land</option>
                            <option value="commercial">Commercial</option>
                        </ModalSelect>
                        <ModalSelect
                            label="Listing"
                            value={newProperty.listing_type}
                            onChange={(e) => setNewProperty({ ...newProperty, listing_type: e.target.value })}
                        >
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                            <option value="presale">Pre-Sale</option>
                        </ModalSelect>
                    </ModalRow>
                    <ModalRow cols={3}>
                        <ModalInput
                            label="Price (USD) *"
                            type="number"
                            placeholder="350000"
                            value={newProperty.price}
                            onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                        />
                        <ModalSelect
                            label="City"
                            value={newProperty.city}
                            onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                        >
                            <option value="Playa del Carmen">Playa del Carmen</option>
                            <option value="Tulum">Tulum</option>
                            <option value="Cancun">Cancun</option>
                            <option value="Puerto Aventuras">Puerto Aventuras</option>
                        </ModalSelect>
                        <ModalInput
                            label="Zone"
                            placeholder="e.g. Playacar"
                            value={newProperty.zone}
                            onChange={(e) => setNewProperty({ ...newProperty, zone: e.target.value })}
                        />
                    </ModalRow>
                    <ModalRow cols={3}>
                        <ModalInput
                            label="Bedrooms"
                            type="number"
                            placeholder="2"
                            value={newProperty.bedrooms}
                            onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                        />
                        <ModalInput
                            label="Bathrooms"
                            type="number"
                            placeholder="2"
                            value={newProperty.bathrooms}
                            onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                        />
                        <ModalInput
                            label="Size (sqm)"
                            type="number"
                            placeholder="120"
                            value={newProperty.sqm_built}
                            onChange={(e) => setNewProperty({ ...newProperty, sqm_built: e.target.value })}
                        />
                    </ModalRow>
                    <ModalTextarea
                        label="Description"
                        placeholder="Describe the property..."
                        value={newProperty.description}
                        onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid #2d2d32" }}>
                        <ModalButton variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </ModalButton>
                        <ModalButton
                            onClick={handleCreateProperty}
                            disabled={!newProperty.title.trim() || !newProperty.price || creating}
                        >
                            {creating ? "Creating..." : "Create Property"}
                        </ModalButton>
                    </div>
                </div>
            </Modal>

            {/* Property Detail SlideOver */}
            <SlideOver
                isOpen={!!selectedProperty}
                onClose={() => setSelectedProperty(null)}
                title="Property Details"
                width="xl"
            >
                {selectedProperty && <PropertyDetail property={selectedProperty} />}
            </SlideOver>
        </MainLayout>
    );
}

// Property Card Component
function PropertyCard({
    property,
    viewMode,
    onView,
    onDelete,
}: {
    property: Property;
    viewMode: "grid" | "list" | "map";
    onView: () => void;
    onDelete: () => void;
}) {
    const primaryImage = property.images?.[0] || "/placeholder-property.jpg";

    if (viewMode === "list") {
        return (
            <Card className="flex overflow-hidden hover:border-brand/50 transition-colors cursor-pointer" onClick={onView}>
                <div className="w-48 h-32 relative flex-shrink-0">
                    <Image
                        src={primaryImage}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="192px"
                    />
                    {property.is_featured && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-accent text-white text-xs rounded-full flex items-center gap-1">
                            <Star size={10} /> Featured
                        </span>
                    )}
                </div>
                <div className="flex-1 p-4 flex justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground mb-1">{property.title}</h3>
                        <p className="text-sm text-muted flex items-center gap-1 mb-2">
                            <MapPin size={14} /> {property.zone ? `${property.zone}, ` : ""}{property.city}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted">
                            {property.bedrooms && (
                                <span className="flex items-center gap-1"><Bed size={14} /> {property.bedrooms}</span>
                            )}
                            {property.bathrooms && (
                                <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
                            )}
                            {property.sqm_built && (
                                <span className="flex items-center gap-1"><Square size={14} /> {property.sqm_built} m²</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-brand">{formatCurrency(property.price)}</p>
                        <div className="flex gap-2 mt-2">
                            <span className={cn("px-2 py-0.5 text-xs rounded-full capitalize", listingTypeColors[property.listing_type])}>
                                {property.listing_type}
                            </span>
                            <span className={cn("px-2 py-0.5 text-xs rounded-full capitalize", statusColors[property.status])}>
                                {property.status}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden hover:border-brand/50 transition-colors group" padding="none">
            <div className="aspect-[4/3] relative">
                <Image
                    src={primaryImage}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Overlays */}
                <div className="absolute top-2 left-2 flex gap-2">
                    {property.is_featured && (
                        <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full flex items-center gap-1">
                            <Star size={10} /> Featured
                        </span>
                    )}
                    {property.is_exclusive && (
                        <span className="px-2 py-0.5 bg-brand text-white text-xs rounded-full">
                            Exclusive
                        </span>
                    )}
                </div>
                <div className="absolute top-2 right-2">
                    <span className={cn("px-2 py-0.5 text-xs rounded-full capitalize", listingTypeColors[property.listing_type])}>
                        {property.listing_type === "presale" ? "Pre-Sale" : property.listing_type === "sale" ? "For Sale" : "For Rent"}
                    </span>
                </div>
                {/* Action buttons */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onView(); }}
                        className="p-2 bg-black/70 rounded-lg text-white hover:bg-black/90"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 bg-black/70 rounded-lg text-white hover:bg-danger"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            <div className="p-4 cursor-pointer" onClick={onView}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{property.title}</h3>
                    <span className={cn("px-2 py-0.5 text-xs rounded-full capitalize flex-shrink-0 ml-2", statusColors[property.status])}>
                        {property.status}
                    </span>
                </div>
                <p className="text-sm text-muted flex items-center gap-1 mb-3">
                    <MapPin size={14} /> {property.zone ? `${property.zone}, ` : ""}{property.city}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted mb-3">
                    <span className="flex items-center gap-1 capitalize">
                        {propertyTypeIcons[property.property_type]} {property.property_type}
                    </span>
                    {property.bedrooms && (
                        <span className="flex items-center gap-1"><Bed size={14} /> {property.bedrooms}</span>
                    )}
                    {property.bathrooms && (
                        <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
                    )}
                    {property.sqm_built && (
                        <span className="flex items-center gap-1"><Square size={14} /> {property.sqm_built}m²</span>
                    )}
                </div>
                <p className="text-xl font-bold text-brand">{formatCurrency(property.price)}</p>
            </div>
        </Card>
    );
}

// Property Detail Component
function PropertyDetail({ property }: { property: Property }) {
    return (
        <div className="space-y-6">
            {/* Image Gallery */}
            {property.images && property.images.length > 0 && (
                <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                </div>
            )}

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={cn("px-2 py-1 text-xs rounded-full capitalize", listingTypeColors[property.listing_type])}>
                        {property.listing_type}
                    </span>
                    <span className={cn("px-2 py-1 text-xs rounded-full capitalize", statusColors[property.status])}>
                        {property.status}
                    </span>
                    {property.is_featured && (
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full flex items-center gap-1">
                            <Star size={10} /> Featured
                        </span>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{property.title}</h2>
                <p className="text-muted flex items-center gap-1 mt-1">
                    <MapPin size={16} /> {property.address || `${property.zone ? property.zone + ", " : ""}${property.city}, ${property.state}`}
                </p>
                <p className="text-3xl font-bold text-brand mt-4">{formatCurrency(property.price)}</p>
            </div>

            {/* Specs */}
            <Card>
                <h3 className="font-semibold text-foreground mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted">Type</span>
                        <span className="text-foreground capitalize">{property.property_type}</span>
                    </div>
                    {property.bedrooms && (
                        <div className="flex justify-between">
                            <span className="text-muted">Bedrooms</span>
                            <span className="text-foreground">{property.bedrooms}</span>
                        </div>
                    )}
                    {property.bathrooms && (
                        <div className="flex justify-between">
                            <span className="text-muted">Bathrooms</span>
                            <span className="text-foreground">{property.bathrooms}</span>
                        </div>
                    )}
                    {property.sqm_built && (
                        <div className="flex justify-between">
                            <span className="text-muted">Built Area</span>
                            <span className="text-foreground">{property.sqm_built} m²</span>
                        </div>
                    )}
                    {property.sqm_land && (
                        <div className="flex justify-between">
                            <span className="text-muted">Land Area</span>
                            <span className="text-foreground">{property.sqm_land} m²</span>
                        </div>
                    )}
                    {property.year_built && (
                        <div className="flex justify-between">
                            <span className="text-muted">Year Built</span>
                            <span className="text-foreground">{property.year_built}</span>
                        </div>
                    )}
                    {property.parking_spaces !== null && property.parking_spaces !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted">Parking</span>
                            <span className="text-foreground">{property.parking_spaces} spaces</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Features */}
            {property.features && property.features.length > 0 && (
                <Card>
                    <h3 className="font-semibold text-foreground mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                        {property.features.map((feature, i) => (
                            <Badge key={i} variant="default">{feature.replace("_", " ")}</Badge>
                        ))}
                    </div>
                </Card>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
                <Card>
                    <h3 className="font-semibold text-foreground mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity, i) => (
                            <Badge key={i} variant="brand">{amenity.replace("_", " ")}</Badge>
                        ))}
                    </div>
                </Card>
            )}

            {/* Description */}
            {property.description && (
                <Card>
                    <h3 className="font-semibold text-foreground mb-3">Description</h3>
                    <p className="text-muted text-sm whitespace-pre-wrap">{property.description}</p>
                </Card>
            )}

            {/* Pre-sale Info */}
            {property.listing_type === "presale" && (
                <Card className="border-brand/50">
                    <h3 className="font-semibold text-foreground mb-3">Investment Info</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {property.developer && (
                            <div className="flex justify-between">
                                <span className="text-muted">Developer</span>
                                <span className="text-foreground">{property.developer}</span>
                            </div>
                        )}
                        {property.delivery_date && (
                            <div className="flex justify-between">
                                <span className="text-muted">Delivery</span>
                                <span className="text-foreground">{property.delivery_date}</span>
                            </div>
                        )}
                        {property.expected_roi && (
                            <div className="flex justify-between">
                                <span className="text-muted">Expected ROI</span>
                                <span className="text-success font-semibold">{property.expected_roi}%</span>
                            </div>
                        )}
                        {property.construction_progress !== null && property.construction_progress !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted">Progress</span>
                                <span className="text-foreground">{property.construction_progress}%</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
