<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyMedia extends Model
{
    use HasUuids;

    protected $table = 'property_media';

    protected $fillable = [
        'property_id',
        'type',
        'url',
        'thumbnail_url',
        'title',
        'order',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'order' => 'integer',
        ];
    }

    public const TYPES = ['image', 'video', 'floor_plan', 'document'];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
