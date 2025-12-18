<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Quote;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {

        $columnaDinero = 'total_value';


        $ventasMes = Quote::where('status', 'adjudicada') 
            ->whereMonth('updated_at', Carbon::now()->month)
            ->whereYear('updated_at', Carbon::now()->year)
            ->sum($columnaDinero);

        $proyectosActivos = Project::where('status', 'activo')->count();
        
        $pendientesVentas = Quote::whereIn('status', ['pendiente', 'enviada'])->count();

        $empleadosActivos = Employee::where('is_active', true)->count();
        
        $ausentesHoy = LeaveRequest::where('status', 'aprobada')
            ->where('start_date', '<=', Carbon::today())
            ->where('end_date', '>=', Carbon::today())
            ->with('employee.user')
            ->get();

        $solicitudesPendientes = LeaveRequest::where('status', 'pendiente')
            ->with('employee.user')
            ->get();

        $salesData = Quote::select(
            DB::raw("DATE_FORMAT(updated_at, '%Y-%m') as month"), 
            DB::raw("SUM($columnaDinero) as total")
        )
        ->where('status', 'adjudicada')
        ->where('updated_at', '>=', Carbon::now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        $chartLabels = [];
        $chartValues = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $chartLabels[] = $date->format('M'); 
            
            $monthSale = $salesData->firstWhere('month', $monthKey);
            $chartValues[] = $monthSale ? $monthSale->total : 0;
        }

        $proyectosPorVencer = Project::where('status', 'activo')
            ->whereNotNull('deadline')
            ->whereDate('deadline', '<=', Carbon::now()->addDays(14))
            ->with('client') 
            ->orderBy('deadline', 'asc')
            ->take(5) 
            ->get()
            ->map(function ($p) {
                $clienteNombre = $p->client ? $p->client->razon_social : ($p->quote->client->razon_social ?? 'Sin Cliente');
                
                return [
                    'id' => $p->id,
                    'title' => $p->code . ' - ' . $clienteNombre,
                    'deadline' => Carbon::parse($p->deadline)->format('d/m/Y'),
                    'days_diff' => Carbon::now()->diffInDays($p->deadline, false),
                ];
            });

        return Inertia::render('Dashboard', [
            'kpis' => [
                'ventas_mes' => $ventasMes,
                'proyectos_activos' => $proyectosActivos,
                'cotizaciones_pendientes' => $pendientesVentas,
                'empleados_activos' => $empleadosActivos,
                'ausentes_hoy' => $ausentesHoy->count()
            ],
            'chart' => [
                'labels' => $chartLabels,
                'data' => $chartValues
            ],
            'alertas' => [
                'proyectos' => $proyectosPorVencer,
                'rrhh' => $solicitudesPendientes
            ],
            'ausentes_list' => $ausentesHoy
        ]);
    }
}