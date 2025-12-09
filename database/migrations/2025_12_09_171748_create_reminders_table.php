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
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['task', 'meeting', 'deadline', 'event', 'other']);
            $table->dateTime('remind_at');
            $table->boolean('is_sent')->default(false);
            $table->boolean('is_read')->default(false);
            $table->string('related_model')->nullable(); // e.g., 'Task', 'Project'
            $table->unsignedBigInteger('related_model_id')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'remind_at']);
            $table->index('is_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
