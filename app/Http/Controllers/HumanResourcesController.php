<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use App\Models\LeaveRequest;     
use App\Models\EmployeeDocument; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage; 

class HumanResourcesController extends Controller
{
    public function index()
    {
        $employees = Employee::with('user')
            ->latest()
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'rut' => $employee->rut,
                    'position' => $employee->position,
                    'department' => $employee->department,
                    'hire_date' => $employee->hire_date ? $employee->hire_date->format('d/m/Y') : '-',
                    'vacation_balance' => $employee->vacation_balance, 
                    'is_active' => $employee->is_active,
                ];
            });

        return Inertia::render('RRHH/Index', [
            'employees' => $employees
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'rut' => 'required|string|unique:employees,rut',
            'position' => 'required|string',
            'department' => 'nullable|string', 
            'hire_date' => 'required|date',
            'base_salary' => 'required|numeric',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt('rodatech123'),
                'permissions' => [] 
            ]);

            Employee::create([
                'user_id' => $user->id,
                'rut' => $validated['rut'],
                'position' => $validated['position'],
                'department' => $validated['department'] ?? null,
                'hire_date' => $validated['hire_date'],
                'base_salary' => $validated['base_salary'],
                'is_active' => true
            ]);
        });

        return back()->with('success', 'Empleado creado correctamente.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['user', 'documents', 'leaves']);
        $employee->append('vacation_balance');

        return Inertia::render('RRHH/Show', [
            'employee' => $employee
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'position' => 'required|string',
            'department' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'base_salary' => 'numeric',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
        ]);

        $employee->update($validated);

        return back()->with('success', 'Ficha actualizada.');
    }

    public function storeLeave(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|string',
            'reason' => 'nullable|string' 
        ]);

        LeaveRequest::create($request->all());

        return back()->with('success', 'Solicitud ingresada.');
    }

    public function storeDocument(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'file' => 'required|file|max:10240', 
            'type' => 'required|string', 
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'public');

        $docName = $request->name ?? $file->getClientOriginalName();

        EmployeeDocument::create([
            'employee_id' => $request->employee_id,
            'name' => $docName, 
            'file_path' => $path,
            'type' => $request->type, 
            'notes' => $request->notes ?? null
        ]);

        return back()->with('success', 'Documento subido correctamente.');
    }

    public function destroy(Employee $employee)
    {
        if ($employee->user) {
            $employee->user->delete();
        }

        $employee->delete();

        return back()->with('success', 'Empleado eliminado correctamente.');
    }

    public function updateLeaveStatus(Request $request, LeaveRequest $leave)
    {

        if (auth()->user()->role !== 'admin') {
            return back()->with('error', ' Acceso denegado: Solo administradores pueden aprobar.');
        }

        $request->validate([
            'status' => 'required|in:aprobada,rechazada', 
        ]);

        if ($leave->status !== 'pendiente') {
            return back()->with('error', 'Esta solicitud ya fue procesada anteriormente.');
        }

        $leave->update(['status' => $request->status]);

        if ($request->status === 'aprobada' && $leave->type === 'vacaciones') {
            
            $start = \Carbon\Carbon::parse($leave->start_date);
            $end = \Carbon\Carbon::parse($leave->end_date);

            $days = $start->diffInDays($end) + 1;

            $leave->employee->decrement('vacation_balance', $days);
        }

        return back()->with('success', 'Solicitud ' . $request->status . ' correctamente.');
    }
}