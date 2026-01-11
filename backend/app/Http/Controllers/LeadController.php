<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadActivity;
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
}
