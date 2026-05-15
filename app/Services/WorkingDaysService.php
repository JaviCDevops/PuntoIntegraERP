<?php

namespace App\Services;

use App\Models\PublicHoliday;
use Carbon\Carbon;

class WorkingDaysService
{
    /**
     * Cuenta los días hábiles entre dos fechas (inclusive).
     * Excluye: sábados, domingos y feriados chilenos registrados en la tabla public_holidays.
     */
    public function countWorkingDays(Carbon $start, Carbon $end): int
    {
        if ($end->lt($start)) {
            return 0;
        }

        // Traer feriados del rango de una sola consulta
        $holidays = PublicHoliday::holidayDatesInRange($start, $end)
            ->map(fn ($date) => Carbon::parse($date)->toDateString())
            ->flip(); // usar como hash-set para O(1) lookup

        $count = 0;
        $current = $start->copy()->startOfDay();
        $endDay  = $end->copy()->startOfDay();

        while ($current->lte($endDay)) {
            $isWeekend = $current->isWeekend(); // sábado (6) o domingo (0)
            $isHoliday = isset($holidays[$current->toDateString()]);

            if (!$isWeekend && !$isHoliday) {
                $count++;
            }

            $current->addDay();
        }

        return $count;
    }
}
