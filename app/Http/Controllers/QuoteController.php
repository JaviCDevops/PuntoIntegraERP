<?php

namespace App\Http\Controllers;

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

        if ($request->has('search_code') && $request->search_code) {
            $query->where('code', 'LIKE', '%' . $request->search_code . '%');
        }

        if ($request->has('search_client') && $request->search_client) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('razon_social', 'LIKE', '%' . $request->search_client . '%');
            });
        }

        if ($request->has('search_status') && $request->search_status && $request->search_status !== 'todos') {
            $query->where('status', $request->search_status);
        }

        if ($request->has('hide_lost') && $request->hide_lost == 'true') {
            $query->where('status', '!=', 'perdida');
        }

        return Inertia::render('Quotes/Index', [
            'quotes' => $query->latest()->get(),
            'filters' => $request->all(['search_code', 'search_client', 'search_status', 'hide_lost']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Quotes/Create', [
            'clients' => Client::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'area' => 'required|string',
            'description' => 'nullable|string|max:255',
            'net_value' => 'required|numeric|min:0',
            'valid_until' => 'required|date|after:today',
        ]);

        $client = Client::findOrFail($validated['client_id']);

        $net = $validated['net_value'];
        $tax = $net * 0.19;
        $total = $net + $tax;

        $quoteCode = $this->generateQuoteCode();

        Quote::create([
            'code' => $quoteCode,
            'client_id' => $client->id,
            'client_snapshot' => $client->toArray(),
            'area' => $validated['area'],
            'description' => $validated['description'],
            'net_value' => $net,
            'tax_value' => $tax,
            'total_value' => $total,
            'valid_until' => $validated['valid_until'],
            'status' => 'pendiente'
        ]);

        return redirect()->route('quotes.index')->with('success', 'Cotización creada exitosamente con código: ' . $quoteCode);
    }

    public function adjudicate(Quote $quote)
    {
        if ($quote->status === 'adjudicada') {
            return back()->with('error', 'Esta cotización ya está adjudicada.');
        }

        $quote->update(['status' => 'adjudicada']);

        $newProjectCode = $this->generateProjectCode();

        $project = Project::create([
            'quote_id' => $quote->id,
            'code' => $newProjectCode,
            'name' => 'Proyecto ' . ($quote->client_snapshot['razon_social'] ?? 'Cliente'),
            'start_date' => now(),
            'deadline' => $quote->valid_until,
            'status' => 'activo'
        ]);

        $project->columns()->createMany([
            ['name' => 'Por Hacer', 'order_index' => 1, 'color' => 'bg-gray-100'],
            ['name' => 'En Proceso', 'order_index' => 2, 'color' => 'bg-blue-50'],
            ['name' => 'En Revisión', 'order_index' => 3, 'color' => 'bg-yellow-50'],
            ['name' => 'Finalizado', 'order_index' => 4, 'color' => 'bg-green-50'],
        ]);

        return back()->with('success', '¡Felicidades! Proyecto creado exitosamente con código: ' . $newProjectCode);
    }

    public function updateStatus(Request $request, Quote $quote)
    {
        $request->validate(['status' => 'required|in:pendiente,enviada,adjudicada,perdida']);

        if ($request->status === 'adjudicada' && $quote->project()->exists()) {
            return back()->with('error', 'Esta cotización ya fue adjudicada.');
        }

        $quote->update(['status' => $request->status]);

        if ($request->status === 'adjudicada') {

            $newProjectCode = $this->generateProjectCode();

            $project = Project::create([
                'quote_id' => $quote->id,
                'code' => $newProjectCode,
                'name' => 'Proyecto ' . ($quote->client_snapshot['razon_social'] ?? 'Cliente'),
                'start_date' => now(),
                'deadline' => $quote->valid_until,
                'status' => 'activo'
            ]);

            $project->columns()->createMany([
                ['name' => 'Por Hacer', 'order_index' => 1],
                ['name' => 'En Proceso', 'order_index' => 2],
                ['name' => 'En Revisión', 'order_index' => 3],
                ['name' => 'Finalizado', 'order_index' => 4],
            ]);

            $masterBoard = \App\Models\Board::where('type', 'master')->first();

            if ($masterBoard) {
                $colProceso = $masterBoard->columns()->where('name', 'LIKE', '%Proceso%')->first();
                $rowGeneral = $masterBoard->rows()->orderBy('order_index')->first();

                if ($colProceso && $rowGeneral) {
                    \App\Models\BoardTask::create([
                        'board_id' => $masterBoard->id,
                        'project_id' => $project->id,
                        'board_column_id' => $colProceso->id,
                        'board_row_id' => $rowGeneral->id,
                        'title' => $project->code . ' - ' . ($quote->client->razon_social ?? 'Sin Cliente'),
                        'description' => $quote->description,
                        'order_index' => 0
                    ]);
                }
            }
        }

        return back()->with('success', 'Estado actualizado y tablero sincronizado.');
    }

    public function edit(Quote $quote)
    {
        if ($quote->status === 'adjudicada' || $quote->status === 'perdida') {
            return redirect()->route('quotes.index')->with('error', 'No se pueden editar cotizaciones cerradas.');
        }

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'clients' => Client::all()
        ]);
    }

    public function update(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'area' => 'required|string',
            'description' => 'nullable|string',
            'net_value' => 'required|numeric|min:0',
            'valid_until' => 'required|date',
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
        if ($quote->project()->exists()) {
            $quote->project->delete();
        }
        $quote->delete();
        return back()->with('success', 'Cotización eliminada correctamente.');
    }


    private function generateProjectCode()
    {
        $year = date('Y');
        $lastProject = Project::where('code', 'LIKE', $year . '_%')
                              ->orderBy('id', 'desc')
                              ->first();

        if ($lastProject) {
            $parts = explode('_', $lastProject->code);
            $sequence = isset($parts[1]) ? intval($parts[1]) + 1 : 1;
        } else {
            $sequence = 1;
        }
        return $year . '_' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    private function generateQuoteCode()
    {
        $year = date('Y');
        $lastQuote = Quote::where('code', 'LIKE', $year . '_%')
                          ->orderBy('id', 'desc')
                          ->first();

        if ($lastQuote) {
            $parts = explode('_', $lastQuote->code);
            $sequence = isset($parts[1]) ? intval($parts[1]) + 1 : 1;
        } else {
            $sequence = 1;
        }
        return $year . '_' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}