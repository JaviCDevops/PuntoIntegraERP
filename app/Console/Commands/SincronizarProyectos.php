<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Quote;
use App\Models\Project;
use App\Models\Board;
use App\Models\BoardTask;
use App\Models\User;

class SincronizarProyectos extends Command
{
    protected $signature = 'sincronizar:proyectos';
    protected $description = 'Genera proyectos y tareas para cotizaciones importadas que quedaron huérfanas';

    public function handle()
    {
        $this->info('Buscando cotizaciones adjudicadas sin proyecto...');

        $cotizacionesHuerfanas = Quote::where('status', 'adjudicada')
            ->doesntHave('project')
            ->get();

        if ($cotizacionesHuerfanas->isEmpty()) {
            $this->info('Todo está en orden. No hay cotizaciones huérfanas.');
            return;
        }

        $this->info("Se encontraron {$cotizacionesHuerfanas->count()} cotizaciones sin procesar.");

        $adminUser = User::first();
        $masterBoard = Board::firstOrCreate(
            ['is_fixed' => true],
            [
                'title' => 'PROYECTOS ADJUDICADOS (Maestro)',
                'description' => 'Tablero general de todos los proyectos ganados.',
                'user_id' => $adminUser->id
            ]
        );

        $col = $masterBoard->columns()->firstOrCreate(['name' => 'Pendiente'], ['color' => '#fca5a5', 'order_index' => 0]);
        $row = $masterBoard->rows()->firstOrCreate(['name' => 'General'], ['color' => '#3b82f6', 'order_index' => 0]);

        $bar = $this->output->createProgressBar($cotizacionesHuerfanas->count());
        $bar->start();

        foreach ($cotizacionesHuerfanas as $quote) {
            
            $project = Project::create([
                'quote_id' => $quote->id,
                'code' => $quote->code,
                'name' => 'Proyecto ' . ($quote->client_snapshot['razon_social'] ?? 'Cliente'),
                'start_date' => $quote->created_at, 
                'deadline' => $quote->valid_until, 
                'status' => 'activo'
            ]);

            $project->columns()->createMany([
                ['name' => 'Por Hacer', 'order_index' => 1],
                ['name' => 'En Proceso', 'order_index' => 2],
                ['name' => 'En Revisión', 'order_index' => 3],
                ['name' => 'Finalizado', 'order_index' => 4],
            ]);

            BoardTask::create([
                'board_id' => $masterBoard->id,
                'board_column_id' => $col->id,
                'board_row_id' => $row->id,
                'title' => "{$quote->code} - " . ($quote->client_snapshot['razon_social'] ?? 'Cliente'),
                'description' => "Generado por script de sincronización.",
                'order_index' => 999
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info(' ¡Sincronización completada con éxito!');
    }
}