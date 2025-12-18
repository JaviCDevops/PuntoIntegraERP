<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMilestone extends Model
{
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
        
        Schema::table('projects', function (Blueprint $table) {
            $table->date('reminder_date')->nullable();
            $table->date('expiration_date')->nullable();
        });
    }
}
