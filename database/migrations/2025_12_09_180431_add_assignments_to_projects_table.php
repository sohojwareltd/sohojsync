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
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('project_manager_id')->nullable()->after('owner_id')->constrained('users')->onDelete('set null');
            $table->foreignId('client_id')->nullable()->after('project_manager_id')->constrained('users')->onDelete('set null');
            $table->date('deadline')->nullable()->after('description');
            $table->enum('status', ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'])->default('planning')->after('deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['project_manager_id']);
            $table->dropForeign(['client_id']);
            $table->dropColumn(['project_manager_id', 'client_id', 'deadline', 'status']);
        });
    }
};
