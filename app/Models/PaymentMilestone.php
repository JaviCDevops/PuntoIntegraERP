<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMilestone extends Model
{
    use HasFactory;

    protected $table = 'payment_milestones';

    protected $fillable = [
        'project_id',
        'milestone_order',
        'percentage',
        'amount',
        'status',
        'invoice_number'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}