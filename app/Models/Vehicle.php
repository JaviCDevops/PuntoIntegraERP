<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['patent', 'brand', 'model', 'year', 'current_km', 'status', 'fuel_type'];

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }

    public function documents()
    {
        return $this->hasMany(VehicleDocument::class);
    }
}