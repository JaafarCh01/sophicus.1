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
        Schema::create('lead_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Lead reference
            $table->uuid('lead_id');
            $table->foreign('lead_id')->references('id')->on('leads')->cascadeOnDelete();

            // Activity type
            $table->enum('type', [
                'note',
                'email',
                'call',
                'meeting',
                'message',
                'status_change',
                'property_viewed',
                'score_update'
            ]);

            // Content
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();

            // Who created it
            $table->foreignId('created_by_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            // Indexes
            $table->index(['lead_id', 'type']);
            $table->index(['lead_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_activities');
    }
};
