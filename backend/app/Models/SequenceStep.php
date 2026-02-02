<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SequenceStep extends Model
{
    use HasUuids;

    protected $fillable = [
        'sequence_id',
        'order',
        'action_type',
        'action_config',
        'delay_hours',
        'is_active',
    ];

    protected $casts = [
        'action_config' => 'array',
        'is_active' => 'boolean',
    ];

    const ACTION_TYPES = [
        'send_message' => 'Generate and queue a message for the lead',
        'update_status' => 'Update the lead status',
        'wait' => 'Wait for a specified duration',
        'notify_agent' => 'Send notification to assigned agent',
        'add_tag' => 'Add a tag to the lead',
        'webhook' => 'Call an external webhook (n8n)',
    ];

    /**
     * Get the sequence this step belongs to.
     */
    public function sequence(): BelongsTo
    {
        return $this->belongsTo(Sequence::class);
    }

    /**
     * Get the next step in the sequence.
     */
    public function getNextStep(): ?SequenceStep
    {
        return SequenceStep::where('sequence_id', $this->sequence_id)
            ->where('order', '>', $this->order)
            ->where('is_active', true)
            ->orderBy('order')
            ->first();
    }
}
