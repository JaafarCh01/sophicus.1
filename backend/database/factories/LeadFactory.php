<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lead>
 */
class LeadFactory extends Factory
{
    protected $model = Lead::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $budgetMin = $this->faker->randomElement([100000, 200000, 300000, 500000, 750000]);

        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'source' => $this->faker->randomElement(Lead::SOURCES),
            'status' => $this->faker->randomElement(Lead::STATUSES),
            'intent' => $this->faker->randomElement(Lead::INTENTS),
            'score' => $this->faker->numberBetween(20, 95),
            'budget_min' => $budgetMin,
            'budget_max' => $budgetMin + $this->faker->randomElement([100000, 200000, 500000]),
            'currency' => 'USD',
            'preferences' => [
                'property_types' => $this->faker->randomElements(['condo', 'villa', 'house', 'penthouse'], 2),
                'locations' => $this->faker->randomElements(['Playa del Carmen', 'Tulum', 'Cancun', 'Puerto Aventuras'], 2),
                'bedrooms_min' => $this->faker->numberBetween(1, 2),
                'bedrooms_max' => $this->faker->numberBetween(3, 5),
                'timeline' => $this->faker->randomElement(['1-3 months', '3-6 months', '6-12 months']),
            ],
            'tags' => $this->faker->randomElements(['hot', 'investor', 'cash-buyer', 'returning', 'VIP'], 2),
            'notes' => $this->faker->optional(0.5)->sentence(),
            'last_interaction_at' => $this->faker->optional(0.7)->dateTimeBetween('-30 days'),
            'created_at' => $this->faker->dateTimeBetween('-60 days'),
        ];
    }

    /**
     * Hot lead state.
     */
    public function hot(): static
    {
        return $this->state(fn(array $attributes) => [
            'score' => $this->faker->numberBetween(80, 100),
            'status' => 'qualified',
            'tags' => ['hot', 'investor'],
        ]);
    }

    /**
     * Fresh/new lead state.
     */
    public function freshLead(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'new',
            'score' => $this->faker->numberBetween(30, 60),
            'last_interaction_at' => null,
        ]);
    }

    /**
     * Won lead state.
     */
    public function won(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'won',
            'score' => $this->faker->numberBetween(85, 100),
        ]);
    }
}
