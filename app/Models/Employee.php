<?php

namespace App\Models;

use App\Services\VacationService;
use Illuminate\Database\Eloquent\Model;

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
        return app(VacationService::class)->getCurrentYearBalance($this);
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