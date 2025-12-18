<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->search) {
            $query->where('razon_social', 'LIKE', "%{$request->search}%")
                  ->orWhere('rut', 'LIKE', "%{$request->search}%");
        }

        return Inertia::render('Clients/Index', [
            'clients' => $query->latest()->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Clients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rut' => 'required|unique:clients,rut|max:12',
            'razon_social' => 'required|string|max:255',
            'giro' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'contacto_nombre' => 'required|string|max:255',
            'contacto_email' => 'required|email|max:255',
            'telefono' => 'required|string|max:20',
        ]);

        Client::create($validated);

        return redirect()->route('clients.index')->with('success', 'Cliente creado exitosamente.');
    }

    public function edit(Client $client)
    {
        return Inertia::render('Clients/Edit', [
            'client' => $client
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'rut' => 'required|max:12|unique:clients,rut,' . $client->id, 
            'razon_social' => 'required|string|max:255',
            'giro' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'contacto_nombre' => 'required|string|max:255',
            'contacto_email' => 'required|email|max:255',
            'telefono' => 'required|string|max:20',
        ]);

        $client->update($validated);

        return redirect()->route('clients.index')->with('success', 'Cliente actualizado.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return back()->with('success', 'Cliente eliminado.');
    }
}