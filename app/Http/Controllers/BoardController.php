<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardTask;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $boards = Board::where('user_id', $user->id)
            ->withCount(['tasks'])
            ->latest()
            ->get();

        return Inertia::render('Boards/Index', ['boards' => $boards]);
    }

    public function create()
    {
        return Inertia::render('Boards/Create', [
            'users' => User::all() 
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'columns' => 'required|array|min:1',
            'rows' => 'required|array|min:1',
            'user_ids' => 'nullable|array', 
            'user_ids.*' => 'exists:users,id',
        ]);

        $board = Board::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'user_id' => auth()->id(),
            'type' => 'matrix'
        ]);

        if (isset($validated['user_ids'])) {
            $board->members()->sync($validated['user_ids']);
        }

        foreach($request->columns as $index => $col) {
            $board->columns()->create([
                'name' => $col['name'],
                'color' => $col['color'] ?? '#e2e8f0',
                'order_index' => $index
            ]);
        }

        foreach($request->rows as $index => $row) {
            $board->rows()->create([
                'name' => $row['name'],
                'color' => $row['color'] ?? '#ffffff',
                'order_index' => $index
            ]);
        }

        return redirect()->route('boards.show', $board->id);
    }

    public function show($id)
    {
        $board = Board::with([
            'columns.tasks.assignee', // Cargamos tareas y responsable
            'rows.tasks.assignee',
            'members'
        ])->findOrFail($id);

        return Inertia::render('Boards/Show', [
            'board' => $board
        ]);
    }

    // --- FUNCIÓN CORREGIDA PARA GUARDAR TAREAS ---
    public function storeTask(Request $request, Board $board)
    {
        // 1. Validación estricta
        $validated = $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'row_id' => 'nullable|exists:board_rows,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        // 2. Calcular orden para ponerla al final
        $maxOrder = BoardTask::where('board_column_id', $validated['column_id'])
            ->max('order_index');

        // 3. Crear tarea
        BoardTask::create([
            'board_id' => $board->id,
            'board_column_id' => $validated['column_id'],
            'board_row_id' => $validated['row_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'order_index' => $maxOrder + 1,
            'due_date' => $validated['due_date'] ?? null,
            'priority' => $validated['priority'] ?? 'media',
            'assigned_to' => $validated['assigned_to'] ?? null,
        ]);

        return back()->with('success', 'Tarea creada exitosamente.');
    }

    public function moveTask(Request $request, $id)
    {
        $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'row_id' => 'required|exists:board_rows,id',
        ]);

        $task = BoardTask::findOrFail($id);

        $task->update([
            'board_column_id' => $request->column_id,
            'board_row_id' => $request->row_id,
        ]);

        // Lógica automática de estados de proyecto
        if ($task->project_id) {
            $project = Project::find($task->project_id);
            
            if ($project) {
                $newColumn = \App\Models\BoardColumn::find($request->column_id);
                $colName = strtolower($newColumn->name);

                if (str_contains($colName, 'proceso') || str_contains($colName, 'iniciar')) {
                    $project->update(['status' => 'activo']);
                } 
                elseif (str_contains($colName, 'pausado') || str_contains($colName, 'detenido')) {
                    $project->update(['status' => 'pausado']);
                } 
                elseif (str_contains($colName, 'terminado') || str_contains($colName, 'finalizado') || str_contains($colName, 'listo')) {
                    $project->update(['status' => 'finalizado']);
                }
            }
        }

        return back();
    }

    public function updateTask(Request $request, $id)
    {
        $task = BoardTask::findOrFail($id);
        $task->update($request->only('title', 'description'));
        return back();
    }

    public function destroyTask($id)
    {
        BoardTask::destroy($id);
        return back();
    }

    public function edit(Board $board)
    {
        $board->load(['columns' => function($q) {
            $q->orderBy('order_index');
        }, 'rows' => function($q) {
            $q->orderBy('order_index');
        }, 'members']);

        return Inertia::render('Boards/Edit', [
            'board' => $board,
            'users' => User::all() 
        ]);
    }

    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'columns' => 'required|array|min:1',
            'rows' => 'required|array|min:1',
            'user_ids' => 'nullable|array',
        ]);

        $board->update([
            'title' => $validated['title'], 
            'description' => $validated['description'],
        ]);

        if (isset($validated['user_ids'])) {
            $board->members()->sync($validated['user_ids']);
        }

        // Gestión de Columnas
        $inputColIds = array_filter(array_column($request->columns, 'id'));
        $board->columns()->whereNotIn('id', $inputColIds)->delete();

        foreach ($request->columns as $index => $colData) {
            $board->columns()->updateOrCreate(
                ['id' => $colData['id'] ?? null], 
                [
                    'name' => $colData['name'],
                    'color' => $colData['color'] ?? '#e2e8f0',
                    'order_index' => $index
                ]
            );
        }

        // Gestión de Filas
        $inputRowIds = array_filter(array_column($request->rows, 'id'));
        $board->rows()->whereNotIn('id', $inputRowIds)->delete();

        foreach ($request->rows as $index => $rowData) {
            $board->rows()->updateOrCreate(
                ['id' => $rowData['id'] ?? null],
                [
                    'name' => $rowData['name'],
                    'color' => $rowData['color'] ?? '#ffffff',
                    'order_index' => $index
                ]
            );
        }

        return redirect()->route('boards.index')->with('success', 'Tablero actualizado correctamente.');
    }

    public function destroy(Board $board)
    {
        if ($board->type === 'master') {
            return back()->with('error', 'No puedes eliminar el Tablero Maestro del sistema.');
        }

        $board->delete();

        return redirect()->route('boards.index')->with('success', 'Tablero eliminado correctamente.');
    }
}