<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Area;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        // Verificar permiso para acceder al módulo de proyectos
        if (!auth()->user()->hasPermission('projects')) {
            abort(403, 'No tienes permiso para acceder al módulo de proyectos.');
        }

        $query = Project::with(['quote.client', 'milestones', 'area'])->latest();

        if ($request->filled('search_code')) {
            $query->where('code', 'like', '%' . $request->search_code . '%');
        }

        if ($request->filled('search_client')) {
            $query->whereHas('quote.client', function ($q) use ($request) {
                $q->where('razon_social', 'like', '%' . $request->search_client . '%');
            });
        }

        if ($request->filled('search_status') && $request->search_status !== 'todos') {
            $query->where('status', $request->search_status);
        }

        return Inertia::render('Projects/Index', [
            'projects' => $query->get(),
            'filters' => $request->only(['search_code', 'search_client', 'search_status']),
            'areas' => Area::orderBy('name')->get() 
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        $milestonesData = $data['milestones'] ?? [];
        unset($data['milestones']);

        $project->update($data);

        if ($request->has('milestones')) {
            $incomingIds = collect($milestonesData)->pluck('id')->filter()->toArray();

            $project->milestones()->whereNotIn('id', $incomingIds)->delete();

            foreach ($milestonesData as $milestone) {
                $project->milestones()->updateOrCreate(
                    ['id' => $milestone['id'] ?? null],
                    [
                        'project_id' => $project->id,
                        'milestone_order' => $milestone['milestone_order'],
                        'percentage' => $milestone['percentage'],
                        'amount' => $milestone['amount'],
                        'status' => $milestone['status'] ?? 'PENDIENTE',
                        'invoice_number' => $milestone['invoice_number'] ?? null,
                    ]
                );
            }
        }

        return back()->with('success', 'Proyecto y plan de pagos actualizados correctamente.');
    }
}