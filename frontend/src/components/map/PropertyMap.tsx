"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Property } from "@/types";
import { formatCurrency } from "@/lib/utils";

// Default to Riviera Maya center
const DEFAULT_CENTER: [number, number] = [-87.0739, 20.6296];
const DEFAULT_ZOOM = 10;

interface PropertyMapProps {
    properties: Property[];
    onPropertyClick?: (property: Property) => void;
    selectedPropertyId?: string;
    className?: string;
}

export function PropertyMap({
    properties,
    onPropertyClick,
    selectedPropertyId,
    className = "",
}: PropertyMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Get Mapbox token from environment
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        if (!token) {
            console.warn("Mapbox token not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local");
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            setMapLoaded(true);
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Add/update markers when properties change
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clear existing markers
        markers.current.forEach((marker) => marker.remove());
        markers.current = [];

        // Filter properties with valid coordinates
        const propertiesWithCoords = properties.filter(
            (p) => p.latitude && p.longitude
        );

        if (propertiesWithCoords.length === 0) return;

        // Add markers for each property
        propertiesWithCoords.forEach((property) => {
            if (!property.latitude || !property.longitude) return;

            // Create custom marker element
            const el = document.createElement("div");
            el.className = "property-marker";
            el.innerHTML = `
        <div class="marker-pin ${property.id === selectedPropertyId ? "selected" : ""} ${property.is_featured ? "featured" : ""}">
          <span class="marker-price">${formatPrice(property.price)}</span>
        </div>
      `;

            // Create popup
            const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                maxWidth: "300px",
            }).setHTML(`
        <div class="map-popup">
          ${property.images?.[0] ? `<img src="${property.images[0]}" alt="${property.title}" class="popup-image" />` : ""}
          <div class="popup-content">
            <h3 class="popup-title">${property.title}</h3>
            <p class="popup-location">${property.zone ? property.zone + ", " : ""}${property.city}</p>
            <div class="popup-details">
              ${property.bedrooms ? `<span>${property.bedrooms} beds</span>` : ""}
              ${property.bathrooms ? `<span>${property.bathrooms} baths</span>` : ""}
              ${property.sqm_built ? `<span>${property.sqm_built}m²</span>` : ""}
            </div>
            <p class="popup-price">${formatCurrency(property.price)}</p>
          </div>
        </div>
      `);

            // Create marker
            const marker = new mapboxgl.Marker(el)
                .setLngLat([property.longitude, property.latitude])
                .setPopup(popup)
                .addTo(map.current!);

            // Handle click
            el.addEventListener("click", () => {
                onPropertyClick?.(property);
            });

            markers.current.push(marker);
        });

        // Fit bounds to show all markers
        if (propertiesWithCoords.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            propertiesWithCoords.forEach((p) => {
                if (p.latitude && p.longitude) {
                    bounds.extend([p.longitude, p.latitude]);
                }
            });
            map.current.fitBounds(bounds, { padding: 50 });
        } else if (propertiesWithCoords.length === 1) {
            const p = propertiesWithCoords[0];
            if (p.latitude && p.longitude) {
                map.current.flyTo({
                    center: [p.longitude, p.latitude],
                    zoom: 14,
                });
            }
        }
    }, [properties, mapLoaded, selectedPropertyId, onPropertyClick]);

    // Format price for marker
    function formatPrice(price: number): string {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `$${(price / 1000).toFixed(0)}K`;
        }
        return `$${price}`;
    }

    return (
        <div className={`relative ${className}`}>
            <div ref={mapContainer} className="w-full h-full rounded-lg" />

            {/* Mapbox token warning */}
            {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface rounded-lg border border-border">
                    <div className="text-center p-6">
                        <p className="text-muted mb-2">Mapbox token not configured</p>
                        <p className="text-sm text-muted">
                            Add <code className="bg-surface-elevated px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your .env.local file
                        </p>
                    </div>
                </div>
            )}

            {/* Map styles */}
            <style jsx global>{`
        .property-marker {
          cursor: pointer;
        }
        
        .marker-pin {
          background: #6366f1;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s, background 0.2s;
        }
        
        .marker-pin:hover {
          transform: scale(1.1);
        }
        
        .marker-pin.selected {
          background: #f97316;
          transform: scale(1.15);
        }
        
        .marker-pin.featured {
          background: linear-gradient(135deg, #6366f1, #f97316);
        }
        
        .mapboxgl-popup-content {
          background: #16161a;
          border: 1px solid #2d2d32;
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
        }
        
        .mapboxgl-popup-tip {
          border-top-color: #16161a;
        }
        
        .map-popup {
          width: 240px;
        }
        
        .popup-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }
        
        .popup-content {
          padding: 12px;
        }
        
        .popup-title {
          font-size: 14px;
          font-weight: 600;
          color: #ededed;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }
        
        .popup-location {
          font-size: 12px;
          color: #9ca3af;
          margin: 0 0 8px 0;
        }
        
        .popup-details {
          display: flex;
          gap: 8px;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 8px;
        }
        
        .popup-price {
          font-size: 16px;
          font-weight: 700;
          color: #6366f1;
          margin: 0;
        }
      `}</style>
        </div>
    );
}
