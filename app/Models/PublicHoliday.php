<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Collection;

class PublicHoliday extends Model
{
    protected $fillable = ['date', 'name', 'type', 'irrenunciable'];

    protected $casts = [
        'date' => 'date',
        'irrenunciable' => 'boolean',
    ];

    /**
     * Retorna las fechas de feriados (solo la fecha, como string Y-m-d)
     * para un rango dado. Se usa en el cálculo de días hábiles.
     */
    public static function holidayDatesInRange(Carbon $start, Carbon $end): Collection
    {
        if (!Schema::hasTable('public_holidays')) {
            return collect();
        }

        return static::whereBetween('date', [
            $start->toDateString(),
            $end->toDateString(),
        ])->pluck('date');
    }
}
