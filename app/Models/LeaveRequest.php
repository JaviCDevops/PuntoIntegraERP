<?php

namespace App\Models;

use App\Services\WorkingDaysService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'type',        
        'start_date',
        'end_date',
        'reason',      
        'status',
        'approved_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = ['days'];

    public function getDaysAttribute(): int
    {
        if (!$this->start_date || !$this->end_date) {
            return 0;
        }

        $workingDaysSvc = new WorkingDaysService();
        return $workingDaysSvc->countWorkingDays(
            Carbon::parse($this->start_date),
            Carbon::parse($this->end_date)
        );
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}