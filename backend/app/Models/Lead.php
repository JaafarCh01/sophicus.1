<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'source',
        'status',
        'intent',
        'score',
        'budget_min',
        'budget_max',
        'currency',
        'preferences',
        'assigned_agent_id',
        'tags',
        'notes',
        'last_interaction_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'tags' => 'array',
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'score' => 'integer',
            'last_interaction_at' => 'datetime',
        ];
    }

    /**
     * Status options for validation.
     */
    public const STATUSES = [
        'new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'
    ];

    /**
     * Source options for validation.
     */
    public const SOURCES = [
        'whatsapp', 'instagram', 'tiktok', 'facebook',
        'website', 'referral', 'portal', 'cold_outreach'
    ];

    /**
     * Intent options for validation.
     */
    public const INTENTS = [
        'investor', 'end_buyer', 'renter', 'developer'
    ];

    /**
     * Get the assigned agent.
     */
    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }

    /**
     * Get the lead activities.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class)->orderByDesc('created_at');
    }

    /**
     * Scope for filtering by status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by source.
     */
    public function scopeSource($query, string $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Scope for high-score leads.
     */
    public function scopeHot($query, int $minScore = 70)
    {
        return $query->where('score', '>=', $minScore);
    }

    /**
     * Scope for searching by name, email, or phone.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%");
        });
    }

    /**
     * Update last interaction timestamp.
     */
    public function touchInteraction(): void
    {
        $this->update(['last_interaction_at' => now()]);
    }
}
