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
    Schema::create('board_tasks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('board_id')->constrained()->onDelete('cascade');
        $table->foreignId('board_column_id')->constrained()->onDelete('cascade');
        $table->foreignId('board_row_id')->constrained()->onDelete('cascade'); // Importante: Pertenece a una fila Y una columna
        $table->string('title');
        $table->text('description')->nullable();
        $table->integer('order_index')->default(0);
        $table->timestamps();
    });
    }


    public function down(): void
    {
        Schema::dropIfExists('board_tasks');
    }
};
