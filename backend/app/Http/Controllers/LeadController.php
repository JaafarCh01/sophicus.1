<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    /**
     * Display a listing of leads with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lead::query()
            ->with('assignedAgent:id,name,email');

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->status($request->status);
        }

        // Source filter
        if ($request->filled('source')) {
            $query->source($request->source);
        }

        // Intent filter
        if ($request->filled('intent')) {
            $query->where('intent', $request->intent);
        }

        // Score range filter
        if ($request->filled('min_score')) {
            $query->where('score', '>=', $request->min_score);
        }

        // Assigned agent filter
        if ($request->filled('assigned_agent_id')) {
            $query->where('assigned_agent_id', $request->assigned_agent_id);
        }

        // Date range filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $leads = $query->paginate($perPage);

        return response()->json($leads);
    }

    /**
     * Store a newly created lead.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'source' => ['required', Rule::in(Lead::SOURCES)],
            'status' => ['sometimes', Rule::in(Lead::STATUSES)],
            'intent' => ['nullable', Rule::in(Lead::INTENTS)],
            'score' => 'sometimes|integer|min:0|max:100',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'preferences' => 'nullable|array',
            'assigned_agent_id' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $lead = Lead::create($validated);

        // Log the creation activity
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'note',
            'title' => 'Lead created',
            'description' => "Lead was created via {$lead->source}",
            'created_by_id' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Lead created successfully',
            'data' => $lead->load('assignedAgent:id,name,email'),
        ], 201);
    }

    /**
     * Display the specified lead with activities.
     */
    public function show(Lead $lead): JsonResponse
    {
        $lead->load([
            'assignedAgent:id,name,email',
            'activities' => fn($q) => $q->with('createdBy:id,name')->limit(50),
        ]);

        return response()->json([
            'data' => $lead,
        ]);
    }

    /**
     * Update the specified lead.
     */
    public function update(Request $request, Lead $lead): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'source' => ['sometimes', Rule::in(Lead::SOURCES)],
            'status' => ['sometimes', Rule::in(Lead::STATUSES)],
            'intent' => ['nullable', Rule::in(Lead::INTENTS)],
            'score' => 'sometimes|integer|min:0|max:100',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'preferences' => 'nullable|array',
            'assigned_agent_id' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        // Track status changes
        $oldStatus = $lead->status;

        $lead->update($validated);

        // Log status change if it happened
        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'status_change',
                'title' => 'Status changed',
                'description' => "Status changed from {$oldStatus} to {$validated['status']}",
                'metadata' => [
                    'old_status' => $oldStatus,
                    'new_status' => $validated['status'],
                ],
                'created_by_id' => $request->user()?->id,
            ]);
        }

        $lead->touchInteraction();

        return response()->json([
            'message' => 'Lead updated successfully',
            'data' => $lead->fresh(['assignedAgent:id,name,email']),
        ]);
    }

    /**
     * Remove the specified lead (soft delete).
     */
    public function destroy(Lead $lead): JsonResponse
    {
        $lead->delete();

        return response()->json([
            'message' => 'Lead deleted successfully',
        ]);
    }

    /**
     * Add a note/activity to a lead.
     */
    public function addActivity(Request $request, Lead $lead): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(LeadActivity::TYPES)],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $activity = $lead->activities()->create([
            ...$validated,
            'created_by_id' => $request->user()?->id,
        ]);

        $lead->touchInteraction();

        return response()->json([
            'message' => 'Activity added successfully',
            'data' => $activity->load('createdBy:id,name'),
        ], 201);
    }

    /**
     * Get lead statistics for dashboard.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Lead::count(),
            'new' => Lead::status('new')->count(),
            'contacted' => Lead::status('contacted')->count(),
            'qualified' => Lead::status('qualified')->count(),
            'negotiation' => Lead::status('negotiation')->count(),
            'won' => Lead::status('won')->count(),
            'lost' => Lead::status('lost')->count(),
            'hot_leads' => Lead::hot()->count(),
            'this_month' => Lead::whereMonth('created_at', now()->month)->count(),
            'by_source' => Lead::selectRaw('source, count(*) as count')
                ->groupBy('source')
                ->pluck('count', 'source'),
        ];

        return response()->json(['data' => $stats]);
    }

    /**
     * Get matched properties for a lead based on their preferences.
     */
    public function matchProperties(Lead $lead): JsonResponse
    {
        $query = Property::query()->active();

        $preferences = $lead->preferences ?? [];

        // Budget matching - use wider range if lead has preferences
        if ($lead->budget_min || $lead->budget_max) {
            if ($lead->budget_min && $lead->budget_max) {
                // Allow 20% flexibility in budget
                $min = $lead->budget_min * 0.8;
                $max = $lead->budget_max * 1.2;
                $query->whereBetween('price', [$min, $max]);
            } elseif ($lead->budget_min) {
                $query->where('price', '>=', $lead->budget_min * 0.8);
            } elseif ($lead->budget_max) {
                $query->where('price', '<=', $lead->budget_max * 1.2);
            }
        }

        // Intent-based filtering
        if ($lead->intent === 'investor') {
            $query->where(function ($q) {
                $q->where('listing_type', 'presale')
                    ->orWhereNotNull('expected_roi');
            });
        } elseif ($lead->intent === 'renter') {
            $query->where('listing_type', 'rent');
        }

        // Get properties
        $properties = $query
            ->with('agent:id,name')
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate match score for each property
        $properties = $properties->map(function ($property) use ($lead, $preferences) {
            $score = 0;
            $maxScore = 100;
            $matchReasons = [];

            // Budget match (30 points)
            if ($lead->budget_min || $lead->budget_max) {
                $withinBudget = true;
                if ($lead->budget_min && $property->price < $lead->budget_min) {
                    $withinBudget = false;
                }
                if ($lead->budget_max && $property->price > $lead->budget_max) {
                    $withinBudget = false;
                }
                if ($withinBudget) {
                    $score += 30;
                    $matchReasons[] = 'Within budget';
                } elseif ($lead->budget_max && $property->price <= $lead->budget_max * 1.2) {
                    $score += 15;
                    $matchReasons[] = 'Close to budget';
                }
            } else {
                $score += 15; // Partial if no budget specified
            }

            // Bedrooms match (20 points)
            if (!empty($preferences['bedrooms_min']) && $property->bedrooms) {
                if ($property->bedrooms >= $preferences['bedrooms_min']) {
                    $score += 20;
                    $matchReasons[] = "{$property->bedrooms} bedrooms";
                }
            } else {
                $score += 10;
            }

            // Property type match (20 points)
            if (!empty($preferences['property_types']) && is_array($preferences['property_types'])) {
                if (in_array($property->property_type, $preferences['property_types'])) {
                    $score += 20;
                    $matchReasons[] = ucfirst($property->property_type);
                }
            } else {
                $score += 10;
            }

            // Location match (20 points)
            if (!empty($preferences['locations']) && is_array($preferences['locations'])) {
                foreach ($preferences['locations'] as $location) {
                    if (
                        stripos($property->city, $location) !== false ||
                        stripos($property->zone ?? '', $location) !== false
                    ) {
                        $score += 20;
                        $matchReasons[] = $property->city;
                        break;
                    }
                }
            } else {
                $score += 10;
            }

            // Intent match (10 points)
            if ($lead->intent === 'investor' && ($property->listing_type === 'presale' || $property->expected_roi)) {
                $score += 10;
                if ($property->expected_roi) {
                    $matchReasons[] = "ROI: {$property->expected_roi}%";
                }
            } elseif ($lead->intent === 'renter' && $property->listing_type === 'rent') {
                $score += 10;
                $matchReasons[] = 'For rent';
            } elseif ($lead->intent === 'end_buyer' && $property->listing_type === 'sale') {
                $score += 10;
                $matchReasons[] = 'For sale';
            } else {
                $score += 5;
            }

            if ($property->is_featured) {
                $matchReasons[] = 'Featured';
            }

            $property->match_score = $score;
            $property->match_reasons = $matchReasons;

            return $property;
        });

        // Sort by match score
        $properties = $properties->sortByDesc('match_score')->values();

        return response()->json([
            'data' => $properties,
            'lead_preferences' => [
                'budget_min' => $lead->budget_min,
                'budget_max' => $lead->budget_max,
                'intent' => $lead->intent,
                'preferences' => $preferences,
            ],
        ]);
    }
}
