<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveRequest;     
use App\Models\EmployeeDocument; 
use Illuminate\Http\Request;
use Inertia\Inertia;

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
                    'user_id' => $employee->user_id,
                    'name' => $employee->user->name ?? 'Sin Usuario',
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

    public function show(Employee $employee)
    {
        $employee->load(['user', 'documents', 'leaves']);
        
        return Inertia::render('RRHH/Show', [
            'employee' => $employee
        ]);
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
        return back()->with('success', 'Documento subido.');
    }

    public function updateLeaveStatus(Request $request, LeaveRequest $leave)
    {

        return back()->with('success', 'Solicitud procesada.');
    }
}