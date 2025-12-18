<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;

class ActualizarClientes extends Command
{
    protected $signature = 'data:update-clients';
    protected $description = 'Busca por Nombre, actualiza datos y CORRIGE el RUT';

    public function handle()
    {
        $file = storage_path('app/test.clients.csv');
        
        if (!file_exists($file)) {
            $this->error("❌ No encuentro el archivo: $file");
            return;
        }

        $this->info("Iniciando reparación de Clientes...");
        
        $handle = fopen($file, "r");
        fgetcsv($handle, 1000, ",");
        
        $updated = 0;
        $notFound = 0;

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $rutCorrectoRaw = $data[1];
            $nombreCsv = trim($data[2]); 

            if (empty($nombreCsv)) continue;

            $client = Client::where('razon_social', $nombreCsv)->first();

            if (!$client) {
                $client = Client::where('razon_social', 'LIKE', "%{$nombreCsv}%")->first();
            }

            if ($client) {
                $rutLimpio = preg_replace('/[^0-9kK]/', '', $rutCorrectoRaw);
                $dv = strtoupper(substr($rutLimpio, -1));
                $cuerpo = substr($rutLimpio, 0, -1);
                $rutFormateado = number_format((int)$cuerpo, 0, '', '.') . '-' . $dv;

                if (!empty($data[6])) $client->contacto_email = $data[6];
                if (!empty($data[7])) $client->phone = $data[7];
                if (!empty($data[4])) $client->direccion = $data[4];
                if (!empty($data[5])) $client->contacto_nombre = $data[5];
                
                $client->rut = $rutFormateado;
                
                $client->save();
                $this->info("Reparado: '{$client->razon_social}' -> Nuevo RUT: $rutFormateado");
                $updated++;
            } else {
                $this->warn("No encontrado por nombre: '$nombreCsv'");
                $notFound++;
            }
        }

        fclose($handle);
        $this->info("--------------------------------------");
        $this->info("Resumen:");
        $this->info("   - Clientes reparados y actualizados: $updated");
        $this->info("   - No encontrados: $notFound");
    }
}