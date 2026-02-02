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
        // Sequences table - defines the automation sequence templates
        Schema::create('sequences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('trigger_type'); // new_lead, status_change, inactivity, scheduled
            $table->json('trigger_conditions')->nullable(); // JSON conditions for trigger
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // Sequence steps - individual steps within a sequence
        Schema::create('sequence_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sequence_id')->constrained()->cascadeOnDelete();
            $table->integer('order')->default(0);
            $table->string('action_type'); // send_message, update_status, wait, notify_agent
            $table->json('action_config'); // Configuration for the action
            $table->integer('delay_hours')->default(0); // Delay before executing
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Lead sequence enrollments - tracks which leads are in which sequences
        Schema::create('lead_sequence_enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sequence_id')->constrained()->cascadeOnDelete();
            $table->uuid('current_step_id')->nullable();
            $table->string('status'); // active, paused, completed, cancelled
            $table->timestamp('enrolled_at');
            $table->timestamp('next_action_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['lead_id', 'sequence_id']);
        });

        // Sequence execution log - tracks what actions have been taken
        Schema::create('sequence_execution_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('enrollment_id')->constrained('lead_sequence_enrollments')->cascadeOnDelete();
            $table->foreignUuid('step_id')->constrained('sequence_steps')->cascadeOnDelete();
            $table->string('status'); // pending, executed, failed, skipped
            $table->text('result')->nullable();
            $table->timestamp('scheduled_at');
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sequence_execution_logs');
        Schema::dropIfExists('lead_sequence_enrollments');
        Schema::dropIfExists('sequence_steps');
        Schema::dropIfExists('sequences');
    }
};
