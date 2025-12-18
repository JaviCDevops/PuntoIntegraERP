<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardTask; 
use App\Models\Project;
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
        return Inertia::render('Boards/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'columns' => 'required|array|min:1',
            'rows' => 'required|array|min:1',
        ]);

        $board = Board::create([
            'title' => $validated['title'], 
            'description' => $validated['description'],
            'user_id' => auth()->id(),
            'type' => 'matrix' 
        ]);

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
            'columns' => fn($q) => $q->orderBy('order_index'),
            'rows' => fn($q) => $q->orderBy('order_index'),
            'tasks.items' 
        ])->findOrFail($id);

        return Inertia::render('Boards/Show', [
            'board' => $board
        ]);
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

    public function storeTask(Request $request, Board $board)
    {
        BoardTask::create([
            'board_id' => $board->id,
            'board_column_id' => $request->column_id,
            'board_row_id' => $request->row_id,
            'title' => $request->title,
            'order_index' => 999
        ]);
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
        }]);

        return Inertia::render('Boards/Edit', [
            'board' => $board
        ]);
    }

    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'columns' => 'required|array|min:1',
            'rows' => 'required|array|min:1',
        ]);

        $board->update([
            'title' => $validated['title'], 
            'description' => $validated['description'],
        ]);

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