<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Quote;
use App\Models\Project;

class GenerarProyectosFaltantes extends Command
{
    protected $signature = 'generar:proyectos';
    protected $description = 'Crea proyectos para cotizaciones adjudicadas que no los tienen';

    public function handle()
    {
        $this->info("Buscando cotizaciones adjudicadas sin proyecto...");

        $quotes = Quote::whereIn('status', ['adjudicada', '2-ADJUDICADO'])
            ->doesntHave('project')
            ->get();

        if ($quotes->isEmpty()) {
            $this->info("Todo en orden. No faltan proyectos.");
            return;
        }

        $bar = $this->output->createProgressBar($quotes->count());
        $count = 0;

        foreach ($quotes as $quote) {
            if ($quote->status === '2-ADJUDICADO') {
                $quote->status = 'adjudicada';
                $quote->save();
            }

            Project::create([
                'quote_id'    => $quote->id,
                'client_id'   => $quote->client_id,
                'name'        => $quote->description ?? 'Proyecto Sin Nombre',
                'code'        => $quote->code,      
                'status'      => 'EN PROCESO',      
                'created_at'  => $quote->created_at, 
                'updated_at'  => $quote->updated_at,
            ]);

            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->info("\n\n¡Listo! Se han creado $count proyectos antiguos.");
    }
}