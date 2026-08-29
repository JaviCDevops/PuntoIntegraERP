<?php

namespace App\Services;

use App\Models\Employee;
use Carbon\Carbon;

class VacationService
{
    public function __construct(
        private readonly WorkingDaysService $workingDays
    ) {}

    /**
     * Periodos de vacaciones por año calendario (Ene–Dic).
     */
    public function getCalendarYearPeriods(Employee $employee, int $yearsBack = 5): array
    {
        if (!$employee->hire_date) {
            return [];
        }

        $currentYear = Carbon::now()->year;
        $startYear = max($employee->hire_date->year, $currentYear - $yearsBack);
        $periods = [];

        for ($year = $startYear; $year <= $currentYear; $year++) {
            $periodStart = Carbon::create($year, 1, 1)->startOfDay();
            $periodEnd = Carbon::create($year, 12, 31)->endOfDay();

            if ($employee->hire_date->greaterThan($periodEnd)) {
                continue;
            }

            $earned = $this->calculateEarnedDays($employee, $year);
            $taken = $this->calculateTakenDays($employee, $periodStart, $periodEnd);

            $periods[] = [
                'year' => $year,
                'year_index' => $year,
                'period_start' => $periodStart->format('d/m/Y'),
                'period_end' => $periodEnd->format('d/m/Y'),
                'earned' => $earned,
                'taken' => $taken,
                'balance' => round($earned - $taken, 1),
                'is_current' => $year === $currentYear,
            ];
        }

        return array_reverse($periods);
    }

    public function getCurrentYearBalance(Employee $employee): float
    {
        if (!$employee->hire_date) {
            return 0;
        }

        $year = Carbon::now()->year;
        $periodStart = Carbon::create($year, 1, 1)->startOfDay();
        $periodEnd = Carbon::create($year, 12, 31)->endOfDay();

        $earned = $this->calculateEarnedDays($employee, $year);
        $taken = $this->calculateTakenDays($employee, $periodStart, $periodEnd);

        return round($earned - $taken, 1);
    }

    public function calculateEarnedDays(Employee $employee, int $year): float
    {
        if ($employee->hire_date->year > $year) {
            return 0;
        }

        if ($employee->hire_date->year < $year) {
            return 15;
        }

        // Año de ingreso: proporcional desde el mes de contratación
        $monthsWorked = 12 - $employee->hire_date->month + 1;

        return round(15 * ($monthsWorked / 12), 1);
    }

    public function calculateTakenDays(Employee $employee, Carbon $periodStart, Carbon $periodEnd): int
    {
        return (int) $employee->leaves()
            ->where('type', 'vacaciones')
            ->where('status', 'aprobada')
            ->where(function ($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('start_date', [$periodStart, $periodEnd])
                    ->orWhereBetween('end_date', [$periodStart, $periodEnd])
                    ->orWhere(function ($q) use ($periodStart, $periodEnd) {
                        $q->whereDate('start_date', '<=', $periodStart)
                            ->whereDate('end_date', '>=', $periodEnd);
                    });
            })
            ->get()
            ->sum(function ($leave) use ($periodStart, $periodEnd) {
                return $this->workingDays->countWorkingDaysInRange(
                    Carbon::parse($leave->start_date),
                    Carbon::parse($leave->end_date),
                    $periodStart,
                    $periodEnd
                );
            });
    }
}
