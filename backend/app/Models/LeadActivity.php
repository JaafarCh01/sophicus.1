<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadActivity extends Model
{
    use HasUuids;

    protected $fillable = [
        'lead_id',
        'type',
        'title',
        'description',
        'metadata',
        'created_by_id',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public const TYPES = [
        'note',
        'email',
        'call',
        'meeting',
        'message',
        'status_change',
        'property_viewed',
        'score_update'
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
