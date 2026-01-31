<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TaskColumn;
use App\Models\PaymentMilestone; 

class Project extends Model
{
    use HasFactory;

    protected $guarded = []; 

    protected $fillable = [
        'code',
        'quote_id',
        'client_id',
        'user_id',
        'area_id', 
        'name',
        'oc_number',
        'internal_notes',
        'start_date',
        'deadline',
        'status',
        'description' 
    ];

    protected $casts = [
        'start_date' => 'date',
        'deadline' => 'date',
        'reminder_date' => 'date',
        'expiration_date' => 'date',
    ];

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    // --- CORRECCIÓN CLAVE: Renombrado a 'milestones' ---
    // Esto hace que coincida con lo que el Controlador y el Frontend esperan.
    public function milestones()
    {
        return $this->hasMany(PaymentMilestone::class, 'project_id')->orderBy('milestone_order');
    }

    public function columns()
    {
        return $this->hasMany(TaskColumn::class)->orderBy('order_index');
    }
    
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    // --- CORRECCIÓN RECOMENDADA: ---
    // Como tu tabla 'projects' ya tiene la columna 'client_id' (está en el fillable),
    // es mucho mejor y más rápido usar belongsTo que hasOneThrough.
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}