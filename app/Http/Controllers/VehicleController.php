<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Maintenance;
use App\Models\VehicleDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with(['maintenances' => function($q) {
            $q->latest('date'); 
        }, 'documents'])->orderBy('patent')->get();

        $vehicles->transform(function ($vehicle) {
            foreach ($vehicle->documents as $doc) {
                $expiration = Carbon::parse($doc->expiration_date);
                $today = Carbon::now();
                
                if ($expiration->isPast()) {
                    $doc->status = 'VENCIDO';
                } elseif ($expiration->diffInDays($today) <= 30) {
                    $doc->status = 'POR VENCER';
                } else {
                    $doc->status = 'VIGENTE';
                }
            }
            return $vehicle;
        });

        return Inertia::render('Vehicles/Index', [
            'vehicles' => $vehicles
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patent' => 'required|unique:vehicles,patent|max:10',
            'brand' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer',
            'current_km' => 'required|integer',
            'fuel_type' => 'nullable|string',
        ]);

        Vehicle::create($data);
        return back()->with('success', 'Vehículo agregado correctamente.');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'brand' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer',
            'current_km' => 'required|integer',
            'status' => 'required|string',
        ]);

        $vehicle->update($data);
        return back()->with('success', 'Vehículo actualizado.');
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();
        return back()->with('success', 'Vehículo eliminado.');
    }

    public function storeMaintenance(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'type' => 'required|string', 
            'date' => 'required|date',
            'cost' => 'required|numeric',
            'km_at_maintenance' => 'required|integer',
            'description' => 'required|string',
            'garage_name' => 'nullable|string',
        ]);

        $vehicle->maintenances()->create($data);

        if ($data['km_at_maintenance'] > $vehicle->current_km) {
            $vehicle->update(['current_km' => $data['km_at_maintenance']]);
        }

        return back()->with('success', 'Mantenimiento registrado.');
    }

    public function storeDocument(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'document_type' => 'required|string',
            'expiration_date' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', 
        ]);

        $status = 'VIGENTE';
        if ($data['expiration_date']) {
            $exp = Carbon::parse($data['expiration_date']);
            $status = $exp->isPast() ? 'VENCIDO' : ($exp->diffInDays(now()) <= 30 ? 'POR VENCER' : 'VIGENTE');
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('vehicle_docs', 'public');
        }

        $vehicle->documents()->create([
            'document_type' => $data['document_type'],
            'expiration_date' => $data['expiration_date'],
            'status' => $status,
            'file_path' => $filePath 
        ]);

        return back()->with('success', 'Documento adjuntado correctamente.');
    }
    
    public function destroyDocument($id) 
    {
        VehicleDocument::find($id)->delete();
        return back()->with('success', 'Documento eliminado.');
    }

    
}