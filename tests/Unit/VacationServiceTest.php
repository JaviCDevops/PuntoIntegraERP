<?php

namespace Tests\Unit;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Services\VacationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_year_period_uses_current_year_not_hire_anniversary(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 8, 15));

        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'rut' => '12345678-9',
            'position' => 'Analista',
            'hire_date' => '2024-03-10',
            'is_active' => true,
        ]);

        $periods = app(VacationService::class)->getCalendarYearPeriods($employee, 2);
        $current = collect($periods)->firstWhere('is_current', true);

        $this->assertNotNull($current);
        $this->assertSame(2026, $current['year']);
        $this->assertSame('01/01/2026', $current['period_start']);
        $this->assertSame('31/12/2026', $current['period_end']);
    }

    public function test_taken_days_are_clipped_to_calendar_year(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 6, 1));

        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'rut' => '87654321-0',
            'position' => 'Operador',
            'hire_date' => '2020-01-01',
            'is_active' => true,
        ]);

        // Vacaciones que cruzan año nuevo: solo deben contar días de 2026
        LeaveRequest::create([
            'employee_id' => $employee->id,
            'type' => 'vacaciones',
            'start_date' => '2025-12-29',
            'end_date' => '2026-01-02',
            'status' => 'aprobada',
        ]);

        $service = app(VacationService::class);
        $periodStart = Carbon::create(2026, 1, 1)->startOfDay();
        $periodEnd = Carbon::create(2026, 12, 31)->endOfDay();

        $taken = $service->calculateTakenDays($employee, $periodStart, $periodEnd);

        // En 2026 solo deberían contar los días hábiles de enero (no diciembre 2025)
        $this->assertGreaterThan(0, $taken);
        $this->assertLessThan(5, $taken);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }
}
