<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth; // Importante para la redirección
use Inertia\Inertia;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController; 
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\HumanResourcesController;
use App\Http\Controllers\PublicHolidayController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\AreaController;
use Illuminate\Http\Request;

// 1. CAMBIO PRINCIPAL: Redirección Inteligente
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard & Perfil
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/leaves', [ProfileController::class, 'storeLeave'])->name('profile.leaves.store');

    // Gestión Comercial (Cotizaciones)
    Route::resource('quotes', QuoteController::class);
    Route::put('/quotes/{quote}/adjudicate', [QuoteController::class, 'adjudicate'])->name('quotes.adjudicate');
    Route::patch('/quotes/{quote}/status', [QuoteController::class, 'updateStatus'])->name('quotes.update-status');
    Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'pdf'])->name('quotes.pdf');

    // Proyectos
    Route::resource('projects', ProjectController::class)->only(['index', 'update']);

    // Kanban (Tableros y Tareas)
    Route::resource('boards', BoardController::class);
    Route::post('/boards/{board}/tasks', [BoardController::class, 'storeTask'])->name('boards.task.store');
    Route::put('/boards/tasks/{task}/move', [BoardController::class, 'moveTask'])->name('boards.task.move');
    Route::put('/boards/tasks/{task}', [BoardController::class, 'updateTask'])->name('boards.task.update');
    Route::delete('/boards/tasks/{task}', [BoardController::class, 'destroyTask'])->name('boards.task.destroy');
    
    // Sub-items de Tareas (Checklist)
    Route::post('/tasks/{task}/items', [BoardController::class, 'storeTaskItem'])->name('tasks.items.store');
    Route::put('/task-items/{item}', [BoardController::class, 'updateTaskItem'])->name('tasks.items.update');
    Route::delete('/task-items/{item}', [BoardController::class, 'destroyTaskItem'])->name('tasks.items.destroy');

    // Clientes y Usuarios
    Route::resource('clients', ClientController::class);
    Route::resource('users', UserController::class);
    Route::get('/users/check-rut/{rut}', [UserController::class, 'checkRut'])->name('users.check-rut');
    

    // Recursos Humanos (RRHH)
    Route::prefix('rrhh')->name('rrhh.')->group(function () {
        Route::get('/', [HumanResourcesController::class, 'index'])->name('index');
        Route::get('/create', [HumanResourcesController::class, 'create'])->name('create');
        Route::post('/', [HumanResourcesController::class, 'store'])->name('store');
        Route::get('/{employee}', [HumanResourcesController::class, 'show'])->name('show');
        Route::put('/{employee}', [HumanResourcesController::class, 'update'])->name('update');
        Route::delete('/{employee}', [HumanResourcesController::class, 'destroy'])->name('destroy');
        
        // Gestión Interna RRHH
        Route::post('/leaves', [HumanResourcesController::class, 'storeLeave'])->name('leaves.store');
        Route::put('/leaves/{leave}', [HumanResourcesController::class, 'updateLeaveStatus'])->name('leaves.status');
        
        // Documentos RRHH
        Route::post('/documents', [HumanResourcesController::class, 'storeDocument'])->name('documents.store');
        // 2. AGREGADO: Faltaba esta ruta para borrar documentos de empleados
        Route::delete('/documents/{id}', [HumanResourcesController::class, 'destroyDocument'])->name('documents.destroy');
    });

    // Gestión de Vehículos
    Route::resource('vehicles', VehicleController::class);
    Route::post('/vehicles/{vehicle}/maintenance', [VehicleController::class, 'storeMaintenance'])->name('vehicles.maintenance.store');  
    Route::post('/vehicles/{vehicle}/documents', [VehicleController::class, 'storeDocument'])->name('vehicles.documents.store');
    Route::delete('/vehicles/documents/{id}', [VehicleController::class, 'destroyDocument'])->name('vehicles.documents.destroy');

    Route::resource('areas', AreaController::class);

    // Feriados (solo admin)
    Route::prefix('feriados')->name('holidays.')->group(function () {
        Route::get('/', [PublicHolidayController::class, 'index'])->name('index');
        Route::post('/', [PublicHolidayController::class, 'store'])->name('store');
        Route::delete('/{holiday}', [PublicHolidayController::class, 'destroy'])->name('destroy');
        Route::post('/sync', [PublicHolidayController::class, 'sync'])->name('sync');
    });

});

        // --- RUTA TEMPORAL PARA PREVISUALIZAR CORREO ---
    Route::get('/preview-mail', function () {
        
        // Creamos un usuario "falso" en memoria para la prueba
        $user = new \App\Models\User([
            'name' => 'Roderick Tapia',
            'email' => 'rtapia@puntointegra.cl',
        ]);
        
        $password = 'Rtapia2026';
    
        // Retornamos la vista directamente al navegador
        return view('emails.welcome', compact('user', 'password'));
    });

