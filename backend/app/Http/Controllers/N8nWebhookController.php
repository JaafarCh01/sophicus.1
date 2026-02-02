<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Services\LeadScoringService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * N8nWebhookController
 * 
 * Handles incoming webhooks from n8n workflows for:
 * - Creating leads from external sources
 * - Updating lead status based on automation triggers
 * - Logging activities from automated workflows
 */
class N8nWebhookController extends Controller
{
    public function __construct(
        private LeadScoringService $scoringService
    ) {
    }

    /**
     * Create a new lead from n8n webhook (e.g., from Instagram, TikTok scrapers)
     */
    public function createLead(Request $request): JsonResponse
    {
        // Validate webhook secret
        if (!$this->validateWebhookSecret($request)) {
            Log::warning('N8n webhook: Invalid secret', ['ip' => $request->ip()]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'source' => 'required|string|max:50',
            'intent' => 'nullable|string|max:50',
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'preferences' => 'nullable|array',
            'external_id' => 'nullable|string|max:255', // For deduplication
            'workflow_id' => 'nullable|string|max:100',
        ]);

        // Check for duplicate by external_id or email
        if (!empty($validated['external_id'])) {
            $existing = Lead::where('notes', 'like', '%external_id:' . $validated['external_id'] . '%')->first();
            if ($existing) {
                Log::info('N8n webhook: Duplicate lead skipped', ['external_id' => $validated['external_id']]);
                return response()->json([
                    'message' => 'Lead already exists',
                    'data' => ['id' => $existing->id, 'duplicate' => true],
                ]);
            }
        }

        // Create lead
        $leadData = [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'source' => $this->mapSource($validated['source']),
            'intent' => $validated['intent'] ?? null,
            'budget_min' => $validated['budget_min'] ?? null,
            'budget_max' => $validated['budget_max'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'preferences' => $validated['preferences'] ?? [],
            'notes' => $this->buildNotes($validated),
            'status' => 'new',
        ];

        $lead = Lead::create($leadData);

        // Calculate initial score
        $this->scoringService->updateScore($lead);

        // Log creation activity
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'note',
            'title' => 'Lead created via automation',
            'description' => "Lead imported from {$validated['source']} via n8n workflow" .
                ($validated['workflow_id'] ? " (workflow: {$validated['workflow_id']})" : ''),
            'metadata' => [
                'source' => 'n8n_webhook',
                'workflow_id' => $validated['workflow_id'] ?? null,
            ],
        ]);

        Log::info('N8n webhook: Lead created', ['lead_id' => $lead->id, 'source' => $validated['source']]);

        return response()->json([
            'message' => 'Lead created successfully',
            'data' => [
                'id' => $lead->id,
                'score' => $lead->score,
            ],
        ], 201);
    }

    /**
     * Update lead status from n8n workflow
     */
    public function updateLeadStatus(Request $request, Lead $lead): JsonResponse
    {
        if (!$this->validateWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,qualified,negotiation,won,lost',
            'reason' => 'nullable|string|max:500',
            'workflow_id' => 'nullable|string|max:100',
        ]);

        $oldStatus = $lead->status;
        $lead->update(['status' => $validated['status']]);

        // Log status change
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'status_change',
            'title' => 'Status updated via automation',
            'description' => "Status changed from {$oldStatus} to {$validated['status']}" .
                ($validated['reason'] ? ". Reason: {$validated['reason']}" : ''),
            'metadata' => [
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
                'source' => 'n8n_webhook',
                'workflow_id' => $validated['workflow_id'] ?? null,
            ],
        ]);

        // Recalculate score
        $this->scoringService->updateScore($lead);

        return response()->json([
            'message' => 'Lead status updated',
            'data' => [
                'id' => $lead->id,
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
            ],
        ]);
    }

    /**
     * Log an activity from n8n workflow (e.g., message sent, property viewed)
     */
    public function logActivity(Request $request, Lead $lead): JsonResponse
    {
        if (!$this->validateWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'type' => 'required|in:note,email,call,message,property_viewed',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
            'workflow_id' => 'nullable|string|max:100',
        ]);

        $activity = LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'metadata' => array_merge($validated['metadata'] ?? [], [
                'source' => 'n8n_webhook',
                'workflow_id' => $validated['workflow_id'] ?? null,
            ]),
        ]);

        // Update last interaction
        $lead->touchInteraction();

        // Recalculate score
        $this->scoringService->updateScore($lead);

        return response()->json([
            'message' => 'Activity logged successfully',
            'data' => [
                'activity_id' => $activity->id,
                'lead_score' => $lead->fresh()->score,
            ],
        ]);
    }

    /**
     * Get leads for n8n to process (e.g., for follow-up sequences)
     */
    public function getLeadsForProcessing(Request $request): JsonResponse
    {
        if (!$this->validateWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'status' => 'nullable|string',
            'min_score' => 'nullable|integer|min:0|max:100',
            'days_since_contact' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Lead::query();

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['min_score'])) {
            $query->where('score', '>=', $validated['min_score']);
        }

        if (!empty($validated['days_since_contact'])) {
            $query->where('last_interaction_at', '<=', now()->subDays($validated['days_since_contact']));
        }

        $leads = $query
            ->orderBy('score', 'desc')
            ->limit($validated['limit'] ?? 50)
            ->get(['id', 'name', 'email', 'phone', 'status', 'score', 'intent', 'source', 'last_interaction_at']);

        return response()->json([
            'data' => $leads,
            'count' => $leads->count(),
        ]);
    }

    /**
     * Validate the webhook secret from request header
     */
    private function validateWebhookSecret(Request $request): bool
    {
        $secret = config('services.n8n.webhook_secret', env('N8N_WEBHOOK_SECRET'));

        // If no secret configured, skip validation (dev mode)
        if (empty($secret)) {
            return true;
        }

        $providedSecret = $request->header('X-N8N-Webhook-Secret') ?? $request->input('_secret');

        return hash_equals($secret, $providedSecret ?? '');
    }

    /**
     * Map external source names to our source types
     */
    private function mapSource(string $source): string
    {
        $sourceMap = [
            'instagram' => 'instagram',
            'ig' => 'instagram',
            'tiktok' => 'tiktok',
            'tt' => 'tiktok',
            'facebook' => 'facebook',
            'fb' => 'facebook',
            'whatsapp' => 'whatsapp',
            'wa' => 'whatsapp',
            'website' => 'website',
            'web' => 'website',
            'referral' => 'referral',
            'portal' => 'portal',
        ];

        return $sourceMap[strtolower($source)] ?? 'cold_outreach';
    }

    /**
     * Build notes string with external metadata
     */
    private function buildNotes(array $data): string
    {
        $notes = $data['notes'] ?? '';

        if (!empty($data['external_id'])) {
            $notes .= ($notes ? "\n" : '') . "external_id:{$data['external_id']}";
        }

        if (!empty($data['workflow_id'])) {
            $notes .= ($notes ? "\n" : '') . "workflow:{$data['workflow_id']}";
        }

        return $notes;
    }
}
