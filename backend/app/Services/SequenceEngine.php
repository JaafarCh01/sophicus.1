<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Sequence;
use App\Models\SequenceStep;
use App\Models\LeadSequenceEnrollment;
use Illuminate\Support\Facades\Log;

/**
 * SequenceEngine
 * 
 * Handles sequence enrollment, step execution, and progression.
 */
class SequenceEngine
{
    public function __construct(
        private AIMessageService $aiMessageService,
        private LeadScoringService $scoringService
    ) {
    }

    /**
     * Enroll a lead in a sequence.
     */
    public function enrollLead(Lead $lead, Sequence $sequence): ?LeadSequenceEnrollment
    {
        // Check if already enrolled
        $existing = LeadSequenceEnrollment::where('lead_id', $lead->id)
            ->where('sequence_id', $sequence->id)
            ->whereIn('status', ['active', 'paused'])
            ->first();

        if ($existing) {
            Log::info('Lead already enrolled in sequence', [
                'lead_id' => $lead->id,
                'sequence_id' => $sequence->id,
            ]);
            return null;
        }

        // Check trigger conditions
        if (!$sequence->matchesTriggerConditions($lead)) {
            Log::info('Lead does not match sequence conditions', [
                'lead_id' => $lead->id,
                'sequence_id' => $sequence->id,
            ]);
            return null;
        }

        // Get first step
        $firstStep = $sequence->steps()->where('is_active', true)->first();

        if (!$firstStep) {
            Log::warning('Sequence has no active steps', ['sequence_id' => $sequence->id]);
            return null;
        }

        // Create enrollment
        $enrollment = LeadSequenceEnrollment::create([
            'lead_id' => $lead->id,
            'sequence_id' => $sequence->id,
            'current_step_id' => $firstStep->id,
            'status' => 'active',
            'enrolled_at' => now(),
            'next_action_at' => now()->addHours($firstStep->delay_hours),
        ]);

        // Log activity
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'note',
            'title' => 'Enrolled in sequence',
            'description' => "Lead enrolled in automation sequence: {$sequence->name}",
            'metadata' => [
                'sequence_id' => $sequence->id,
                'sequence_name' => $sequence->name,
            ],
        ]);

        Log::info('Lead enrolled in sequence', [
            'lead_id' => $lead->id,
            'sequence_id' => $sequence->id,
            'first_action_at' => $enrollment->next_action_at,
        ]);

        return $enrollment;
    }

    /**
     * Process all ready enrollments.
     */
    public function processReadyEnrollments(): array
    {
        $results = [
            'processed' => 0,
            'success' => 0,
            'failed' => 0,
            'completed' => 0,
        ];

        $enrollments = LeadSequenceEnrollment::readyToProcess()
            ->with(['lead', 'sequence', 'currentStep'])
            ->limit(100)
            ->get();

        foreach ($enrollments as $enrollment) {
            $results['processed']++;

            try {
                $executed = $this->executeStep($enrollment);

                if ($executed) {
                    $results['success']++;
                }

                // Advance to next step
                $hasNext = $enrollment->advanceToNextStep();

                if (!$hasNext) {
                    $results['completed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error('Sequence step execution failed', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $results;
    }

    /**
     * Execute a single step.
     */
    public function executeStep(LeadSequenceEnrollment $enrollment): bool
    {
        $step = $enrollment->currentStep;
        $lead = $enrollment->lead;

        if (!$step || !$lead) {
            return false;
        }

        $config = $step->action_config;

        switch ($step->action_type) {
            case 'send_message':
                return $this->executeSendMessage($lead, $config);

            case 'update_status':
                return $this->executeUpdateStatus($lead, $config);

            case 'notify_agent':
                return $this->executeNotifyAgent($lead, $config);

            case 'add_tag':
                return $this->executeAddTag($lead, $config);

            case 'wait':
                // Wait is implicit via delay_hours
                return true;

            case 'webhook':
                return $this->executeWebhook($lead, $config);

            default:
                Log::warning('Unknown action type', ['action_type' => $step->action_type]);
                return false;
        }
    }

    /**
     * Execute send_message action.
     */
    private function executeSendMessage(Lead $lead, array $config): bool
    {
        $type = $config['message_type'] ?? 'follow_up';
        $language = $config['language'] ?? 'english';
        $tone = $config['tone'] ?? 'friendly';

        $result = $this->aiMessageService->generateFollowUp($lead, '', [
            'language' => $language,
            'tone' => $tone,
        ]);

        if ($result['success']) {
            // Log the generated message
            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'message',
                'title' => 'Automated message generated',
                'description' => $result['message'],
                'metadata' => [
                    'source' => 'sequence',
                    'message_type' => $type,
                ],
            ]);
            return true;
        }

        return false;
    }

    /**
     * Execute update_status action.
     */
    private function executeUpdateStatus(Lead $lead, array $config): bool
    {
        $newStatus = $config['status'] ?? null;

        if (!$newStatus) {
            return false;
        }

        $oldStatus = $lead->status;
        $lead->update(['status' => $newStatus]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'status_change',
            'title' => 'Status updated by automation',
            'description' => "Status changed from {$oldStatus} to {$newStatus}",
            'metadata' => [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'source' => 'sequence',
            ],
        ]);

        return true;
    }

    /**
     * Execute notify_agent action.
     */
    private function executeNotifyAgent(Lead $lead, array $config): bool
    {
        // In a real implementation, this would send a notification
        // For now, we just log it as an activity
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'note',
            'title' => 'Agent notification',
            'description' => $config['message'] ?? 'Review this lead for follow-up',
            'metadata' => [
                'source' => 'sequence',
                'notification_type' => 'agent_alert',
            ],
        ]);

        return true;
    }

    /**
     * Execute add_tag action.
     */
    private function executeAddTag(Lead $lead, array $config): bool
    {
        $tag = $config['tag'] ?? null;

        if (!$tag) {
            return false;
        }

        $tags = $lead->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $lead->update(['tags' => $tags]);
        }

        return true;
    }

    /**
     * Execute webhook action.
     */
    private function executeWebhook(Lead $lead, array $config): bool
    {
        $url = $config['url'] ?? null;

        if (!$url) {
            return false;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::post($url, [
                'lead_id' => $lead->id,
                'lead_name' => $lead->name,
                'lead_email' => $lead->email,
                'lead_phone' => $lead->phone,
                'lead_status' => $lead->status,
                'lead_score' => $lead->score,
                'timestamp' => now()->toIso8601String(),
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Webhook execution failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Auto-enroll leads in matching sequences based on trigger type.
     */
    public function autoEnrollForTrigger(Lead $lead, string $triggerType): array
    {
        $enrolled = [];

        $sequences = Sequence::active()
            ->where('trigger_type', $triggerType)
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($sequences as $sequence) {
            $enrollment = $this->enrollLead($lead, $sequence);
            if ($enrollment) {
                $enrolled[] = $sequence->name;
            }
        }

        return $enrolled;
    }
}
