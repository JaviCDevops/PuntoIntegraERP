<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\BoardRow;
use App\Models\BoardTask;
use App\Models\Client;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Project;
use App\Models\Quote;
use App\Models\User;
use App\Services\VacationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QaBatch84Test extends TestCase
{
    use RefreshDatabase;

    private function userWithPermissions(array $permissions): User
    {
        return User::factory()->create([
            'permissions' => $permissions,
        ]);
    }

    public function test_board_show_includes_flat_tasks_list(): void
    {
        $user = $this->userWithPermissions(['projects']);

        $board = Board::create([
            'title' => 'Tablero Test',
            'user_id' => $user->id,
            'type' => 'matrix',
        ]);

        $column = BoardColumn::create([
            'board_id' => $board->id,
            'name' => 'Pendiente',
            'order_index' => 0,
        ]);

        $row = BoardRow::create([
            'board_id' => $board->id,
            'name' => 'Fila 1',
            'order_index' => 0,
        ]);

        BoardTask::create([
            'board_id' => $board->id,
            'board_column_id' => $column->id,
            'board_row_id' => $row->id,
            'title' => 'Tarea visible',
            'order_index' => 1,
        ]);

        $response = $this->actingAs($user)->get(route('boards.show', $board));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Boards/Show')
            ->has('board.tasks', 1)
            ->where('board.tasks.0.title', 'Tarea visible')
        );
    }

    public function test_board_task_store_persists_task_in_database(): void
    {
        $user = $this->userWithPermissions(['projects']);

        $board = Board::create([
            'title' => 'Tablero Test',
            'user_id' => $user->id,
            'type' => 'matrix',
        ]);

        $column = BoardColumn::create([
            'board_id' => $board->id,
            'name' => 'Pendiente',
            'order_index' => 0,
        ]);

        $row = BoardRow::create([
            'board_id' => $board->id,
            'name' => 'Fila 1',
            'order_index' => 0,
        ]);

        $response = $this->actingAs($user)->post(route('boards.task.store', $board), [
            'title' => 'Nueva tarea QA',
            'column_id' => $column->id,
            'row_id' => $row->id,
        ]);

        $response->assertRedirect(route('boards.show', $board));
        $this->assertDatabaseHas('board_tasks', [
            'board_id' => $board->id,
            'board_column_id' => $column->id,
            'board_row_id' => $row->id,
            'title' => 'Nueva tarea QA',
        ]);

        $showResponse = $this->actingAs($user)->get(route('boards.show', $board));
        $showResponse->assertInertia(fn ($page) => $page
            ->has('board.tasks', 1)
            ->where('board.tasks.0.title', 'Nueva tarea QA')
        );
    }

    public function test_project_update_rejects_milestones_not_summing_100(): void
    {
        $user = $this->userWithPermissions(['projects']);
        $client = Client::factory()->create();

        $quote = Quote::create([
            'code' => '2026_0001',
            'client_id' => $client->id,
            'client_snapshot' => $client->toArray(),
            'area' => 'TEST',
            'description' => 'Proyecto QA',
            'net_value' => 100,
            'tax_value' => 19,
            'total_value' => 119,
            'valid_until' => now()->addMonth(),
            'status' => 'adjudicada',
        ]);

        $project = Project::create([
            'quote_id' => $quote->id,
            'code' => $quote->code,
            'name' => 'Proyecto QA',
            'start_date' => now()->toDateString(),
            'deadline' => now()->addMonth()->toDateString(),
            'status' => 'activo',
        ]);

        $response = $this->actingAs($user)->put(route('projects.update', $project), [
            'milestones' => [
                ['milestone_order' => 1, 'percentage' => 70, 'amount' => 70, 'status' => 'PENDIENTE'],
                ['milestone_order' => 2, 'percentage' => 20, 'amount' => 20, 'status' => 'PENDIENTE'],
            ],
        ]);

        $response->assertSessionHasErrors('milestones');
    }

    public function test_project_update_accepts_milestones_summing_100(): void
    {
        $user = $this->userWithPermissions(['projects']);
        $client = Client::factory()->create();

        $quote = Quote::create([
            'code' => '2026_0002',
            'client_id' => $client->id,
            'client_snapshot' => $client->toArray(),
            'area' => 'TEST',
            'description' => 'Proyecto QA',
            'net_value' => 100,
            'tax_value' => 19,
            'total_value' => 119,
            'valid_until' => now()->addMonth(),
            'status' => 'adjudicada',
        ]);

        $project = Project::create([
            'quote_id' => $quote->id,
            'code' => $quote->code,
            'name' => 'Proyecto QA',
            'start_date' => now()->toDateString(),
            'deadline' => now()->addMonth()->toDateString(),
            'status' => 'activo',
        ]);

        $response = $this->actingAs($user)->put(route('projects.update', $project), [
            'milestones' => [
                ['milestone_order' => 1, 'percentage' => 70, 'amount' => 70, 'status' => 'PENDIENTE'],
                ['milestone_order' => 2, 'percentage' => 30, 'amount' => 30, 'status' => 'PENDIENTE'],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('payment_milestones', [
            'project_id' => $project->id,
            'percentage' => 70,
        ]);
        $this->assertDatabaseHas('payment_milestones', [
            'project_id' => $project->id,
            'percentage' => 30,
        ]);
    }

    public function test_quote_validation_rejects_negative_net_value(): void
    {
        $validator = \Illuminate\Support\Facades\Validator::make(
            ['net_value' => -100],
            ['net_value' => 'required|numeric|min:0']
        );

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('net_value', $validator->errors()->toArray());
    }

    public function test_leave_request_days_use_working_days_accessor(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 1, 5)); // lunes

        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'rut' => '11111111-1',
            'position' => 'QA',
            'hire_date' => '2020-01-01',
            'is_active' => true,
        ]);

        // Lunes a viernes = 5 días hábiles
        $leave = LeaveRequest::create([
            'employee_id' => $employee->id,
            'type' => 'vacaciones',
            'start_date' => '2026-01-05',
            'end_date' => '2026-01-09',
            'status' => 'aprobada',
        ]);

        $this->assertSame(5, $leave->days);
    }

    public function test_vacations_pdf_route_is_registered(): void
    {
        $user = $this->userWithPermissions(['rrhh', 'manage_users']);
        $employeeUser = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $employeeUser->id,
            'rut' => '22222222-2',
            'position' => 'RRHH',
            'hire_date' => '2021-01-01',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->get(route('rrhh.vacations.pdf', $employee));

        $response->assertSuccessful();
    }

    public function test_current_vacation_balance_matches_calendar_year_service(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 8, 1));

        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'rut' => '33333333-3',
            'position' => 'Dev',
            'hire_date' => '2022-05-01',
            'is_active' => true,
        ]);

        $expected = app(VacationService::class)->getCurrentYearBalance($employee);

        $this->assertSame($expected, $employee->vacation_balance);
    }

    public function test_dashboard_deadline_days_are_integers(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 8, 28));

        $user = $this->userWithPermissions(['dashboard']);
        $client = Client::factory()->create();

        $quote = Quote::create([
            'code' => '2026_0099',
            'client_id' => $client->id,
            'client_snapshot' => $client->toArray(),
            'area' => 'TEST',
            'description' => 'Alerta',
            'net_value' => 10,
            'tax_value' => 1.9,
            'total_value' => 11.9,
            'valid_until' => now()->addMonth(),
            'status' => 'adjudicada',
        ]);

        Project::create([
            'quote_id' => $quote->id,
            'code' => $quote->code,
            'name' => 'Proyecto alerta',
            'start_date' => now()->toDateString(),
            'deadline' => now()->addDays(2)->toDateString(),
            'status' => 'activo',
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('alertas.proyectos', 1)
            ->where('alertas.proyectos.0.days_diff', 2)
        );
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }
}
