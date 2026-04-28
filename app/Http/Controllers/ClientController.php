<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        // Verificar permiso para acceder al módulo de clientes
        if (!auth()->user()->hasPermission('clients')) {
            abort(403, 'No tienes permiso para acceder al módulo de clientes.');
        }

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
        // Verificar permiso para crear clientes
        if (!auth()->user()->hasPermission('clients')) {
            abort(403, 'No tienes permiso para crear clientes.');
        }

        return Inertia::render('Clients/Create');
    }

    public function store(Request $request)
    {
        // Verificar permiso para crear clientes
        if (!auth()->user()->hasPermission('clients')) {
            abort(403, 'No tienes permiso para crear clientes.');
        }

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
        // Verificar permiso para editar clientes
        if (!auth()->user()->hasPermission('clients')) {
            abort(403, 'No tienes permiso para editar clientes.');
        }

        return Inertia::render('Clients/Edit', [
            'client' => $client
        ]);
    }

    public function update(Request $request, Client $client)
    {
        // Verificar permiso para actualizar clientes
        if (!auth()->user()->hasPermission('clients')) {
            abort(403, 'No tienes permiso para actualizar clientes.');
        }

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
        // Verificar permiso para eliminar clientes
        if (!auth()->user()->hasPermission('clients')) {
            abort(403, 'No tienes permiso para eliminar clientes.');
        }

        $client->delete();
        return back()->with('success', 'Cliente eliminado.');
    }
}