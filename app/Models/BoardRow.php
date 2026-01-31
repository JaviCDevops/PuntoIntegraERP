<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BoardRow extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    // Relación para obtener las tareas de esta fila
    public function tasks()
    {
        return $this->hasMany(BoardTask::class, 'board_row_id')->orderBy('order_index');
    }
}