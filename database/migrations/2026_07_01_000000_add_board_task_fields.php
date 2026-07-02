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
        Schema::table('board_tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('board_tasks', 'due_date')) {
                $table->date('due_date')->nullable()->after('description');
            }
            if (!Schema::hasColumn('board_tasks', 'priority')) {
                $table->string('priority')->default('media')->after('due_date');
            }
            if (!Schema::hasColumn('board_tasks', 'assigned_to')) {
                $table->foreignId('assigned_to')->nullable()->after('priority')->constrained('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('board_tasks', function (Blueprint $table) {
            if (Schema::hasColumn('board_tasks', 'assigned_to')) {
                $table->dropForeign(['assigned_to']);
                $table->dropColumn('assigned_to');
            }
            if (Schema::hasColumn('board_tasks', 'priority')) {
                $table->dropColumn('priority');
            }
            if (Schema::hasColumn('board_tasks', 'due_date')) {
                $table->dropColumn('due_date');
            }
        });
    }
};
