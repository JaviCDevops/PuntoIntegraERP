<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Employee extends Model
{
    protected $guarded = [];

    protected $casts = [
        'hire_date' => 'date',
        'birth_date' => 'date',
    ];

    public function user() { return $this->belongsTo(User::class); }
    
    public function leaves() { return $this->hasMany(LeaveRequest::class); }
    
    public function documents() { return $this->hasMany(EmployeeDocument::class); }

    public function getVacationBalanceAttribute()
    {
        if (!$this->hire_date) return 0;

        $monthsWorked = $this->hire_date->diffInMonths(now());

        $totalAccrued = $monthsWorked * 1.25;

        $daysTaken = $this->leaves()
            ->where('type', 'vacaciones')
            ->where('status', 'aprobada')
            ->get()
            ->sum(function($leave) {
                return Carbon::parse($leave->start_date)->diffInDays(Carbon::parse($leave->end_date)) + 1;
            });

        return round($totalAccrued - $daysTaken, 2);
    }

    public function getFullNameAttribute() {
        return $this->user ? $this->user->name : 'Sin Usuario';
    }
}