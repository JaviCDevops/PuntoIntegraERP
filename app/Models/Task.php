<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;
    protected $guarded = [];
    protected $casts = ['due_date' => 'date'];

    public function column()
    {
        return $this->belongsTo(TaskColumn::class, 'task_column_id');
    }
    
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}