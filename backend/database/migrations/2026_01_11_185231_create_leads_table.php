<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Basic Info
            $table->string('name');
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable()->index();
            
            // Source & Classification
            $table->enum('source', [
                'whatsapp', 'instagram', 'tiktok', 'facebook', 
                'website', 'referral', 'portal', 'cold_outreach'
            ])->default('website');
            
            $table->enum('status', [
                'new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'
            ])->default('new')->index();
            
            $table->enum('intent', [
                'investor', 'end_buyer', 'renter', 'developer'
            ])->nullable();
            
            // Scoring
            $table->unsignedTinyInteger('score')->default(0)->index();
            
            // Budget
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            
            // Preferences (JSON)
            $table->json('preferences')->nullable();
            
            // Assignment
            $table->foreignId('assigned_agent_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            
            // Tags & Notes
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            
            // Tracking
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for common queries
            $table->index(['status', 'score']);
            $table->index(['source', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
