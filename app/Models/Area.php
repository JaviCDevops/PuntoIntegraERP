<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    // Aquí definimos los campos que se pueden guardar masivamente
    protected $fillable = [
        'name',
        'is_active'
    ];
}