<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleDocument extends Model
{
    protected $fillable = ['vehicle_id', 'document_type', 'expiration_date', 'status', 'file_path'];

    protected $casts = [
        'expiration_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}