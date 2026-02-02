<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadActivity;

/**
 * LeadScoringService
 * 
 * Calculates a lead score (0-100) based on multiple factors:
 * - Engagement (activities, responses)
 * - Budget (higher budget = higher score)
 * - Intent (investor > end_buyer > renter)
 * - Recency (recent activity = higher score)
 * - Completeness (profile data filled)
 */
class LeadScoringService
{
    // Weight configuration for each scoring factor
    private const WEIGHTS = [
        'engagement' => 25,      // 25 points max
        'budget' => 20,          // 20 points max
        'intent' => 15,          // 15 points max
        'recency' => 20,         // 20 points max
        'completeness' => 10,    // 10 points max
        'source_quality' => 10,  // 10 points max
    ];

    // Source quality rankings
    private const SOURCE_SCORES = [
        'referral' => 10,
        'website' => 8,
        'whatsapp' => 7,
        'instagram' => 6,
        'facebook' => 5,
        'tiktok' => 4,
        'portal' => 3,
        'cold_outreach' => 2,
    ];

    // Intent value rankings
    private const INTENT_SCORES = [
        'investor' => 15,
        'end_buyer' => 12,
        'developer' => 10,
        'renter' => 5,
    ];

    /**
     * Calculate the lead score based on all factors.
     */
    public function calculate(Lead $lead): int
    {
        $score = 0;

        $score += $this->calculateEngagementScore($lead);
        $score += $this->calculateBudgetScore($lead);
        $score += $this->calculateIntentScore($lead);
        $score += $this->calculateRecencyScore($lead);
        $score += $this->calculateCompletenessScore($lead);
        $score += $this->calculateSourceScore($lead);

        return min(100, max(0, $score));
    }

    /**
     * Calculate and update the lead's score in the database.
     */
    public function updateScore(Lead $lead): Lead
    {
        $newScore = $this->calculate($lead);
        $oldScore = $lead->score;

        if ($newScore !== $oldScore) {
            $lead->update(['score' => $newScore]);

            // Log score change if significant (>10 points)
            if (abs($newScore - $oldScore) >= 10) {
                LeadActivity::create([
                    'lead_id' => $lead->id,
                    'type' => 'note',
                    'title' => 'Score updated',
                    'description' => "Lead score changed from {$oldScore} to {$newScore}",
                    'metadata' => [
                        'old_score' => $oldScore,
                        'new_score' => $newScore,
                        'change' => $newScore - $oldScore,
                    ],
                ]);
            }
        }

        return $lead->fresh();
    }

    /**
     * Get a breakdown of the score components.
     */
    public function getScoreBreakdown(Lead $lead): array
    {
        return [
            'total' => $this->calculate($lead),
            'components' => [
                'engagement' => [
                    'score' => $this->calculateEngagementScore($lead),
                    'max' => self::WEIGHTS['engagement'],
                    'label' => 'Engagement',
                ],
                'budget' => [
                    'score' => $this->calculateBudgetScore($lead),
                    'max' => self::WEIGHTS['budget'],
                    'label' => 'Budget',
                ],
                'intent' => [
                    'score' => $this->calculateIntentScore($lead),
                    'max' => self::WEIGHTS['intent'],
                    'label' => 'Intent',
                ],
                'recency' => [
                    'score' => $this->calculateRecencyScore($lead),
                    'max' => self::WEIGHTS['recency'],
                    'label' => 'Recency',
                ],
                'completeness' => [
                    'score' => $this->calculateCompletenessScore($lead),
                    'max' => self::WEIGHTS['completeness'],
                    'label' => 'Profile',
                ],
                'source_quality' => [
                    'score' => $this->calculateSourceScore($lead),
                    'max' => self::WEIGHTS['source_quality'],
                    'label' => 'Source',
                ],
            ],
        ];
    }

    /**
     * Engagement score based on activity count and types.
     */
    private function calculateEngagementScore(Lead $lead): int
    {
        $activities = $lead->activities()->count();

        if ($activities === 0)
            return 0;
        if ($activities >= 20)
            return self::WEIGHTS['engagement'];

        // Scale: 1 activity = 1.25 points, max 25 points at 20+ activities
        return min(self::WEIGHTS['engagement'], (int) ($activities * 1.25));
    }

    /**
     * Budget score - higher budgets get higher scores.
     */
    private function calculateBudgetScore(Lead $lead): int
    {
        $budget = $lead->budget_max ?? $lead->budget_min ?? 0;

        if ($budget === 0)
            return 0;

        // Score tiers based on USD budget
        if ($budget >= 1000000)
            return self::WEIGHTS['budget'];        // $1M+
        if ($budget >= 500000)
            return (int) (self::WEIGHTS['budget'] * 0.8);  // $500K+
        if ($budget >= 250000)
            return (int) (self::WEIGHTS['budget'] * 0.6);  // $250K+
        if ($budget >= 100000)
            return (int) (self::WEIGHTS['budget'] * 0.4);  // $100K+
        if ($budget >= 50000)
            return (int) (self::WEIGHTS['budget'] * 0.2);   // $50K+

        return (int) (self::WEIGHTS['budget'] * 0.1);
    }

    /**
     * Intent score - investors and buyers score higher.
     */
    private function calculateIntentScore(Lead $lead): int
    {
        if (!$lead->intent)
            return 0;

        return self::INTENT_SCORES[$lead->intent] ?? 0;
    }

    /**
     * Recency score - recent interactions score higher.
     */
    private function calculateRecencyScore(Lead $lead): int
    {
        $lastInteraction = $lead->last_interaction_at ?? $lead->created_at;

        if (!$lastInteraction)
            return 0;

        $daysSinceInteraction = now()->diffInDays($lastInteraction);

        if ($daysSinceInteraction <= 1)
            return self::WEIGHTS['recency'];      // Today/yesterday
        if ($daysSinceInteraction <= 3)
            return (int) (self::WEIGHTS['recency'] * 0.8);  // 2-3 days
        if ($daysSinceInteraction <= 7)
            return (int) (self::WEIGHTS['recency'] * 0.6);  // Week
        if ($daysSinceInteraction <= 14)
            return (int) (self::WEIGHTS['recency'] * 0.4); // 2 weeks
        if ($daysSinceInteraction <= 30)
            return (int) (self::WEIGHTS['recency'] * 0.2); // Month

        return 0; // Stale lead
    }

    /**
     * Completeness score - more profile data = higher score.
     */
    private function calculateCompletenessScore(Lead $lead): int
    {
        $fields = [
            'name' => 1,
            'email' => 2,
            'phone' => 2,
            'intent' => 2,
            'budget_min' => 1,
            'budget_max' => 1,
            'preferences' => 1,
        ];

        $score = 0;
        foreach ($fields as $field => $points) {
            $value = $lead->$field;
            if ($field === 'preferences') {
                if (!empty($value) && is_array($value) && count($value) > 0) {
                    $score += $points;
                }
            } elseif (!empty($value)) {
                $score += $points;
            }
        }

        return min(self::WEIGHTS['completeness'], $score);
    }

    /**
     * Source quality score - referrals and website leads score higher.
     */
    private function calculateSourceScore(Lead $lead): int
    {
        return self::SOURCE_SCORES[$lead->source] ?? 0;
    }
}
