<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('quotes', QuoteController::class);
    Route::put('/quotes/{quote}/adjudicate', [QuoteController::class, 'adjudicate'])->name('quotes.adjudicate');
    Route::patch('/quotes/{quote}/status', [QuoteController::class, 'updateStatus'])->name('quotes.update-status');
    Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'pdf'])->name('quotes.pdf');
    Route::resource('projects', ProjectController::class)->only(['index', 'update']);
    Route::resource('boards', BoardController::class);
    Route::post('/boards/{board}/tasks', [BoardController::class, 'storeTask'])->name('boards.task.store');
    Route::put('/boards/tasks/{task}/move', [BoardController::class, 'moveTask'])->name('boards.task.move');
    Route::put('/boards/tasks/{task}', [BoardController::class, 'updateTask'])->name('boards.task.update');
    Route::delete('/boards/tasks/{task}', [BoardController::class, 'destroyTask'])->name('boards.task.destroy');
    Route::post('/tasks/{task}/items', [BoardController::class, 'storeTaskItem'])->name('tasks.items.store');
    Route::put('/task-items/{item}', [BoardController::class, 'updateTaskItem'])->name('tasks.items.update');
    Route::delete('/task-items/{item}', [BoardController::class, 'destroyTaskItem'])->name('tasks.items.destroy');
    Route::resource('clients', ClientController::class);
    Route::resource('users', UserController::class);
    Route::prefix('rrhh')->name('rrhh.')->group(function () {
    Route::get('/', [HumanResourcesController::class, 'index'])->name('index');
    Route::get('/create', [HumanResourcesController::class, 'create'])->name('create');
    Route::post('/', [HumanResourcesController::class, 'store'])->name('store');
    Route::get('/{employee}', [HumanResourcesController::class, 'show'])->name('show');
    Route::put('/{employee}', [HumanResourcesController::class, 'update'])->name('update');
    Route::delete('/{employee}', [HumanResourcesController::class, 'destroy'])->name('destroy');
    Route::post('/leaves', [HumanResourcesController::class, 'storeLeave'])->name('leaves.store');
    Route::put('/leaves/{leave}', [HumanResourcesController::class, 'updateLeaveStatus'])->name('leaves.status');
    Route::post('/documents', [HumanResourcesController::class, 'storeDocument'])->name('documents.store');
    });
    Route::resource('vehicles', VehicleController::class);
    Route::post('/vehicles/{vehicle}/maintenance', [VehicleController::class, 'storeMaintenance'])->name('vehicles.maintenance.store');  
    Route::post('/vehicles/{vehicle}/documents', [VehicleController::class, 'storeDocument'])->name('vehicles.documents.store');
    Route::delete('/vehicles/documents/{id}', [VehicleController::class, 'destroyDocument'])->name('vehicles.documents.destroy');

});

require __DIR__.'/auth.php';