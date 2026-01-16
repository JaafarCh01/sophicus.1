<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Basic Info
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('property_type', [
                'condo',
                'villa',
                'house',
                'penthouse',
                'land',
                'commercial',
                'hotel',
                'development'
            ]);
            $table->enum('listing_type', ['sale', 'rent', 'presale']);

            // Pricing
            $table->decimal('price', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('price_per_sqm', 10, 2)->nullable();

            // Location
            $table->string('address')->nullable();
            $table->string('city')->default('Playa del Carmen');
            $table->string('zone')->nullable(); // Centro, Playacar, etc.
            $table->string('state')->default('Quintana Roo');
            $table->string('country')->default('Mexico');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Specifications
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedInteger('sqm_built')->nullable();
            $table->unsignedInteger('sqm_land')->nullable();
            $table->unsignedSmallInteger('parking_spaces')->nullable();
            $table->unsignedSmallInteger('floor')->nullable();
            $table->unsignedSmallInteger('total_floors')->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();

            // Features & Amenities (JSON arrays)
            $table->json('features')->nullable(); // Pool, Garden, Ocean View, etc.
            $table->json('amenities')->nullable(); // Gym, Security, Beach Club, etc.

            // Media
            $table->json('images')->nullable(); // Array of image URLs
            $table->string('video_url')->nullable();
            $table->string('virtual_tour_url')->nullable();
            $table->string('floor_plan_url')->nullable();

            // Investment Info (for presales/developments)
            $table->decimal('expected_roi', 5, 2)->nullable();
            $table->string('delivery_date')->nullable();
            $table->string('developer')->nullable();
            $table->unsignedTinyInteger('construction_progress')->nullable(); // 0-100%

            // Status
            $table->enum('status', ['active', 'pending', 'sold', 'rented', 'off_market'])->default('active');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_exclusive')->default(false);

            // Relations
            $table->foreignId('agent_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // SEO
            $table->string('slug')->unique();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('property_type');
            $table->index('listing_type');
            $table->index('city');
            $table->index('price');
            $table->index(['bedrooms', 'bathrooms']);
            $table->index('is_featured');
        });

        // Property Media table for additional media management
        Schema::create('property_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id');
            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();

            $table->enum('type', ['image', 'video', 'floor_plan', 'document']);
            $table->string('url');
            $table->string('thumbnail_url')->nullable();
            $table->string('title')->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            $table->index(['property_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_media');
        Schema::dropIfExists('properties');
    }
};
