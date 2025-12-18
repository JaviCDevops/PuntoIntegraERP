<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardTask extends Model
{
    protected $guarded = [];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function items()
    { 
        return $this->hasMany(BoardTaskItem::class); 
    }
}