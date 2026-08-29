<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Schema;

class BoardTask extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Filtra atributos según columnas reales de la tabla (útil si aún no corrió la migración de campos extra).
     */
    public static function attributesForCreate(array $attributes): array
    {
        static $columns = null;

        if ($columns === null) {
            $columns = array_flip(Schema::getColumnListing((new static)->getTable()));
        }

        return array_intersect_key($attributes, $columns);
    }

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