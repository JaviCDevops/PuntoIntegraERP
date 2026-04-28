<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Project $project)
    {
        if (!auth()->user()->hasPermission('projects')) {
            abort(403, 'No tienes permiso para acceder a este módulo.');
        }

        $project->load(['columns.tasks.assignedUser']);

        return Inertia::render('Projects/Kanban', [
            'project' => $project,
            'columns' => $project->columns,
            'users' => User::all(['id', 'name']), 
        ]);
    }

    public function store(Request $request, Project $project)
    {
        if (!auth()->user()->hasPermission('projects')) {
            abort(403, 'No tienes permiso para acceder a este módulo.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:baja,media,alta',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $firstColumn = $project->columns()->orderBy('order_index')->first();

        Task::create([
            'project_id' => $project->id,
            'task_column_id' => $firstColumn->id, 
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'assigned_to' => $validated['assigned_to'],
            'order_index' => 999, 
        ]);

        return back()->with('success', 'Tarea creada.');
    }

    public function move(Request $request, Task $task)
    {
        if (!auth()->user()->hasPermission('projects')) {
            abort(403, 'No tienes permiso para acceder a este módulo.');
        }

        $validated = $request->validate([
            'column_id' => 'required|exists:task_columns,id',
            'new_index' => 'required|integer'
        ]);

        $task->update([
            'task_column_id' => $validated['column_id'],
            'order_index' => $validated['new_index']
        ]);
        
        return back();
    }
}