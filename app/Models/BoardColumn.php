<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BoardColumn extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    // Relación para obtener las tareas de esta columna
    public function tasks()
    {
        return $this->hasMany(BoardTask::class, 'board_column_id')->orderBy('order_index');
    }
}