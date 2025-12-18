<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TaskColumn;

class Project extends Model
{
    use HasFactory;

    protected $guarded = []; 

    protected $fillable = [
        'quote_id',
        'client_id',
        'name',
        'code',
        'status',
        'oc_number',
        'internal_notes',
        'start_date',
        'deadline',
        'reminder_date',
        'expiration_date',
        'milestones'
    ];

    protected $casts = [
        'start_date' => 'date',
        'deadline' => 'date',
        'reminder_date' => 'date',
        'expiration_date' => 'date',
        'milestones' => 'array'
    ];

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    public function columns()
    {
        return $this->hasMany(TaskColumn::class)->orderBy('order_index');
    }
    
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function milestones()
    {
        return $this->hasMany(PaymentMilestone::class)->orderBy('milestone_order');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}