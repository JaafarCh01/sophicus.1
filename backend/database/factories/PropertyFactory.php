<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $propertyType = $this->faker->randomElement(Property::PROPERTY_TYPES);
        $listingType = $this->faker->randomElement(Property::LISTING_TYPES);

        $basePrice = match ($propertyType) {
            'land' => $this->faker->numberBetween(50000, 500000),
            'condo' => $this->faker->numberBetween(150000, 800000),
            'villa' => $this->faker->numberBetween(500000, 3000000),
            'penthouse' => $this->faker->numberBetween(400000, 2000000),
            'house' => $this->faker->numberBetween(200000, 1500000),
            'commercial' => $this->faker->numberBetween(100000, 2000000),
            'hotel' => $this->faker->numberBetween(1000000, 10000000),
            'development' => $this->faker->numberBetween(2000000, 20000000),
            default => $this->faker->numberBetween(200000, 1000000),
        };

        $title = $this->generateTitle($propertyType);
        $sqmBuilt = $this->faker->numberBetween(50, 500);

        $cities = ['Playa del Carmen', 'Tulum', 'Cancun', 'Puerto Aventuras', 'Akumal'];
        $zones = ['Centro', 'Playacar', 'Aldea Zama', 'La Veleta', 'Colosio', 'Ejidal', 'Region 15'];

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::random(6),
            'description' => $this->faker->paragraphs(3, true),
            'property_type' => $propertyType,
            'listing_type' => $listingType,
            'price' => $basePrice,
            'currency' => 'USD',
            'price_per_sqm' => round($basePrice / $sqmBuilt, 2),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->randomElement($cities),
            'zone' => $this->faker->randomElement($zones),
            'state' => 'Quintana Roo',
            'country' => 'Mexico',
            'latitude' => $this->faker->latitude(20.1, 20.7),
            'longitude' => $this->faker->longitude(-87.5, -86.8),
            'bedrooms' => $propertyType !== 'land' ? $this->faker->numberBetween(1, 5) : null,
            'bathrooms' => $propertyType !== 'land' ? $this->faker->numberBetween(1, 4) : null,
            'sqm_built' => $propertyType !== 'land' ? $sqmBuilt : null,
            'sqm_land' => $this->faker->numberBetween(100, 1000),
            'parking_spaces' => $this->faker->numberBetween(0, 3),
            'floor' => $propertyType === 'condo' || $propertyType === 'penthouse' ? $this->faker->numberBetween(1, 20) : null,
            'total_floors' => $this->faker->numberBetween(3, 25),
            'year_built' => $listingType === 'presale' ? null : $this->faker->numberBetween(2018, 2025),
            'features' => $this->faker->randomElements(Property::COMMON_FEATURES, $this->faker->numberBetween(3, 6)),
            'amenities' => $this->faker->randomElements(Property::COMMON_AMENITIES, $this->faker->numberBetween(3, 6)),
            'images' => $this->generateImageUrls(),
            'video_url' => $this->faker->optional(0.3)->url(),
            'virtual_tour_url' => $this->faker->optional(0.2)->url(),
            'expected_roi' => $listingType === 'presale' ? $this->faker->randomFloat(2, 8, 15) : null,
            'delivery_date' => $listingType === 'presale' ? $this->faker->dateTimeBetween('+6 months', '+3 years')->format('Y-m') : null,
            'developer' => $listingType === 'presale' ? $this->faker->company() : null,
            'construction_progress' => $listingType === 'presale' ? $this->faker->numberBetween(0, 80) : null,
            'status' => $this->faker->randomElement(['active', 'active', 'active', 'pending', 'sold']),
            'is_featured' => $this->faker->boolean(20),
            'is_exclusive' => $this->faker->boolean(15),
            'created_at' => $this->faker->dateTimeBetween('-3 months'),
        ];
    }

    /**
     * Generate a realistic property title.
     */
    private function generateTitle(string $propertyType): string
    {
        $adjectives = ['Stunning', 'Luxury', 'Modern', 'Spacious', 'Elegant', 'Exclusive', 'Beautiful', 'Premium'];
        $adjective = $this->faker->randomElement($adjectives);

        $typeNames = [
            'condo' => 'Condo',
            'villa' => 'Villa',
            'house' => 'House',
            'penthouse' => 'Penthouse',
            'land' => 'Lot',
            'commercial' => 'Commercial Space',
            'hotel' => 'Boutique Hotel',
            'development' => 'Development Project',
        ];

        $typeName = $typeNames[$propertyType] ?? 'Property';
        $features = ['with Ocean View', 'in Gated Community', 'with Private Pool', 'Near Beach', 'with Rooftop', 'in Prime Location'];
        $feature = $this->faker->randomElement($features);

        return "{$adjective} {$typeName} {$feature}";
    }

    /**
     * Generate placeholder image URLs.
     */
    private function generateImageUrls(): array
    {
        $count = $this->faker->numberBetween(3, 8);
        $images = [];

        for ($i = 0; $i < $count; $i++) {
            // Using placeholder URLs - in production these would be Cloudinary URLs
            $images[] = "https://picsum.photos/seed/" . Str::random(8) . "/800/600";
        }

        return $images;
    }

    /**
     * Featured property state.
     */
    public function featured(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_featured' => true,
            'status' => 'active',
        ]);
    }

    /**
     * Presale property state.
     */
    public function presale(): static
    {
        return $this->state(fn(array $attributes) => [
            'listing_type' => 'presale',
            'expected_roi' => $this->faker->randomFloat(2, 10, 18),
            'delivery_date' => $this->faker->dateTimeBetween('+1 year', '+3 years')->format('Y-m'),
            'developer' => $this->faker->company(),
            'construction_progress' => $this->faker->numberBetween(10, 60),
            'year_built' => null,
        ]);
    }

    /**
     * Sold property state.
     */
    public function sold(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'sold',
        ]);
    }
}
