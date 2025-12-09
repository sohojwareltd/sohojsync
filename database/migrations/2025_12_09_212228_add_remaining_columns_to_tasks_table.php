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
        Schema::table('tasks', function (Blueprint $table) {
            // Add estimated hours
            $table->decimal('estimated_hours', 8, 2)->nullable()->after('start_date');
            $table->decimal('actual_hours', 8, 2)->nullable()->after('estimated_hours');
            
            // Add labels/tags (JSON)
            $table->json('labels')->nullable()->after('actual_hours');
            
            // Add order for task positioning
            $table->integer('order')->default(0)->after('labels');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'estimated_hours',
                'actual_hours',
                'labels',
                'order'
            ]);
        });
    }
};
