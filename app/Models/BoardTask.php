<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BoardTask extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relaciones Principales
    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function column()
    {
        return $this->belongsTo(BoardColumn::class, 'board_column_id');
    }

    public function row()
    {
        return $this->belongsTo(BoardRow::class, 'board_row_id');
    }

    // Detalles
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Subtareas
    public function items()
    { 
        return $this->hasMany(BoardTaskItem::class); 
    }
}