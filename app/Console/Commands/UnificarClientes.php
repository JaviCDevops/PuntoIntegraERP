<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Quote;
use App\Models\Project;

class UnificarClientes extends Command
{
    protected $signature = 'unificar:clientes';
    protected $description = 'Fusiona clientes duplicados basándose en el RUT y reasigna proyectos/presupuestos';

    public function handle()
    {
        $this->info(" Analizando duplicados por RUT...");

        $clients = Client::all();
        $groups = [];

        foreach ($clients as $client) {

            $cleanRut = strtoupper(preg_replace('/[^0-9kK]/', '', $client->rut));

            if (empty($cleanRut)) continue;

            if (!isset($groups[$cleanRut])) {
                $groups[$cleanRut] = [];
            }
            $groups[$cleanRut][] = $client;
        }

        $totalMerged = 0;
        $totalDeleted = 0;

        $bar = $this->output->createProgressBar(count($groups));

        foreach ($groups as $rut => $duplicates) {
            if (count($duplicates) < 2) {
                $bar->advance();
                continue;
            }

            usort($duplicates, function ($a, $b) {
                return $a->id - $b->id;
            });

            $master = array_shift($duplicates); 

            $this->line("\nFusionando RUT: $rut");
            $this->line("   Maestro: #{$master->id} - {$master->razon_social}");

            foreach ($duplicates as $slave) {
                $quotesCount = Quote::where('client_id', $slave->id)->update(['client_id' => $master->id]);

                $projectsCount = Project::where('client_id', $slave->id)->update(['client_id' => $master->id]);

                $this->line("       Eliminando duplicado: #{$slave->id} - {$slave->razon_social} (Movidos: $quotesCount quotes, $projectsCount projects)");
                
                $slave->delete();
                $totalDeleted++;
            }
            $totalMerged++;
            $bar->advance();
        }

        $bar->finish();
        $this->info("\n\n¡Proceso Terminado!");
        $this->info("Grupos unificados: $totalMerged");
        $this->info("Clientes duplicados eliminados: $totalDeleted");
    }
}