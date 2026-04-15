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
        $user = auth()->user();

        // Verificar que tenga acceso al módulo RRHH o sea admin
        if (!$user->hasPermission('rrhh') && !$user->hasPermission('manage_users')) {
            abort(403, 'No tienes acceso al módulo de RRHH.');
        }

        // Si el usuario tiene permiso para gestionar usuarios, ve todos los empleados
        if ($user->hasPermission('manage_users')) {
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
        } else {
            // Si no, solo ve su propio empleado (si existe)
            $employees = collect();
            if ($user->employee) {
                $employee = $user->employee;
                $employees->push([
                    'id' => $employee->id,
                    'user_id' => $employee->user_id,
                    'name' => $employee->user->name ?? 'Sin Usuario',
                    'rut' => $employee->rut,
                    'position' => $employee->position,
                    'department' => $employee->department,
                    'hire_date' => $employee->hire_date ? $employee->hire_date->format('d/m/Y') : '-',
                    'vacation_balance' => $employee->vacation_balance, 
                    'is_active' => $employee->is_active,
                ]);
            }
        }

        return Inertia::render('RRHH/Index', [
            'employees' => $employees,
            'canManageUsers' => $user->hasPermission('manage_users'),
        ]);
    }

    public function show(Employee $employee)
    {
        $user = auth()->user();

        // Verificar que tenga acceso al módulo RRHH o sea admin
        if (!$user->hasPermission('rrhh') && !$user->hasPermission('manage_users')) {
            abort(403, 'No tienes acceso al módulo de RRHH.');
        }

        // Si no tiene permiso para gestionar usuarios, solo puede ver su propio empleado
        if (!$user->hasPermission('manage_users') && $employee->user_id !== $user->id) {
            abort(403, 'No tienes permiso para ver esta información.');
        }

        $employee->load(['user', 'documents', 'leaves']);
        
        return Inertia::render('RRHH/Show', [
            'employee' => $employee,
            'canManageUsers' => $user->hasPermission('manage_users'),
        ]);
    }

    public function storeLeave(Request $request)
    {
        $user = auth()->user();

        // Verificar acceso al módulo
        if (!$user->hasPermission('rrhh') && !$user->hasPermission('manage_users')) {
            abort(403, 'No tienes acceso al módulo de RRHH.');
        }

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|string',
            'reason' => 'nullable|string' 
        ]);

        // Si no es admin, solo puede agregar solicitudes para sí mismo
        if (!$user->hasPermission('manage_users') && $request->employee_id != $user->employee->id) {
            abort(403, 'Solo puedes agregar solicitudes para ti mismo.');
        }

        LeaveRequest::create($request->all());
        return back()->with('success', 'Solicitud ingresada.');
    }

    public function storeDocument(Request $request)
    {
        $user = auth()->user();

        // Verificar acceso al módulo
        if (!$user->hasPermission('rrhh') && !$user->hasPermission('manage_users')) {
            abort(403, 'No tienes acceso al módulo de RRHH.');
        }

        $request->validate([
             'employee_id' => 'required|exists:employees,id',
             'file' => 'required|file|max:10240', 
             'type' => 'required|string', 
        ]);

        // Si no es admin, solo puede subir documentos para sí mismo
        if (!$user->hasPermission('manage_users') && $request->employee_id != $user->employee->id) {
            abort(403, 'Solo puedes subir documentos para ti mismo.');
        }

        return back()->with('success', 'Documento subido.');
    }

    public function updateLeaveStatus(Request $request, LeaveRequest $leave)
    {
        $user = auth()->user();

        // Solo admins pueden aprobar/rechazar solicitudes
        if (!$user->hasPermission('manage_users')) {
            abort(403, 'No tienes permiso para gestionar solicitudes.');
        }

        return back()->with('success', 'Solicitud procesada.');
    }
}