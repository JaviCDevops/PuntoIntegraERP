<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('board_tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('board_tasks', 'project_id')) {
                $table->foreignId('project_id')->nullable()->after('id')->constrained()->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('board_tasks', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
        });
    }
};
