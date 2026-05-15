<?php

namespace App\Http\Controllers;

use App\Models\PublicHoliday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class PublicHolidayController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        if (!$user->hasPermission('manage_users')) {
            abort(403, 'Solo los administradores pueden gestionar feriados.');
        }

        $year = $request->integer('year', now()->year);

        $holidays = PublicHoliday::whereYear('date', $year)
            ->orderBy('date')
            ->get()
            ->map(fn ($h) => [
                'id'           => $h->id,
                'date'         => $h->date->format('Y-m-d'),
                'name'         => $h->name,
                'type'         => $h->type,
                'irrenunciable' => $h->irrenunciable,
            ]);

        return Inertia::render('Holidays/Index', [
            'holidays'    => $holidays,
            'currentYear' => $year,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->hasPermission('manage_users')) {
            abort(403, 'Solo los administradores pueden gestionar feriados.');
        }

        $data = $request->validate([
            'date'          => 'required|date|unique:public_holidays,date',
            'name'          => 'required|string|max:255',
            'type'          => 'nullable|string|max:100',
            'irrenunciable' => 'boolean',
        ]);

        PublicHoliday::create($data);

        return back()->with('success', 'Feriado agregado correctamente.');
    }

    public function destroy(PublicHoliday $holiday)
    {
        $user = auth()->user();

        if (!$user->hasPermission('manage_users')) {
            abort(403, 'Solo los administradores pueden gestionar feriados.');
        }

        $holiday->delete();

        return back()->with('success', 'Feriado eliminado.');
    }

    public function sync(Request $request)
    {
        $user = auth()->user();

        if (!$user->hasPermission('manage_users')) {
            abort(403, 'Solo los administradores pueden gestionar feriados.');
        }

        $year = $request->integer('year', now()->year);

        Artisan::call('holidays:sync', ['year' => $year]);

        $output = trim(Artisan::output());

        $message = "Sincronización completada para {$year}. {$output}";

        if ($request->expectsJson()) {
            return response()->json(['message' => $message]);
        }

        return back()->with('success', $message);
    }
}
