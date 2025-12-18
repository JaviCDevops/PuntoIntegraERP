<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Models\Quote;
use App\Models\BoardTask;
use Illuminate\Support\Facades\File;
use Illuminate\Database\UniqueConstraintViolationException;

class ImportProjectCodes extends Command
{
    protected $signature = 'import:project-codes';
    protected $description = 'Importa códigos manejando duplicados en Cotizaciones y Proyectos.';

    public function handle()
    {
        $path = storage_path('app/quotes.csv');

        if (!File::exists($path)) {
            $this->error("Falta el archivo: storage/app/quotes.csv");
            return;
        }

        $this->info("Procesando CSV con protección total contra duplicados...");

        $file = fopen($path, 'r');
        $header = fgetcsv($file);
        
        $idxCode = array_search('projectCode', $header);
        $idxDesc = array_search('description', $header);
        $idxClient = array_search('clientName', $header);

        $countQuotes = 0;
        $countProjects = 0;
        $duplicates = 0;

        while (($row = fgetcsv($file)) !== false) {
            $csvCode = $row[$idxCode] ?? null;
            $csvDesc = $row[$idxDesc] ?? null;
            $csvClient = $row[$idxClient] ?? '';

            if (empty($csvCode)) continue;

            $quotes = Quote::where('description', $csvDesc)->with('client', 'project')->get();

            foreach ($quotes as $quote) {
                $dbClientName = $quote->client->razon_social ?? '';
                $str1 = mb_strtolower(trim($csvClient));
                $str2 = mb_strtolower(trim($dbClientName));

                if ($str1 === $str2 || str_contains($str2, $str1) || str_contains($str1, $str2)) {
                    
                    if ($quote->code !== $csvCode) {
                        try {
                            $quote->update(['code' => $csvCode]);
                            $countQuotes++;
                        } catch (UniqueConstraintViolationException $e) {
                            $this->warn("[Cotización] Duplicado saltado: $csvCode (ID: $quote->id)");
                            $duplicates++;
                        }
                    }

                    if ($quote->project) {
                        try {
                            if ($quote->project->code !== $csvCode) {
                                $quote->project->update(['code' => $csvCode]);
                                $countProjects++;
                            }

                            $task = BoardTask::where('project_id', $quote->project->id)->first();
                            if ($task) {
                                $clientDisplay = $quote->client->razon_social ?? $csvClient;
                                $task->update(['title' => $csvCode . ' - ' . $clientDisplay]);
                            }

                        } catch (UniqueConstraintViolationException $e) {
                            $this->warn("[Proyecto] Duplicado saltado: $csvCode ya existe en otro proyecto.");
                            $duplicates++;
                        }
                    }
                }
            }
        }

        fclose($file);

        $this->newLine();
        $this->info(" Importación finalizada con éxito.");
        $this->info("   - Cotizaciones actualizadas: $countQuotes");
        $this->info("   - Proyectos actualizados: $countProjects");
        $this->warn("   - Conflictos omitidos: $duplicates");
    }
}