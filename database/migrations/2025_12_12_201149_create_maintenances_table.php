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
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            
            $table->string('type'); 
            
            $table->date('date');           
            $table->decimal('cost', 10, 2);
            $table->integer('km_at_maintenance'); 
            
            $table->text('description')->nullable();
            $table->string('garage_name')->nullable(); 
            
            $table->date('next_maintenance_date')->nullable();
            $table->integer('next_maintenance_km')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
