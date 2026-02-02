<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sequence extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'trigger_type',
        'trigger_conditions',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'trigger_conditions' => 'array',
        'is_active' => 'boolean',
    ];

    const TRIGGER_TYPES = [
        'new_lead',        // Triggered when a new lead is created
        'status_change',   // Triggered when lead status changes
        'inactivity',      // Triggered after X days of no activity
        'scheduled',       // Runs on a schedule
        'manual',          // Manually enrolled
    ];

    /**
     * Get the steps for this sequence.
     */
    public function steps(): HasMany
    {
        return $this->hasMany(SequenceStep::class)->orderBy('order');
    }

    /**
     * Get enrollments for this sequence.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(LeadSequenceEnrollment::class);
    }

    /**
     * Scope to get only active sequences.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if a lead matches the trigger conditions.
     */
    public function matchesTriggerConditions(Lead $lead): bool
    {
        if (empty($this->trigger_conditions)) {
            return true;
        }

        $conditions = $this->trigger_conditions;

        // Check source condition
        if (!empty($conditions['sources'])) {
            if (!in_array($lead->source, $conditions['sources'])) {
                return false;
            }
        }

        // Check intent condition
        if (!empty($conditions['intents'])) {
            if (!in_array($lead->intent, $conditions['intents'])) {
                return false;
            }
        }

        // Check minimum score
        if (!empty($conditions['min_score'])) {
            if ($lead->score < $conditions['min_score']) {
                return false;
            }
        }

        // Check status (for status_change triggers)
        if (!empty($conditions['statuses'])) {
            if (!in_array($lead->status, $conditions['statuses'])) {
                return false;
            }
        }

        return true;
    }
}
