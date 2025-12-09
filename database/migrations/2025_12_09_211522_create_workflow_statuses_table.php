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
        Schema::create('workflow_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name'); // New Task, Requirements Ready, In Progress, Testing, Ready for Release, Completed
            $table->string('slug'); // new_task, requirements_ready, in_progress, testing, ready_for_release, completed
            $table->string('color', 7)->default('#6B7280'); // Hex color for status
            $table->integer('order')->default(0); // Order in workflow
            $table->boolean('is_default')->default(false); // Default status for new tasks
            $table->boolean('is_completed')->default(false); // Mark as completion status
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_statuses');
    }
};
