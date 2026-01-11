<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create demo users (agents)
        User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@sophicus.com',
        ]);

        User::factory()->create([
            'name' => 'Sarah Martinez',
            'email' => 'sarah@sophicus.com',
        ]);

        User::factory()->create([
            'name' => 'Miguel Rodriguez',
            'email' => 'miguel@sophicus.com',
        ]);

        // Create leads with various states
        Lead::factory(30)->create();
        Lead::factory(10)->hot()->create();
        Lead::factory(15)->freshLead()->create();
        Lead::factory(5)->won()->create();
    }
}
