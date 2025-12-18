<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
        {
            return array_merge(parent::share($request), [
                'auth' => [
                    'user' => $request->user(),
                ],
                'notifications' => function () use ($request) {
                    if (!$request->user()) return [];
                
                    $alerts = [];
                
                    $reminders = \App\Models\Project::where('status', 'activo')
                        ->whereNotNull('reminder_date')
                        ->whereDate('reminder_date', '<=', now()) 
                        ->get();
                
                    foreach ($reminders as $p) {
                        $alerts[] = [
                            'id' => 'rem_' . $p->id,
                            'type' => 'reminder', 
                            'title' => 'Recordatorio de Proyecto',
                            'message' => "Revisar: {$p->name} ({$p->code})",
                            'link' => route('projects.index'), 
                        ];
                    }
                
                    $deadlines = \App\Models\Project::where('status', 'activo')
                        ->whereNotNull('deadline')
                        ->whereDate('deadline', '>=', now())
                        ->whereDate('deadline', '<=', now()->addDays(3))
                        ->get();
                
                    foreach ($deadlines as $p) {
                        $days = now()->diffInDays($p->deadline);
                        $alerts[] = [
                            'id' => 'exp_' . $p->id,
                            'type' => 'deadline', 
                            'title' => 'Entrega Próxima',
                            'message' => "El proyecto {$p->code} vence en {$days} días.",
                            'link' => route('projects.index'),
                        ];
                    }
                
                    return $alerts;
                },
            ]);
        }
}
