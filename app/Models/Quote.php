<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $guarded = []; 

    protected $casts = [
        'client_snapshot' => 'array', 
        'valid_until' => 'date',
        'client_snapshot' => 'array',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function project()
    {
        return $this->hasOne(Project::class);
    }
}