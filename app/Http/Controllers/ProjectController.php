<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Area; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
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

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'oc_number' => 'nullable|string|max:255',
            'internal_notes' => 'nullable|string',
            'start_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'area_id' => 'nullable|exists:areas,id', 
            'reminder_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'status' => 'nullable|string',
            
            'milestones' => 'nullable|array',
            'milestones.*.id' => 'nullable|integer',
            'milestones.*.milestone_order' => 'required|integer',
            
            'milestones.*.percentage' => 'required|numeric|min:0|max:100', 
            
            'milestones.*.amount' => 'nullable|numeric',
            'milestones.*.status' => 'nullable|string',
            'milestones.*.invoice_number' => 'nullable|string',
        ]);

        if ($request->has('milestones') && count($request->milestones) > 0) {
            $totalPercentage = collect($request->milestones)->sum('percentage');

            if ($totalPercentage != 100) {
                return back()->withErrors([
                    'milestones' => "La suma total de los porcentajes debe ser exactamente 100%. Actualmente suma: {$totalPercentage}%"
                ])->withInput(); 
            }
        }


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