// Ruta temporal para limpiar permisos (REMOVER DESPUÉS DE USAR)
Route::get('/admin/fix-permissions', function () {
    // Solo permitir acceso si el usuario está autenticado y tiene permisos de admin
    if (!auth()->check() || !auth()->user()->hasPermission('manage_users')) {
        abort(403, 'No tienes permisos para acceder a esta función.');
    }

    $users = \App\Models\User::all();
    $fixedCount = 0;
    $results = [];

    foreach ($users as $user) {
        $originalPermissions = $user->getRawOriginal('permissions');
        $currentPermissions = $user->permissions;

        $needsFix = false;
        $issues = [];

        // Check if permissions need fixing
        if (!is_array($currentPermissions)) {
            $issues[] = 'No es un array (tipo: ' . gettype($currentPermissions) . ')';
            $needsFix = true;
        } else {
            // Check for invalid permission values
            $validPermissions = ['dashboard', 'quotes', 'projects', 'clients', 'rrhh', 'vehicles', 'areas', 'users', 'manage_users'];
            $invalidPermissions = array_diff($currentPermissions, $validPermissions);

            if (!empty($invalidPermissions)) {
                $issues[] = 'Permisos inválidos: ' . implode(', ', $invalidPermissions);
                $needsFix = true;
            }
        }

        if ($needsFix) {
            // Fix permissions
            $user->permissions = is_array($currentPermissions) ? 
                array_intersect($currentPermissions, ['dashboard', 'quotes', 'projects', 'clients', 'rrhh', 'vehicles', 'areas', 'users', 'manage_users']) : 
                [];
            $user->save();

            $results[] = [
                'user' => $user->email,
                'issues' => $issues,
                'fixed' => true,
                'new_permissions' => $user->permissions
            ];
            $fixedCount++;
        }
    }

    return response()->json([
        'message' => "Se procesaron {$users->count()} usuarios. Se corrigieron {$fixedCount} usuarios.",
        'results' => $results,
        'total_users' => $users->count(),
        'fixed_users' => $fixedCount
    ]);
})->name('admin.fix-permissions');

// Ruta temporal para limpiar permisos del usuario Rtapia específicamente
Route::get('/admin/fix-rtapia', function () {
    // Solo permitir acceso si el usuario está autenticado y tiene permisos de admin
    if (!auth()->check() || !auth()->user()->hasPermission('manage_users')) {
        abort(403, 'No tienes permisos para acceder a esta función.');
    }

    $user = \App\Models\User::where('email', 'like', '%rtapia%')->first();
    
    if (!$user) {
        return response()->json(['error' => 'Usuario Rtapia no encontrado']);
    }

    $originalPermissions = $user->getRawOriginal('permissions');
    $currentPermissions = $user->permissions;

    // Forzar reset de permisos para asegurar que sea un array limpio
    $user->permissions = ["dashboard","clients","quotes","projects","users","rrhh","vehicles","manage_users"];
    $user->save();

    // Refresh para obtener los permisos actualizados
    $user->refresh();

    return response()->json([
        'message' => 'Permisos del usuario Rtapia reseteados y limpiados',
        'user' => $user->email,
        'original_permissions_raw' => $originalPermissions,
        'current_permissions' => $user->permissions,
        'permissions_type' => gettype($user->permissions)
    ]);
})->name('admin.fix-rtapia');

// Página web para ejecutar las correcciones
Route::get('/admin/tools', function () {
    // Solo permitir acceso si el usuario está autenticado y tiene permisos de admin
    if (!auth()->check() || !auth()->user()->hasPermission('manage_users')) {
        abort(403, 'No tienes permisos para acceder a esta página.');
    }

    return view('admin.tools');
})->name('admin.tools');

Route::get('/admin/vacation-email', function () {
    if (!auth()->check() || !auth()->user()->hasPermission('manage_users')) {
        abort(403, 'No tienes permisos para acceder a esta página.');
    }

    $path = storage_path('app/vacation_request_recipient.txt');
    $email = file_exists($path) ? trim(file_get_contents($path)) : '';

    return view('admin.vacation-email', ['vacation_email' => $email]);
})->name('admin.vacation-email');

Route::post('/admin/vacation-email', function (Request $request) {
    if (!auth()->check() || !auth()->user()->hasPermission('manage_users')) {
        abort(403, 'No tienes permisos para acceder a esta página.');
    }

    $request->validate([
        'vacation_email' => 'required|email',
    ]);

    $path = storage_path('app/vacation_request_recipient.txt');
    file_put_contents($path, $request->vacation_email);

    return back()->with('success', 'Correo de solicitudes de vacaciones actualizado.');
})->name('admin.vacation-email.save');

require __DIR__.'/auth.php';