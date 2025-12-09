<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, we need to use raw SQL to modify ENUM
        DB::statement("ALTER TABLE project_members MODIFY COLUMN role ENUM('developer', 'manager', 'client', 'viewer') NOT NULL DEFAULT 'developer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE project_members MODIFY COLUMN role ENUM('developer', 'viewer') NOT NULL DEFAULT 'developer'");
    }
};
