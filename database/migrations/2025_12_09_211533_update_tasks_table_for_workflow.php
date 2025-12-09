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
            // Add workflow status
            $table->foreignId('workflow_status_id')->nullable()->after('status')->constrained()->onDelete('set null');
            
            // Add priority
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->after('workflow_status_id');
            
            // Add start date (due_date already exists)
            $table->date('start_date')->nullable()->after('priority');
            
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
            $table->dropForeign(['workflow_status_id']);
            $table->dropColumn([
                'workflow_status_id',
                'priority',
                'start_date',
                'estimated_hours',
                'actual_hours',
                'labels',
                'order'
            ]);
        });
    }
};
