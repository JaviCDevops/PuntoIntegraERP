<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardRow extends Model
{
    protected $guarded = [];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }
}