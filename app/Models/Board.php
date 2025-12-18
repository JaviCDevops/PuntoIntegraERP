<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    protected $guarded = [];

    public function columns() { return $this->hasMany(BoardColumn::class)->orderBy('order_index'); }
    public function rows() { return $this->hasMany(BoardRow::class)->orderBy('order_index'); }
    public function tasks() { return $this->hasMany(BoardTask::class); }
    public function members() { return $this->belongsToMany(User::class); }
}