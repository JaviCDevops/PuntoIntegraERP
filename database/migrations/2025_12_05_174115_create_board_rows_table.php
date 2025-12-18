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
    Schema::create('board_rows', function (Blueprint $table) {
        $table->id();
        $table->foreignId('board_id')->constrained()->onDelete('cascade');
        $table->string('name');
        $table->string('color')->default('#ffffff');
        $table->integer('order_index')->default(0);
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('board_rows');
    }
};
