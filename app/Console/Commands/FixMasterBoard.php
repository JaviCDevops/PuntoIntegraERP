<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\BoardRow;
use App\Models\BoardTask;
use App\Models\Project;

class FixMasterBoard extends Command
{
    protected $signature = 'fix:master-board';
    protected $description = 'Genera el Tablero Maestro y sincroniza los clientes correctamente.';

    public function handle()
    {
        $this->info("Reparando nombres de clientes en el Tablero Maestro...");

        $board = Board::firstOrCreate(
            ['type' => 'master'],
            [
                'title' => 'Tablero Maestro de Producción',
                'description' => 'Vista automática de todos los proyectos adjudicados.',
                'user_id' => 1,
            ]
        );

        $colProceso = BoardColumn::firstOrCreate(['board_id' => $board->id, 'name' => 'En Proceso'], ['color' => '#dbeafe', 'order_index' => 1]);
        $colPausado = BoardColumn::firstOrCreate(['board_id' => $board->id, 'name' => 'Pausado'], ['color' => '#ffedd5', 'order_index' => 2]);
        $colTerminado = BoardColumn::firstOrCreate(['board_id' => $board->id, 'name' => 'Terminado'], ['color' => '#dcfce7', 'order_index' => 3]);

        $defaultRow = BoardRow::firstOrCreate(
            ['board_id' => $board->id, 'name' => 'General'],
            ['color' => '#ffffff', 'order_index' => 1]
        );

        $projects = Project::with(['client', 'quote.client'])
            ->whereIn('status', ['activo', 'pausado', 'finalizado'])
            ->get();

        $count = 0;

        foreach ($projects as $project) {
            $clientName = 'Sin Cliente';

            if ($project->client) {
                $clientName = $project->client->razon_social;
            } 
            elseif ($project->quote && $project->quote->client) {
                $clientName = $project->quote->client->razon_social;
            }
            elseif ($project->quote && !empty($project->quote->client_snapshot)) {
                $snapshot = is_string($project->quote->client_snapshot) 
                    ? json_decode($project->quote->client_snapshot, true) 
                    : $project->quote->client_snapshot;
                
                $clientName = $snapshot['razon_social'] ?? 'Sin Cliente';
            }

            $targetColId = $colProceso->id;
            if ($project->status === 'pausado') $targetColId = $colPausado->id;
            if ($project->status === 'finalizado') $targetColId = $colTerminado->id;

            BoardTask::updateOrCreate(
                [
                    'board_id' => $board->id,
                    'project_id' => $project->id
                ],
                [
                    'title' => $project->code . ' - ' . $clientName, 
                    'description' => $project->quote->description ?? 'Sin descripción',
                    'board_column_id' => $targetColId,
                    'board_row_id' => $defaultRow->id,
                    'order_index' => 0
                ]
            );
            $count++;
        }

        $this->info("¡Actualizado! Se corrigieron los nombres de $count proyectos.");
    }
}