<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Models\BoardTask;

class FixProjectCodes extends Command
{
    protected $signature = 'fix:project-codes {--force : Forzar regeneración de todos los códigos}';
    protected $description = 'Regenera códigos de proyectos genéricos y actualiza el tablero maestro.';

    public function handle()
    {
        $this->info("Analizando códigos de proyectos...");

        $projects = Project::all();
        $updatedCount = 0;

        foreach ($projects as $project) {
            $oldCode = $project->code;
            $needsUpdate = false;

            if ($this->option('force') || empty($oldCode) || preg_match('/^\d{4}$/', $oldCode)) {
                
                $year = $project->created_at->format('Y');
                $idPad = str_pad($project->id, 3, '0', STR_PAD_LEFT);
                $newCode = "{$year}-{$idPad}";

                $project->update(['code' => $newCode]);
                
                $this->info("Corregido: ID {$project->id} | {$oldCode} -> {$newCode}");
                $needsUpdate = true;
                $updatedCount++;
            } else {
                $this->line("Código válido conservado: {$oldCode}");
            }

            if ($needsUpdate) {
                $task = BoardTask::where('project_id', $project->id)->first();
                if ($task) {
                    $clientName = 'Sin Cliente';
                    if ($project->client) {
                        $clientName = $project->client->razon_social;
                    } elseif ($project->quote && $project->quote->client) {
                        $clientName = $project->quote->client->razon_social;
                    }

                    $task->update([
                        'title' => $project->code . ' - ' . $clientName
                    ]);
                }
            }
        }

        $this->info("Proceso terminado. Se corrigieron {$updatedCount} códigos.");
        
        $this->call('fix:master-board');
    }
}