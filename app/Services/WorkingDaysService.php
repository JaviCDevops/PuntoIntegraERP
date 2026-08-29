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

    /**
     * Cuenta días hábiles de un rango recortado a un periodo (ej. año calendario).
     */
    public function countWorkingDaysInRange(
        Carbon $rangeStart,
        Carbon $rangeEnd,
        Carbon $periodStart,
        Carbon $periodEnd
    ): int {
        $effectiveStart = $rangeStart->copy()->startOfDay();
        $effectiveEnd = $rangeEnd->copy()->startOfDay();
        $periodStart = $periodStart->copy()->startOfDay();
        $periodEnd = $periodEnd->copy()->startOfDay();

        if ($effectiveStart->lt($periodStart)) {
            $effectiveStart = $periodStart->copy();
        }

        if ($effectiveEnd->gt($periodEnd)) {
            $effectiveEnd = $periodEnd->copy();
        }

        if ($effectiveStart->gt($effectiveEnd)) {
            return 0;
        }

        return $this->countWorkingDays($effectiveStart, $effectiveEnd);
    }
}
