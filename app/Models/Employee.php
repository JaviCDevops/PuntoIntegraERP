<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Employee extends Model
{
    protected $guarded = [];

    protected $appends = [
        'vacation_balance',
        'formatted_rut',
    ];

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

    public function getFormattedRutAttribute(): string
    {
        if (!$this->rut) {
            return '';
        }

        $cleanRut = preg_replace('/[^0-9kK]/', '', $this->rut);

        if (!$cleanRut || strlen($cleanRut) < 2) {
            return $this->rut;
        }

        $dv = strtoupper(substr($cleanRut, -1));
        $number = substr($cleanRut, 0, -1);
        $formattedNumber = number_format((int) $number, 0, '', '.');

        return $formattedNumber . '-' . $dv;
    }

    public function getFullNameAttribute() {
        return $this->user ? $this->user->name : 'Sin Usuario';
    }
}