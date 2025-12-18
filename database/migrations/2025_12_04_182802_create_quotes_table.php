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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('client_id')->constrained();
            $table->json('client_snapshot'); 
            $table->decimal('net_value', 12, 2); 
            $table->decimal('tax_value', 12, 2); 
            $table->decimal('total_value', 12, 2);
            $table->decimal('conversion_rate', 8, 2)->default(1); 
            $table->enum('status', ['pendiente', 'enviada', 'adjudicada', 'perdida'])->default('pendiente');
            $table->date('valid_until');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
