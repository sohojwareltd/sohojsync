<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('task_comments')->onDelete('cascade');
            $table->text('content');
            $table->json('mentions')->nullable(); // Array of user IDs mentioned
            $table->timestamps();
            
            $table->index(['task_id', 'created_at']);
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_comments');
    }
};
