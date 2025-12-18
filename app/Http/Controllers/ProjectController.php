<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {

        $query = Project::with(['quote', 'client'])->latest();

        if ($request->filled('search_code')) {
            $query->where('code', 'like', '%' . $request->search_code . '%');
        }

        if ($request->filled('search_client')) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('razon_social', 'like', '%' . $request->search_client . '%');
            });
        }

        if ($request->filled('search_status') && $request->search_status !== 'todos') {
            $query->where('status', $request->search_status);
        }

        return Inertia::render('Projects/Index', [
            'projects' => $query->get(),
            'filters' => $request->only(['search_code', 'search_client', 'search_status'])
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'oc_number' => 'nullable|string|max:255',
            'internal_notes' => 'nullable|string',
            'start_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'reminder_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'milestones' => 'nullable|array',
            'status' => 'nullable|string'
        ]);

        $project->update($data);

        return back()->with('success', 'Proyecto actualizado correctamente.');
    }
}