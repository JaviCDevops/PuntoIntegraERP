<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Client;
use App\Models\Quote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Board;
use App\Models\BoardTask;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $query = Quote::with('client');

        // 1. Filtro por Código
        if ($request->filled('search_code')) {
            $query->where('code', 'LIKE', '%' . $request->search_code . '%');
        }

        // 2. Filtro Híbrido: Cliente O Detalle (Descripción)
        // Usamos un grupo (closure) para que el OR no rompa los otros filtros
        if ($request->filled('search_client')) {
            $searchTerm = $request->search_client;
            
            $query->where(function($q) use ($searchTerm) {
                // Busca en la tabla relacionada 'clients'
                $q->whereHas('client', function ($sq) use ($searchTerm) {
                    $sq->where('razon_social', 'LIKE', '%' . $searchTerm . '%');
                })
                // O busca en la descripción de la cotización
                ->orWhere('description', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        // 3. Filtro por Estado exacto
        if ($request->filled('search_status') && $request->search_status !== 'todos') {
            $query->where('status', $request->search_status);
        }

        // 4. Filtro: Ocultar Perdidas
        if ($request->has('hide_lost') && $request->hide_lost == 'true') {
            $query->where('status', '!=', 'perdida');
        }

        // 5. Filtro: Ocultar Adjudicadas (NUEVO)
        if ($request->has('hide_won') && $request->hide_won == 'true') {
            $query->where('status', '!=', 'adjudicada');
        }

        return Inertia::render('Quotes/Index', [
            'quotes' => $query->latest()->get(),
            // Retornamos todos los filtros a la vista para mantener el estado
            'filters' => $request->all(['search_code', 'search_client', 'search_status', 'hide_lost', 'hide_won']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Quotes/Create', [
            'clients' => Client::all(),
            'areas' => Area::where('is_active', true)->get() 
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'area' => 'required|string|exists:areas,name', 
            'description' => 'nullable|string|max:255',
            'net_value' => 'required|numeric|min:0',
            'valid_until' => 'required|date|after:today',     
            'reminder_date' => 'nullable|date|before_or_equal:valid_until',
        ]);

        $client = Client::findOrFail($validated['client_id']);

        $net = $validated['net_value'];
        $tax = $net * 0.19;
        $total = $net + $tax;

        // --- Generación del Código (Año_Secuencia) ---
        $year = now()->year;
        
        $lastQuote = Quote::where('code', 'LIKE', "{$year}_%")
            ->selectRaw('*, CAST(SUBSTRING_INDEX(code, "_", -1) AS UNSIGNED) as sequence_num')
            ->orderBy('sequence_num', 'desc')
            ->first();

        $sequence = $lastQuote ? ($lastQuote->sequence_num + 1) : 1;
        $quoteCode = $year . '_' . str_pad($sequence, 4, '0', STR_PAD_LEFT);

        $quote = Quote::create([
            'code' => $quoteCode,
            'client_id' => $client->id,
            'client_snapshot' => $client->toArray(),
            'area' => $validated['area'],
            'description' => $validated['description'],
            'net_value' => $net,
            'tax_value' => $tax,
            'total_value' => $total,
            'valid_until' => $validated['valid_until'],
            'reminder_date' => $validated['reminder_date'],
            'status' => 'pendiente'
        ]);

        return redirect()->route('quotes.index')->with('success', 'Cotización creada exitosamente con código: ' . $quoteCode);
    }

    // --- Opción 1: Adjudicar vía Botón dedicado ---
    public function adjudicate(Quote $quote)
    {
        if ($quote->status === 'adjudicada') {
            return back()->with('error', 'Esta cotización ya está adjudicada.');
        }

        $quote->update(['status' => 'adjudicada']);

        $newProjectCode = $quote->code; 

        // 1. Crear Proyecto
        $project = Project::create([
            'quote_id' => $quote->id,
            'client_id' => $quote->client_id,
            'code' => $newProjectCode,
            'name' => 'Proyecto ' . ($quote->client_snapshot['razon_social'] ?? 'Cliente'),
            'start_date' => null, 
            'deadline' => null,   
            'status' => 'activo'
        ]);

        // 2. Crear Columnas Internas
        $project->columns()->createMany([
            ['name' => 'Por Hacer', 'order_index' => 1, 'color' => 'bg-gray-100'],
            ['name' => 'En Proceso', 'order_index' => 2, 'color' => 'bg-blue-50'],
            ['name' => 'En Revisión', 'order_index' => 3, 'color' => 'bg-yellow-50'],
            ['name' => 'Finalizado', 'order_index' => 4, 'color' => 'bg-green-50'],
        ]);

        // 3. Crear Tarjeta en Tablero Maestro
        $this->createBoardTask($project, $quote);

        return back()->with('success', '¡Felicidades! Proyecto creado. Ahora ingresa las fechas de ejecución.');
    }

    // --- Opción 2: Adjudicar vía Dropdown (Cambio de Estado) ---
    public function updateStatus(Request $request, Quote $quote)
    {
        $request->validate(['status' => 'required|in:pendiente,enviada,adjudicada,perdida']);

        if ($request->status === 'adjudicada' && $quote->project()->exists()) {
            return back()->with('error', 'Esta cotización ya fue adjudicada anteriormente.');
        }

        $quote->update(['status' => $request->status]);

        if ($request->status === 'adjudicada') {
            $newProjectCode = $quote->code;

            $project = Project::create([
                'quote_id' => $quote->id,
                'client_id' => $quote->client_id,
                'code' => $newProjectCode,
                'name' => 'Proyecto ' . ($quote->client_snapshot['razon_social'] ?? 'Cliente'),
                'start_date' => null,
                'deadline' => null,
                'status' => 'activo'
            ]);

            $project->columns()->createMany([
                ['name' => 'Por Hacer', 'order_index' => 1],
                ['name' => 'En Proceso', 'order_index' => 2],
                ['name' => 'En Revisión', 'order_index' => 3],
                ['name' => 'Finalizado', 'order_index' => 4],
            ]);

            $this->createBoardTask($project, $quote);
        }

        return back()->with('success', 'Estado actualizado y tablero sincronizado.');
    }

    // --- Helper: Crear Tarea en Tablero Maestro ---
    private function createBoardTask($project, $quote)
    {
        $masterBoard = Board::where('type', 'master')->first();

        if ($masterBoard) {
            // Buscamos la primera columna (Ej: Pendiente) y la primera fila
            $targetColumn = $masterBoard->columns()->orderBy('order_index', 'asc')->first();
            $targetRow = $masterBoard->rows()->orderBy('order_index', 'asc')->first();

            if ($targetColumn) {
                BoardTask::create([
                    'board_id' => $masterBoard->id,
                    'project_id' => $project->id, // Vinculación
                    'board_column_id' => $targetColumn->id,
                    'board_row_id' => $targetRow ? $targetRow->id : null,
                    'title' => $project->code . ' - ' . ($quote->client->razon_social ?? 'Sin Cliente'),
                    'description' => "Adjudicado el: " . now()->format('d/m/Y') . "\n\n" . $quote->description,
                    'order_index' => 999, // Al final
                    'assigned_to' => auth()->id(), 
                ]);
            }
        }
    }

    public function edit(Quote $quote)
    {
        if ($quote->status === 'adjudicada' || $quote->status === 'perdida') {
            return redirect()->route('quotes.index')->with('error', 'No se pueden editar cotizaciones cerradas.');
        }

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'clients' => Client::all(),
            'areas' => Area::where('is_active', true)->get()
        ]);
    }

    public function update(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'area' => 'required|string|exists:areas,name',
            'description' => 'nullable|string',
            'net_value' => 'required|numeric|min:0',
            'valid_until' => 'required|date',
            'reminder_date' => 'nullable|date|before_or_equal:valid_until',
        ]);

        $net = $validated['net_value'];
        $tax = $net * 0.19;

        $quote->update([
            'client_id' => $validated['client_id'],
            'area' => $validated['area'],
            'description' => $validated['description'],
            'net_value' => $net,
            'tax_value' => $tax,
            'total_value' => $net + $tax,
            'valid_until' => $validated['valid_until'],
            'reminder_date' => $validated['reminder_date'],
        ]);

        return redirect()->route('quotes.index')->with('success', 'Cotización actualizada correctamente.');
    }

    public function pdf(Quote $quote)
    {
        $pdf = Pdf::loadView('pdf.quote', compact('quote'));
        return $pdf->stream("Cotizacion_{$quote->code}.pdf");
    }

    public function destroy(Quote $quote)
    {
        // Borramos el proyecto asociado si existe para evitar huérfanos
        if ($quote->project()->exists()) {
            $quote->project->delete();
        }
        $quote->delete();
        return back()->with('success', 'Cotización eliminada correctamente.');
    }
}