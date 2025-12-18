<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Quote;
use App\Models\Client;
use Carbon\Carbon;

class RestaurarHistoria extends Command
{
    protected $signature = 'restaurar:historia';
    protected $description = 'Restaura fechas y códigos originales desde quotes.csv';

    public function handle()
    {
        $fullPath = storage_path('app/quotes.csv');

        $this->info(" Buscando archivo en ruta exacta:");
        $this->comment($fullPath);

        if (!file_exists($fullPath)) {
            $this->error(" EL ARCHIVO NO ESTÁ AHÍ.");
            
            $dir = dirname($fullPath);
            $this->info("\n Esto es lo que SÍ veo en la carpeta ({$dir}):");
            
            $files = scandir($dir);
            $foundSimilar = false;

            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                
                if (str_contains($file, 'quotes') || str_contains($file, 'csv')) {
                    $this->error("   $file  <-- ¿Es este? (Cuidado con dobles extensiones)");
                    $foundSimilar = true;
                } else {
                    $this->line("   - $file");
                }
            }

            if (!$foundSimilar) {
                $this->warn("\nConsejo: Asegúrate de guardar el archivo dentro de la carpeta 'storage/app' de tu proyecto.");
            }
            return;
        }

        $this->info("¡Archivo encontrado! Procesando...");
        
        $clients = Client::all()->mapWithKeys(function ($client) {
            $cleanRut = preg_replace('/[^0-9kK]/', '', $client->rut); 
            return [strtoupper($cleanRut) => $client->id];
        });

        $fileStream = fopen($fullPath, 'r');
        $header = fgetcsv($fileStream);
        
        $header = array_map('trim', $header);
        $idxRut = array_search('clientRut', $header);
        $idxDesc = array_search('description', $header);
        $idxDate = array_search('createdAt', $header);
        $idxCode = array_search('projectCode', $header);

        if ($idxRut === false || $idxCode === false) {
            $this->error("El CSV no tiene las columnas correctas (clientRut, projectCode, etc). Revisa el archivo.");
            return;
        }

        $count = 0;
        $notFound = 0;

        while (($row = fgetcsv($fileStream)) !== false) {
            if (!isset($row[$idxRut])) continue;

            $rutRaw = strtoupper(preg_replace('/[^0-9kK]/', '', $row[$idxRut]));
            $desc = $row[$idxDesc];
            $dateRaw = $row[$idxDate]; 
            $codeRaw = $row[$idxCode];

            if (!isset($clients[$rutRaw])) {
                $notFound++;
                continue;
            }
            $clientId = $clients[$rutRaw];

            $quote = Quote::where('client_id', $clientId)
                ->where('description', 'LIKE', substr($desc, 0, 50) . '%')
                ->first();

            if ($quote) {
                try {
                    $originalDate = Carbon::parse($dateRaw);
                    
                    $parts = explode('_', $codeRaw);
                    if (count($parts) == 2) {
                        $year = $parts[0];
                        $number = str_pad($parts[1], 3, '0', STR_PAD_LEFT);
                        $finalCode = "{$year}_{$number}";
                    } else {
                        $finalCode = $codeRaw;
                    }

                    $quote->created_at = $originalDate;
                    $quote->code = $finalCode;
                    $quote->save();

                    if ($quote->project) {
                        $quote->project->created_at = $originalDate;
                        $quote->project->code = $finalCode;
                        $quote->save();
                    }

                    $this->line("Restaurado: {$finalCode}");
                    $count++;
                } catch (\Exception $e) {
                    $this->warn("Error en fila: " . $e->getMessage());
                }
            } else {
                $notFound++;
            }
        }

        fclose($fileStream);
        $this->info("\n RESUMEN:");
        $this->info("Actualizados: $count");
        $this->info("No encontrados: $notFound");
    }
}