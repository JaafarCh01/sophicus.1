<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'property_type',
        'listing_type',
        'price',
        'currency',
        'price_per_sqm',
        'address',
        'city',
        'zone',
        'state',
        'country',
        'latitude',
        'longitude',
        'bedrooms',
        'bathrooms',
        'sqm_built',
        'sqm_land',
        'parking_spaces',
        'floor',
        'total_floors',
        'year_built',
        'features',
        'amenities',
        'images',
        'video_url',
        'virtual_tour_url',
        'floor_plan_url',
        'expected_roi',
        'delivery_date',
        'developer',
        'construction_progress',
        'status',
        'is_featured',
        'is_exclusive',
        'agent_id',
        'slug',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'price_per_sqm' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'features' => 'array',
            'amenities' => 'array',
            'images' => 'array',
            'expected_roi' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_exclusive' => 'boolean',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'sqm_built' => 'integer',
            'sqm_land' => 'integer',
            'parking_spaces' => 'integer',
            'floor' => 'integer',
            'total_floors' => 'integer',
            'year_built' => 'integer',
            'construction_progress' => 'integer',
        ];
    }

    // Constants
    public const PROPERTY_TYPES = [
        'condo',
        'villa',
        'house',
        'penthouse',
        'land',
        'commercial',
        'hotel',
        'development'
    ];

    public const LISTING_TYPES = ['sale', 'rent', 'presale'];

    public const STATUSES = ['active', 'pending', 'sold', 'rented', 'off_market'];

    public const COMMON_FEATURES = [
        'pool',
        'garden',
        'ocean_view',
        'jungle_view',
        'rooftop',
        'terrace',
        'balcony',
        'jacuzzi',
        'bbq',
        'furnished'
    ];

    public const COMMON_AMENITIES = [
        'gym',
        'security_24h',
        'beach_club',
        'concierge',
        'spa',
        'restaurant',
        'coworking',
        'kids_area',
        'pet_friendly',
        'elevator'
    ];

    // Boot method to auto-generate slug
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($property) {
            if (!$property->slug) {
                $property->slug = Str::slug($property->title) . '-' . Str::random(6);
            }
        });
    }

    // Relationships
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(PropertyMedia::class)->orderBy('order');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeExclusive($query)
    {
        return $query->where('is_exclusive', true);
    }

    public function scopeType($query, string $type)
    {
        return $query->where('property_type', $type);
    }

    public function scopeListingType($query, string $type)
    {
        return $query->where('listing_type', $type);
    }

    public function scopePriceRange($query, ?float $min, ?float $max)
    {
        if ($min) {
            $query->where('price', '>=', $min);
        }
        if ($max) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    public function scopeBedrooms($query, int $min)
    {
        return $query->where('bedrooms', '>=', $min);
    }

    public function scopeCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")
                ->orWhere('zone', 'like', "%{$search}%");
        });
    }

    // Helpers
    public function getPrimaryImageAttribute(): ?string
    {
        if ($this->images && count($this->images) > 0) {
            return $this->images[0];
        }
        return null;
    }

    public function getFormattedPriceAttribute(): string
    {
        return '$' . number_format((float) $this->price, 0) . ' ' . $this->currency;
    }
}
