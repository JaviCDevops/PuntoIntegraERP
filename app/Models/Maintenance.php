<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    protected $fillable = [
        'vehicle_id', 'type', 'date', 'cost', 
        'km_at_maintenance', 'description', 'garage_name',
        'next_maintenance_date', 'next_maintenance_km'
    ];

    protected $casts = [
        'date' => 'date',
        'next_maintenance_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}