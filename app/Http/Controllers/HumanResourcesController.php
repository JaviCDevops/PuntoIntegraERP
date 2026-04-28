<?php

namespace App\Http\Controllers;

use App\Mail\LeaveRequestNotificationMail;
use App\Mail\LeaveRequestStatusMail;
use App\Models\Employee;
use App\Models\LeaveRequest;     
use App\Models\EmployeeDocument; 
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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

        // Si no tiene permiso para gestionar usuarios, solo puede ver su propia ficha
        if (!$user->hasPermission('manage_users')) {
            $userEmployeeId = $user->employee?->id;

            if (!$userEmployeeId || $employee->id !== $userEmployeeId) {
                abort(403, 'No tienes permiso para ver esta información.');
            }
        }

        $employee->load([
            'user',
            'documents' => fn ($query) => $query->latest(),
            'leaves' => fn ($query) => $query->latest('start_date'),
        ])->append('vacation_balance');
        
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

        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|string',
            'reason' => 'nullable|string' 
        ]);

        // Si no es admin, solo puede agregar solicitudes para sí mismo
        if (!$user->hasPermission('manage_users') && (!$user->employee || (int) $data['employee_id'] !== (int) $user->employee->id)) {
            abort(403, 'Solo puedes agregar solicitudes para ti mismo.');
        }

        $data['status'] = 'pendiente';

        $leave = LeaveRequest::create($data);
        $leave->loadMissing('employee.user');
        $this->notifyLeaveRequest($leave);

        return back()->with('success', 'Solicitud ingresada. Se envió notificación por correo.');
    }

    private function notifyLeaveRequest(LeaveRequest $leave)
    {
        $recipients = $this->getVacationRequestRecipients();
        if (empty($recipients)) {
            return;
        }

        Mail::to($recipients)->send(new LeaveRequestNotificationMail($leave));
    }

    private function getVacationRequestRecipients(): array
    {
        $emails = [];
        $path = storage_path('app/vacation_request_recipient.txt');

        if (file_exists($path)) {
            $email = trim(file_get_contents($path));
            if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $emails[] = $email;
            }
        }

        if (empty($emails)) {
            $emails = User::all()
                ->filter(fn($user) => $user->hasPermission('manage_users'))
                ->pluck('email')
                ->toArray();
        }

        return array_values(array_unique($emails));
    }

    public function storeDocument(Request $request)
    {
        $user = auth()->user();

        // Verificar acceso al módulo
        if (!$user->hasPermission('rrhh') && !$user->hasPermission('manage_users')) {
            abort(403, 'No tienes acceso al módulo de RRHH.');
        }

        $data = $request->validate([
             'employee_id' => 'required|exists:employees,id',
             'name' => 'required|string|max:255',
             'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', 
             'type' => 'required|string|max:255', 
        ]);

        // Si no es admin, solo puede subir documentos para sí mismo
        if (!$user->hasPermission('manage_users') && (!$user->employee || (int) $data['employee_id'] !== (int) $user->employee->id)) {
            abort(403, 'Solo puedes subir documentos para ti mismo.');
        }

        $path = $request->file('file')->store('employee_docs', 'public');

        EmployeeDocument::create([
            'employee_id' => $data['employee_id'],
            'name' => $data['name'],
            'type' => $data['type'],
            'file_path' => $path,
        ]);

        return back()->with('success', 'Documento subido correctamente.');
    }

    public function destroyDocument($id)
    {
        $user = auth()->user();

        if (!$user->hasPermission('rrhh') && !$user->hasPermission('manage_users')) {
            abort(403, 'No tienes acceso al módulo de RRHH.');
        }

        $document = EmployeeDocument::findOrFail($id);

        if (!$user->hasPermission('manage_users') && (!$user->employee || $document->employee_id !== $user->employee->id)) {
            abort(403, 'No tienes permiso para eliminar este documento.');
        }

        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Documento eliminado correctamente.');
    }

    public function updateLeaveStatus(Request $request, LeaveRequest $leave)
    {
        $user = auth()->user();

        // Solo admins pueden aprobar/rechazar solicitudes
        if (!$user->hasPermission('manage_users')) {
            abort(403, 'No tienes permiso para gestionar solicitudes.');
        }

        $data = $request->validate([
            'status' => 'required|in:aprobada,rechazada',
        ]);

        $leave->update([
            'status' => $data['status'],
            'approved_by' => $user->id,
        ]);

        $leave->loadMissing('employee.user');
        $this->notifyLeaveStatus($leave);

        return back()->with('success', 'Solicitud procesada correctamente.');
    }

    private function notifyLeaveStatus(LeaveRequest $leave): void
    {
        $employeeEmail = $leave->employee?->user?->email;

        if (!$employeeEmail) {
            return;
        }

        Mail::to($employeeEmail)->send(new LeaveRequestStatusMail($leave));
    }
}