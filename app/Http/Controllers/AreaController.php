<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaController extends Controller
{
    /**
     * Muestra la vista principal con la lista de áreas.
     */
    public function index()
    {
        // Obtenemos todas las áreas ordenadas alfabéticamente
        $areas = Area::orderBy('name', 'asc')->get();

        return Inertia::render('Areas/Index', [
            'areas' => $areas
        ]);
    }

    /**
     * Guarda una nueva área en la base de datos.
     */
    public function store(Request $request)
    {
        // Validamos que el nombre sea obligatorio y único
        $request->validate([
            'name' => 'required|string|max:255|unique:areas,name',
        ]);

        Area::create([
            'name' => $request->name,
            'is_active' => true
        ]);

        return redirect()->back()->with('success', 'Área creada correctamente.');
    }

    /**
     * Actualiza un área existente.
     */
    public function update(Request $request, Area $area)
    {
        // Validamos el nombre, pero ignoramos el ID actual para que no de error de "ya existe" si no cambiamos el nombre
        $request->validate([
            'name' => 'required|string|max:255|unique:areas,name,' . $area->id,
        ]);

        $area->update([
            'name' => $request->name
        ]);

        return redirect()->back()->with('success', 'Área actualizada correctamente.');
    }

    /**
     * Elimina un área.
     */
    public function destroy(Area $area)
    {
        // Aquí podrías agregar validación extra:
        // if ($area->projects()->count() > 0) { return back()->with('error', 'No se puede eliminar porque tiene proyectos asociados'); }

        $area->delete();

        return redirect()->back()->with('success', 'Área eliminada.');
    }
}