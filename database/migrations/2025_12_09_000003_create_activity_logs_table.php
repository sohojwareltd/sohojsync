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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('user_role')->nullable(); // Store role in case user is deleted
            $table->string('action'); // login, logout, create, update, delete, view
            $table->string('model')->nullable(); // Project, Task, Client, etc.
            $table->string('model_id')->nullable();
            $table->text('description');
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('event_type')->nullable(); // page_view, form_submit, button_click, etc.
            $table->integer('screen_time')->nullable(); // Time spent on page in seconds
            $table->json('changes')->nullable(); // Store old and new values
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('action');
            $table->index('model');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
