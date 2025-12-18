<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Quote;
use App\Models\Project;

class UnificarClientesPorNombre extends Command
{
    protected $signature = 'unificar:clientes-nombre';
    protected $description = 'Fusiona clientes duplicados por Razón Social, priorizando los que tienen RUT válido.';

    public function handle()
    {
        $this->info(" Analizando duplicados por Nombre Similar...");

        $clients = Client::all();
        $groups = [];

        foreach ($clients as $client) {
            $name = strtoupper($client->razon_social);
            $name = str_replace(['.', ',', '-'], '', $name);
            $name = str_replace([' SPA', ' LTDA', ' SA', ' EIRL', ' LIMITADA', ' SOCIEDAD'], '', $name);
            $name = trim($name);

            if (empty($name)) continue;

            if (!isset($groups[$name])) {
                $groups[$name] = [];
            }
            $groups[$name][] = $client;
        }

        $totalMerged = 0;
        $bar = $this->output->createProgressBar(count($groups));

        foreach ($groups as $normalizedName => $duplicates) {
            if (count($duplicates) < 2) {
                $bar->advance();
                continue;
            }

            usort($duplicates, function ($a, $b) {
                $lenA = strlen($a->rut);
                $lenB = strlen($b->rut);

                if ($lenA > 7 && $lenB <= 7) return -1; 
                if ($lenB > 7 && $lenA <= 7) return 1;  

                return $a->id - $b->id;
            });

            $master = array_shift($duplicates);
            $this->line("\n Conflicto en: '$normalizedName'");
            $this->info("    GANA (Maestro): [ID: {$master->id}] {$master->razon_social} (RUT: {$master->rut})");

            foreach ($duplicates as $slave) {
                $this->comment("      Fusionando y borrando: [ID: {$slave->id}] {$slave->razon_social} (RUT: {$slave->rut})");
                
                Quote::where('client_id', $slave->id)->update(['client_id' => $master->id]);
                

                $slave->delete();
            }
            $totalMerged++;
            $bar->advance();
        }

        $bar->finish();
        $this->info("\n\n ¡Limpieza completada! Se fusionaron $totalMerged grupos de clientes.");
    }
}