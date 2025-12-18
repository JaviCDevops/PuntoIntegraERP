<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Project;
use App\Models\Quote;

class RepararDatos extends Command
{
    protected $signature = 'reparar:datos';
    protected $description = 'Formatea RUTs antiguos y sincroniza códigos de proyecto';

    public function handle()
    {
        $this->info('Iniciando reparación...');

        $clients = Client::all();
        foreach ($clients as $client) {
            $cleanRut = preg_replace('/[^0-9kK]/', '', $client->rut);
            
            if (strlen($cleanRut) > 1) {
                $dv = substr($cleanRut, -1);
                $num = substr($cleanRut, 0, -1);
                $formatted = number_format($num, 0, '', '.') . '-' . strtoupper($dv);
                
                if ($client->rut !== $formatted) {
                    $client->rut = $formatted;
                    $client->save();
                    $this->line("RUT corregido: $formatted");
                }
            }
        }

        $projects = Project::with('quote')->get();
        foreach ($projects as $project) {
            if ($project->quote && $project->code !== $project->quote->code) {
                $old = $project->code;
                $project->code = $project->quote->code;
                $project->save();
                $this->line("Proyecto corregido: $old -> {$project->code}");
            }
        }

        $this->info('¡Reparación completada con éxito!');
    }
}