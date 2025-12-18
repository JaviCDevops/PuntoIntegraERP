<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('patent')->unique(); 
            $table->string('brand');           
            $table->string('model');            
            $table->integer('year');            
            $table->integer('current_km')->default(0);
            $table->string('status')->default('DISPONIBLE'); 
            $table->string('fuel_type')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
