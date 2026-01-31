<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $guarded = []; 

    protected $casts = [
        'client_snapshot' => 'array', 
        'valid_until' => 'date',
    ];

    // 🛑 IMPORTANTE: AQUÍ NO HAY NINGÚN MÉTODO "boot" NI "creating"
    // Si tenías código aquí antes, ELIMÍNALO TODO.

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function project()
    {
        return $this->hasOne(Project::class);
    }
}