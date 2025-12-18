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
            if (!Schema::hasColumn('projects', 'oc_number')) {
                $table->string('oc_number')->nullable()->after('status');
            }
            
            if (!Schema::hasColumn('projects', 'internal_notes')) {
                $table->text('internal_notes')->nullable()->after('status');
            }
        });

        Schema::table('quotes', function (Blueprint $table) {
            if (!Schema::hasColumn('quotes', 'internal_notes')) {
                if (Schema::hasColumn('quotes', 'description')) {
                    $table->text('internal_notes')->nullable()->after('description');
                } else {
                    $table->text('internal_notes')->nullable();
                }
            }
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects_and_quotes', function (Blueprint $table) {
            //
        });
    }
};
