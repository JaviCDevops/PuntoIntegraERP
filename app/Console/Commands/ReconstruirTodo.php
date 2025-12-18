<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Quote;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReconstruirTodo extends Command
{
    protected $signature = 'reconstruir:todo';
    protected $description = 'Importa Clientes, Cotizaciones y Proyectos desde quotes.csv en una DB vacía';

    public function handle()
    {
        $paths = [
            storage_path('app/quotes.csv'),
            public_path('quotes.csv'),
            base_path('quotes.csv')
        ];

        $csvPath = null;
        foreach ($paths as $path) {
            if (file_exists($path)) {
                $csvPath = $path;
                break;
            }
        }

        if (!$csvPath) {
            $this->error("No encuentro 'quotes.csv'. Súbelo a la carpeta 'public' de tu proyecto.");
            return;
        }

        $this->info("Leyendo archivo: $csvPath");

        $statusMap = [
            '2-ADJUDICADO' => 'adjudicada',
            '3-PERDIDO' => 'perdida',
            '0-PENDIENTE DE ENVIO' => 'pendiente',
            '1-ESPERA RESPUESTA CLIENTE' => 'enviada'
        ];

        $fileStream = fopen($csvPath, 'r');
        $header = fgetcsv($fileStream); 

        $header = array_map('trim', $header);
        $idxRut = array_search('clientRut', $header);
        $idxName = array_search('clientName', $header);
        $idxDesc = array_search('description', $header);
        $idxNeto = array_search('netoUF', $header); 
        $idxDate = array_search('createdAt', $header);
        $idxCode = array_search('projectCode', $header);
        $idxStatus = array_search('status', $header);

        if ($idxRut === false || $idxCode === false) {
            $this->error("El CSV no tiene las columnas requeridas (clientRut, projectCode, etc).");
            return;
        }

        $countClients = 0;
        $countQuotes = 0;
        $countProjects = 0;

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($fileStream)) !== false) {
                if (!isset($row[$idxRut])) continue;

                $rutRaw = $row[$idxRut];
                $nameRaw = strtoupper(trim($row[$idxName]));
                
                $rutClean = strtoupper(preg_replace('/[^0-9kK]/', '', $rutRaw));
                if (strlen($rutClean) > 1) {
                    $dv = substr($rutClean, -1);
                    $body = substr($rutClean, 0, -1);
                    $rutFormatted = number_format((int)$body, 0, '', '.') . '-' . $dv;
                } else {
                    $rutFormatted = $rutRaw;
                }

                $desc = $row[$idxDesc] ?? 'Sin descripción';
                $amount = (float) ($row[$idxNeto] ?? 0);
                $dateRaw = $row[$idxDate];
                $codeRaw = $row[$idxCode];
                $statusRaw = $row[$idxStatus];

                try {
                    $date = Carbon::parse($dateRaw);
                } catch (\Exception $e) {
                    $date = now();
                }

                $parts = explode('_', $codeRaw);
                if (count($parts) == 2) {
                    $codeFormatted = $parts[0] . '_' . str_pad($parts[1], 3, '0', STR_PAD_LEFT);
                } else {
                    $codeFormatted = $codeRaw;
                }

                $finalStatus = $statusMap[$statusRaw] ?? 'pendiente';

                $client = Client::firstOrCreate(
                    ['rut' => $rutFormatted], 
                    [
                        'razon_social' => $nameRaw,
                        'direccion' => 'Sin dirección registrada', 
                        'contacto_nombre' => 'Administración',     
                        'contacto_email' => 'sin@email.com'        
                    ]
                );
                if ($client->wasRecentlyCreated) $countClients++;

                $quote = Quote::create([
                    'client_id' => $client->id,
                    'client_snapshot' => $client->toArray(),
                    'code' => $codeFormatted,
                    'description' => $desc,
                    'net_value' => $amount,
                    'tax_value' => 0,
                    'total_value' => $amount,
                    'valid_until' => $date->copy()->addDays(30), 
                    'status' => $finalStatus,
                    'created_at' => $date,
                    'updated_at' => $date
                ]);
                $countQuotes++;

                if ($finalStatus === 'adjudicada') {
                    Project::create([
                        'quote_id' => $quote->id,
                        'name' => $desc,
                        'code' => $codeFormatted,
                        'status' => 'activo', 
                        'start_date' => $date, 
                        'deadline' => $date->copy()->addDays(30),
                        'created_at' => $date,
                        'updated_at' => $date
                    ]);
                    $countProjects++;
                }
            }

            DB::commit();
            fclose($fileStream);

            $this->info("------------------------------------------------");
            $this->info("¡Base de datos reconstruida con éxito!");
            $this->info("Clientes creados/encontrados: $countClients");
            $this->info("Cotizaciones importadas: $countQuotes");
            $this->info("Proyectos generados: $countProjects");
            $this->info("------------------------------------------------");

        } catch (\Exception $e) {
            DB::rollBack(); 
            $this->error("Ocurrió un error y no se guardó nada: " . $e->getMessage());
        }
    }
}