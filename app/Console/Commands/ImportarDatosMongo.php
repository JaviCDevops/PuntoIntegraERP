<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Quote;
use App\Models\Board;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ImportarDatosMongo extends Command
{
    protected $signature = 'importar:mongo';
    protected $description = 'Importa datos desde JSON de Mongo (Modo Robusto)';

    public function handle()
    {
        $this->info('Iniciando diagnóstico y migración...');

        $adminUser = User::first();
        if (!$adminUser) {
            $this->error('Crea un usuario primero.');
            return;
        }

        $clientes = $this->cargarDatos(['test.clients.json', 'test.client.json']);
        if (!empty($clientes)) {
            $this->procesarClientes($clientes);
        }

        $cotizaciones = $this->cargarDatos(['test.quotes.json', 'test.quote.json']);
        if (!empty($cotizaciones)) {
            $this->procesarCotizaciones($cotizaciones);
        }

        $tableros = $this->cargarDatos(['test.boards.json', 'test.board.json']);
        if (!empty($tableros)) {
            $this->procesarTableros($tableros, $adminUser->id);
        }

        $this->info('Proceso finalizado.');
    }

    private function cargarDatos($nombresPosibles)
    {
        $rutaBase = storage_path('app'); 
        $archivoEncontrado = null;

        foreach ($nombresPosibles as $nombre) {
            if (file_exists("$rutaBase/$nombre")) {
                $archivoEncontrado = "$rutaBase/$nombre";
                break;
            }
        }

        if (!$archivoEncontrado) {
            $this->error("NO ENCONTRADO. Busqué en: $rutaBase");
            $this->line("   Nombres probados: " . implode(', ', $nombresPosibles));
            return [];
        }

        $this->info("Archivo encontrado: " . basename($archivoEncontrado));

        $contenido = file_get_contents($archivoEncontrado);

        $json = json_decode($contenido, true);

        if (is_array($json) && !empty($json) && isset($json[0])) {
            $this->info("Formato: Array JSON Estándar.");
            return $json;
        }

        $this->warn(" JSON estándar falló. Intentando modo línea por línea...");
        $lineas = explode("\n", $contenido);
        $datos = [];
        foreach ($lineas as $linea) {
            if (trim($linea)) {
                $obj = json_decode($linea, true);
                if ($obj) $datos[] = $obj;
            }
        }

        if (count($datos) > 0) {
            $this->info("   Formato: JSON Lines detectado.");
            return $datos;
        }

        $this->error("El archivo existe pero el formato no se reconoce o está vacío.");
        return [];
    }

    private function procesarClientes($data)
    {
        $count = 0;
        foreach ($data as $doc) {
            $rut = $doc['rut'] ?? 'SIN-RUT-' . uniqid();
            if (Client::where('rut', $rut)->exists()) continue;

            Client::create([
                'rut' => $rut,
                'razon_social' => $doc['razonSocial'] ?? $doc['name'] ?? 'Sin Nombre',
                'giro' => $doc['giro'] ?? 'N/A',
                'direccion' => $doc['direccion'] ?? 'N/A',
                'contacto_nombre' => $doc['contactoNombre'] ?? 'N/A',
                'contacto_email' => $doc['email'] ?? 'no@email.com',
                'telefono' => $doc['telefono'] ?? '0',
            ]);
            $count++;
        }
        $this->info("   -> $count clientes importados.");
    }

    private function procesarCotizaciones($data)
    {
        $count = 0;
        foreach ($data as $doc) {

            $rawStatus = strtoupper($doc['status'] ?? '');
            $status = 'pendiente'; 
            if (Str::contains($rawStatus, 'PERDIDO')) $status = 'perdida';
            elseif (Str::contains($rawStatus, 'ADJUDICAD')) $status = 'adjudicada';
            elseif (Str::contains($rawStatus, 'ENVIAD')) $status = 'enviada';

            $rutMongo = $doc['clientRut'] ?? '';
            $cliente = Client::where('rut', $rutMongo)->first();

            if (!$cliente) {
                $cliente = Client::create([
                    'rut' => $rutMongo ?: 'TEMP-'.uniqid(), 
                    'razon_social' => $doc['clientName'] ?? 'Desconocido',
                    'contacto_nombre' => 'Auto Generado',
                    'contacto_email' => 'import@system.com'
                ]);
            }

            Quote::create([
                'code' => $doc['projectCode'] ?? 'OLD-' . uniqid(),
                'client_id' => $cliente->id,
                'client_snapshot' => ['rut' => $cliente->rut, 'razon_social' => $cliente->razon_social],
                'area' => $doc['area'] ?? 'General',
                'description' => $doc['description'] ?? 'Sin detalle',
                'net_value' => $doc['netoUF'] ?? 0,
                'tax_value' => ($doc['netoUF'] ?? 0) * 0.19,
                'total_value' => ($doc['netoUF'] ?? 0) * 1.19,
                'status' => $status,
                'valid_until' => Carbon::now()->addDays(30),
            ]);
            $count++;
        }
        $this->info("   -> $count cotizaciones importadas.");
    }

    private function procesarTableros($data, $userId)
    {
        $count = 0;
        foreach ($data as $doc) {
            $board = Board::create([
                'title' => $doc['title'] ?? 'Tablero Importado',
                'description' => $doc['description'] ?? '',
                'user_id' => $userId,
                'is_fixed' => false
            ]);

            if (isset($doc['columns']) && is_array($doc['columns'])) {
                foreach ($doc['columns'] as $idx => $col) {
                    $board->columns()->create([
                        'name' => $col['title'] ?? 'Col', 
                        'color' => $col['color'] ?? '#ccc', 
                        'order_index' => $idx
                    ]);
                }
            }

            if (isset($doc['rows']) && is_array($doc['rows'])) {
                foreach ($doc['rows'] as $idx => $row) {
                    $board->rows()->create([
                        'name' => $row['title'] ?? 'Fila', 
                        'color' => $row['color'] ?? '#fff', 
                        'order_index' => $idx
                    ]);
                }
            } else {
                $board->rows()->create(['name' => 'General']);
            }
            $count++;
        }
        $this->info("   -> $count tableros importados.");
    }
}