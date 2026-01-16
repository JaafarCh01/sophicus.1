<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class PropertyController extends Controller
{
    /**
     * Display a listing of properties with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Property::query()
            ->with('agent:id,name,email');

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Property type filter
        if ($request->filled('property_type')) {
            $query->type($request->property_type);
        }

        // Listing type filter
        if ($request->filled('listing_type')) {
            $query->listingType($request->listing_type);
        }

        // City filter
        if ($request->filled('city')) {
            $query->city($request->city);
        }

        // Zone filter
        if ($request->filled('zone')) {
            $query->where('zone', $request->zone);
        }

        // Price range
        if ($request->filled('price_min') || $request->filled('price_max')) {
            $query->priceRange($request->price_min, $request->price_max);
        }

        // Bedrooms filter
        if ($request->filled('bedrooms')) {
            $query->bedrooms($request->bedrooms);
        }

        // Bathrooms filter
        if ($request->filled('bathrooms')) {
            $query->where('bathrooms', '>=', $request->bathrooms);
        }

        // Featured filter
        if ($request->boolean('is_featured')) {
            $query->featured();
        }

        // Exclusive filter
        if ($request->boolean('is_exclusive')) {
            $query->exclusive();
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Validate sort field
        $allowedSortFields = ['created_at', 'price', 'bedrooms', 'sqm_built', 'title'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $perPage = min($request->get('per_page', 12), 50);
        $properties = $query->paginate($perPage);

        return response()->json($properties);
    }

    /**
     * Store a newly created property.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'property_type' => ['required', Rule::in(Property::PROPERTY_TYPES)],
            'listing_type' => ['required', Rule::in(Property::LISTING_TYPES)],
            'price' => 'required|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'price_per_sqm' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:255',
            'city' => 'sometimes|string|max:100',
            'zone' => 'nullable|string|max:100',
            'state' => 'sometimes|string|max:100',
            'country' => 'sometimes|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'bedrooms' => 'nullable|integer|min:0|max:50',
            'bathrooms' => 'nullable|integer|min:0|max:50',
            'sqm_built' => 'nullable|integer|min:0',
            'sqm_land' => 'nullable|integer|min:0',
            'parking_spaces' => 'nullable|integer|min:0|max:50',
            'floor' => 'nullable|integer|min:0',
            'total_floors' => 'nullable|integer|min:1',
            'year_built' => 'nullable|integer|min:1900|max:2100',
            'features' => 'nullable|array',
            'amenities' => 'nullable|array',
            'images' => 'nullable|array',
            'video_url' => 'nullable|url',
            'virtual_tour_url' => 'nullable|url',
            'floor_plan_url' => 'nullable|url',
            'expected_roi' => 'nullable|numeric|min:0|max:100',
            'delivery_date' => 'nullable|string|max:50',
            'developer' => 'nullable|string|max:255',
            'construction_progress' => 'nullable|integer|min:0|max:100',
            'status' => ['sometimes', Rule::in(Property::STATUSES)],
            'is_featured' => 'sometimes|boolean',
            'is_exclusive' => 'sometimes|boolean',
            'agent_id' => 'nullable|exists:users,id',
        ]);

        $property = Property::create($validated);

        return response()->json([
            'message' => 'Property created successfully',
            'data' => $property->load('agent:id,name,email'),
        ], 201);
    }

    /**
     * Display the specified property.
     */
    public function show(Property $property): JsonResponse
    {
        $property->load([
            'agent:id,name,email',
            'media',
        ]);

        return response()->json([
            'data' => $property,
        ]);
    }

    /**
     * Update the specified property.
     */
    public function update(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'property_type' => ['sometimes', Rule::in(Property::PROPERTY_TYPES)],
            'listing_type' => ['sometimes', Rule::in(Property::LISTING_TYPES)],
            'price' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'price_per_sqm' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:255',
            'city' => 'sometimes|string|max:100',
            'zone' => 'nullable|string|max:100',
            'state' => 'sometimes|string|max:100',
            'country' => 'sometimes|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'bedrooms' => 'nullable|integer|min:0|max:50',
            'bathrooms' => 'nullable|integer|min:0|max:50',
            'sqm_built' => 'nullable|integer|min:0',
            'sqm_land' => 'nullable|integer|min:0',
            'parking_spaces' => 'nullable|integer|min:0|max:50',
            'floor' => 'nullable|integer|min:0',
            'total_floors' => 'nullable|integer|min:1',
            'year_built' => 'nullable|integer|min:1900|max:2100',
            'features' => 'nullable|array',
            'amenities' => 'nullable|array',
            'images' => 'nullable|array',
            'video_url' => 'nullable|url',
            'virtual_tour_url' => 'nullable|url',
            'floor_plan_url' => 'nullable|url',
            'expected_roi' => 'nullable|numeric|min:0|max:100',
            'delivery_date' => 'nullable|string|max:50',
            'developer' => 'nullable|string|max:255',
            'construction_progress' => 'nullable|integer|min:0|max:100',
            'status' => ['sometimes', Rule::in(Property::STATUSES)],
            'is_featured' => 'sometimes|boolean',
            'is_exclusive' => 'sometimes|boolean',
            'agent_id' => 'nullable|exists:users,id',
        ]);

        $property->update($validated);

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property->fresh(['agent:id,name,email']),
        ]);
    }

    /**
     * Remove the specified property (soft delete).
     */
    public function destroy(Property $property): JsonResponse
    {
        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully',
        ]);
    }

    /**
     * Get property statistics for dashboard.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Property::count(),
            'active' => Property::active()->count(),
            'for_sale' => Property::listingType('sale')->active()->count(),
            'for_rent' => Property::listingType('rent')->active()->count(),
            'presale' => Property::listingType('presale')->active()->count(),
            'featured' => Property::featured()->count(),
            'by_type' => Property::selectRaw('property_type, count(*) as count')
                ->groupBy('property_type')
                ->pluck('count', 'property_type'),
            'by_city' => Property::selectRaw('city, count(*) as count')
                ->groupBy('city')
                ->pluck('count', 'city'),
            'avg_price' => Property::active()->avg('price'),
        ];

        return response()->json(['data' => $stats]);
    }

    /**
     * Get featured properties for homepage.
     */
    public function featured(): JsonResponse
    {
        $properties = Property::query()
            ->active()
            ->featured()
            ->with('agent:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        return response()->json(['data' => $properties]);
    }
}
