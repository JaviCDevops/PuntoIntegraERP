<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Board extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Dueño del tablero (Creador)
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Miembros del tablero (Colaboradores)
    public function members()
    {
        return $this->belongsToMany(User::class, 'board_user');
    }

    // Columnas del Kanban
    public function columns() 
    { 
        return $this->hasMany(BoardColumn::class)->orderBy('order_index'); 
    }

    // Filas (para Matriz)
    public function rows() 
    { 
        return $this->hasMany(BoardRow::class)->orderBy('order_index'); 
    }

    // Todas las tareas
    public function tasks() 
    { 
        return $this->hasMany(BoardTask::class); 
    }
}