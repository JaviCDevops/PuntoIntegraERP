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
        Schema::create('payment_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->integer('milestone_order'); 
            $table->decimal('percentage', 5, 2)->nullable(); 
            $table->decimal('amount', 12, 2)->nullable(); 
            $table->string('invoice_number')->nullable();
            $table->enum('status', ['PENDIENTE', 'FACTURADO', 'PAGADO'])->default('PENDIENTE');
            $table->timestamps();
        });
        
        if (!Schema::hasColumn('projects', 'reminder_date')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->date('reminder_date')->nullable();
                $table->date('expiration_date')->nullable();
            });
        }
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_milestones');
    }
};
