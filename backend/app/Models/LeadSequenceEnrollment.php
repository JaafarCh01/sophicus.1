<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadSequenceEnrollment extends Model
{
    use HasUuids;

    protected $fillable = [
        'lead_id',
        'sequence_id',
        'current_step_id',
        'status',
        'enrolled_at',
        'next_action_at',
        'completed_at',
        'metadata',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'next_action_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    const STATUSES = [
        'active',     // Currently being processed
        'paused',     // Temporarily paused
        'completed',  // All steps completed
        'cancelled',  // Manually cancelled
    ];

    /**
     * Get the lead for this enrollment.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the sequence for this enrollment.
     */
    public function sequence(): BelongsTo
    {
        return $this->belongsTo(Sequence::class);
    }

    /**
     * Get the current step.
     */
    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(SequenceStep::class, 'current_step_id');
    }

    /**
     * Get execution logs for this enrollment.
     */
    public function executionLogs(): HasMany
    {
        return $this->hasMany(SequenceExecutionLog::class, 'enrollment_id');
    }

    /**
     * Scope to get active enrollments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get enrollments ready for processing.
     */
    public function scopeReadyToProcess($query)
    {
        return $query->active()
            ->where('next_action_at', '<=', now());
    }

    /**
     * Advance to the next step.
     */
    public function advanceToNextStep(): bool
    {
        $currentStep = $this->currentStep;

        if (!$currentStep) {
            // First step
            $nextStep = $this->sequence->steps()->where('is_active', true)->first();
        } else {
            $nextStep = $currentStep->getNextStep();
        }

        if (!$nextStep) {
            // No more steps, complete the sequence
            $this->update([
                'status' => 'completed',
                'completed_at' => now(),
                'next_action_at' => null,
            ]);
            return false;
        }

        $this->update([
            'current_step_id' => $nextStep->id,
            'next_action_at' => now()->addHours($nextStep->delay_hours),
        ]);

        return true;
    }
}
