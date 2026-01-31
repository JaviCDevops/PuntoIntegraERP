<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserCreatedMail;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('employee')->latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    // --- NUEVO: API para verificar RUT en tiempo real desde el Frontend ---
    public function checkRut($rut)
    {
        // Buscamos si existe la ficha de empleado
        $employee = Employee::where('rut', $rut)->first();

        if ($employee) {
            // Verificamos si la ficha ya tiene un usuario ACTIVO asociado
            $hasActiveUser = $employee->user_id && User::find($employee->user_id);

            if ($hasActiveUser) {
                return response()->json([
                    'status' => 'taken',
                    'exists' => true, 
                    'message' => 'Este RUT ya está asociado a un usuario activo.'
                ]);
            }

            // Si llegamos aquí, la ficha existe pero es "huérfana" (histórica/ex-empleado)
            return response()->json([
                'status' => 'exists',
                'exists' => true,
                'name' => $employee->user ? $employee->user->name : 'Colaborador Histórico',
                'position' => $employee->position,
                'message' => 'RUT encontrado en registros históricos. Se reactivará la ficha.'
            ]);
        }

        return response()->json(['status' => 'new', 'exists' => false]);
    }

    public function store(Request $request)
    {
        // 1. Validaciones
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'permissions' => 'array',
            
            // IMPORTANTE: Quitamos 'unique:employees,rut' para permitir recuperar históricos
            'rut' => 'nullable|string', 
            'position' => 'nullable|required_with:rut|string', 
            'hire_date' => 'nullable|required_with:rut|date',
            'base_salary' => 'nullable|numeric|min:0',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'department' => 'nullable|string',
        ]);

        $newUser = null;
        $statusMessage = 'Usuario creado correctamente.';

        // 2. Transacción para asegurar integridad
        DB::transaction(function () use ($request, &$newUser, &$statusMessage) {
            
            // A. Crear el Usuario (Login)
            $newUser = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'permissions' => $request->permissions ?? [],
            ]);

            // B. Gestionar el Empleado (Ficha RRHH)
            if ($request->filled('rut')) {
                
                // Buscamos si ya existe la ficha (Ficha Huérfana o Histórica)
                $existingEmployee = Employee::where('rut', $request->rut)->first();

                if ($existingEmployee) {
                    // --- CASO 1: RECUPERACIÓN (El empleado existía) ---
                    // Actualizamos sus datos y lo vinculamos al nuevo usuario
                    $existingEmployee->update([
                        'user_id' => $newUser->id, // <--- AQUÍ SE VINCULA
                        'position' => $request->position,
                        'department' => $request->department,
                        'hire_date' => $request->hire_date,
                        'base_salary' => $request->base_salary,
                        'phone' => $request->phone,
                        'address' => $request->address,
                        'birth_date' => $request->birth_date,
                        'is_active' => true // Lo reactivamos
                    ]);
                    $statusMessage = 'Usuario creado y Ficha Histórica recuperada exitosamente.';
                } else {
                    // --- CASO 2: NUEVO (El empleado no existía) ---
                    $newUser->employee()->create([
                        'rut' => $request->rut,
                        'position' => $request->position,
                        'department' => $request->department,
                        'hire_date' => $request->hire_date,
                        'base_salary' => $request->base_salary,
                        'phone' => $request->phone,
                        'address' => $request->address,
                        'birth_date' => $request->birth_date,
                        'is_active' => true 
                    ]);
                }
            }
        });

        // 3. Envío de correo (fuera de la transacción para no bloquear)
        if ($newUser) {
            try {
                Mail::to($newUser->email)->send(new UserCreatedMail($newUser, $request->password));
            } catch (\Exception $e) {
                // Si falla el correo, no detenemos el proceso, solo continuamos.
                // Podrías agregar Log::error($e->getMessage()); aquí.
            }
        }

        return redirect()->route('users.index')->with('success', $statusMessage);
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user->load('employee') 
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'permissions' => 'array',
            
            'rut' => 'nullable|string',
            'position' => 'nullable|string',
            'base_salary' => 'nullable|numeric',
        ]);

        DB::transaction(function () use ($request, $user) {
            
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'permissions' => $request->permissions ?? [],
            ];

            if ($request->filled('password')) {
                $request->validate(['password' => ['confirmed', Rules\Password::defaults()]]);
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            if ($request->filled('rut')) {
                // Usamos updateOrCreate para manejar tanto la creación como la edición de ficha
                $user->employee()->updateOrCreate(
                    ['user_id' => $user->id], // Busca por user_id
                    [
                        'rut' => $request->rut,
                        'position' => $request->position,
                        'department' => $request->department,
                        'hire_date' => $request->hire_date,
                        'base_salary' => $request->base_salary,
                        'phone' => $request->phone,
                        'address' => $request->address,
                        'birth_date' => $request->birth_date,
                        'is_active' => true
                    ]
                );
            }
        });

        return redirect()->route('users.index')->with('success', 'Perfil actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'No puedes eliminarte a ti mismo.');
        }

        // Al eliminar el usuario, la ficha de empleado queda en BD (huérfana) 
        // para mantener el historial histórico de RRHH.
        $user->delete();
        
        return back()->with('success', 'Usuario eliminado. La ficha de empleado se mantiene como histórica.');
    }
}