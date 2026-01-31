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
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\AreaController;

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

require __DIR__.'/auth.php';