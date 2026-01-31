<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Models\BoardTask;
use Illuminate\Support\Facades\DB;

class FixProjectCodes extends Command
{
    // Firma del comando para la consola
    protected $signature = 'projects:fix-codes';
    
    // Descripción
    protected $description = 'Limpia los códigos temporalmente y luego sincroniza todo desde cero.';

    public function handle()
    {
        $this->info("🚀 INICIANDO ESTRATEGIA DE LIMPIEZA TOTAL...");
        
        DB::beginTransaction();

        try {
            // ---------------------------------------------------------
            // FASE 1: LIMPIAR EL CAMINO (Mass Rename)
            // ---------------------------------------------------------
            $this->info("1. Renombrando todos los proyectos a temporal...");
            
            // Renombramos TODOS usando SQL directo para evitar validaciones
            DB::table('projects')->update([
                'code' => DB::raw("CONCAT('TEMP_', id, '_', code)")
            ]);

            // ---------------------------------------------------------
            // FASE 2: ASIGNACIÓN LIMPIA
            // ---------------------------------------------------------
            $this->info("2. Asignando códigos correctos desde Cotizaciones...");

            // Traemos proyectos que tengan cotización
            $projects = Project::with(['quote.client'])->whereNotNull('quote_id')->get();
            
            $updatedProjects = 0;
            $updatedTasks = 0;

            $this->output->progressStart($projects->count());

            foreach ($projects as $project) {
                if ($project->quote) {
                    $correctCode = $project->quote->code; 
                    
                    // Actualizamos el proyecto
                    $project->code = $correctCode;
                    $project->saveQuietly(); // Importante: Quietly para no activar eventos
                    $updatedProjects++;

                    // --- FASE 3: TABLERO ---
                    $boardTask = BoardTask::where('project_id', $project->id)->first();
                    if ($boardTask) {
                        $clientName = $project->quote->client->razon_social ?? 'Sin Cliente';
                        $newTitle = "{$correctCode} - {$clientName}";

                        if ($boardTask->title !== $newTitle) {
                            $boardTask->title = $newTitle;
                            $boardTask->saveQuietly();
                            $updatedTasks++;
                        }
                    }
                }
                $this->output->progressAdvance();
            }

            DB::commit();
            $this->output->progressFinish();

            $this->info("\n---------------------------------------------");
            $this->info("✅ EXITO: Todo sincronizado correctamente.");
            $this->info("📊 Proyectos: $updatedProjects | Tareas: $updatedTasks");
            $this->info("---------------------------------------------");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("\nError Crítico: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}