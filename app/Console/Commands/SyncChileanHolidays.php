<?php

namespace App\Console\Commands;

use App\Models\PublicHoliday;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncChileanHolidays extends Command
{
    protected $signature = 'holidays:sync {year? : Año a sincronizar (por defecto el actual y el siguiente)}';
    protected $description = 'Sincroniza los feriados chilenos desde la API oficial del Gobierno de Chile';

    // API oficial: Ministerio Secretaría General de la Presidencia
    private const API_URL = 'https://apis.digital.gob.cl/fl/feriados';
    private const API_URL_ALT = 'https://feriados.cl/api/v1/feriados';

    public function handle(): int
    {
        $yearArg = $this->argument('year');

        $years = $yearArg
            ? [(int) $yearArg]
            : [now()->year, now()->year + 1];

        foreach ($years as $year) {
            $this->syncYear($year);
        }

        return self::SUCCESS;
    }

    private function syncYear(int $year): void
    {
        $this->info("Sincronizando feriados para el año {$year}...");

        $holidays = $this->fetchFromApi($year);

        if ($holidays === null) {
            $this->error("No se pudo obtener feriados para {$year} desde ninguna fuente.");
            return;
        }

        if (empty($holidays)) {
            $this->warn("No se encontraron feriados para el año {$year}.");
            return;
        }

        $created = 0;
        $updated = 0;

        foreach ($holidays as $item) {
            $date = $item['fecha'] ?? null;
            $name = $item['nombre'] ?? 'Feriado';

            if (!$date) {
                continue;
            }

            $exists = PublicHoliday::where('date', $date)->first();

            $data = [
                'name'          => $name,
                'type'          => $item['tipo'] ?? 'inamovible',
                'irrenunciable' => !empty($item['irrenunciable']),
            ];

            if ($exists) {
                $exists->update($data);
                $updated++;
            } else {
                PublicHoliday::create(array_merge($data, ['date' => $date]));
                $created++;
            }
        }

        $this->info("  → {$created} feriados creados, {$updated} actualizados para {$year}.");
    }

    /**
     * Intenta obtener los feriados del año desde la API oficial.
     * Retorna array de items o null si falla.
     */
    private function fetchFromApi(int $year): ?array
    {
        $url = self::API_URL . "/{$year}";

        try {
            $response = Http::timeout(15)->withoutVerifying()->get($url);

            if ($response->successful() && !empty($response->json())) {
                return $response->json();
            }

            $this->warn("API principal no disponible (HTTP {$response->status()}). Usando datos estáticos...");
        } catch (\Exception $e) {
            $this->warn("Error con API principal: {$e->getMessage()}. Usando datos estáticos...");
        }

        // Datos estáticos de respaldo para Chile (años conocidos)
        return $this->getStaticHolidays($year);
    }

    private function getStaticHolidays(int $year): ?array
    {
        $fixed = [
            ['mes' => 1,  'dia' => 1,  'nombre' => 'Año Nuevo',                          'tipo' => 'inamovible', 'irrenunciable' => true],
            ['mes' => 5,  'dia' => 1,  'nombre' => 'Día Nacional del Trabajo',            'tipo' => 'inamovible', 'irrenunciable' => true],
            ['mes' => 5,  'dia' => 21, 'nombre' => 'Día de las Glorias Navales',          'tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 6,  'dia' => 20, 'nombre' => 'Día Nacional de los Pueblos Indígenas','tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 6,  'dia' => 29, 'nombre' => 'San Pedro y San Pablo',               'tipo' => 'con_fines_de_semana', 'irrenunciable' => false],
            ['mes' => 7,  'dia' => 16, 'nombre' => 'Virgen del Carmen',                   'tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 8,  'dia' => 15, 'nombre' => 'Asunción de la Virgen',               'tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 9,  'dia' => 18, 'nombre' => 'Independencia Nacional',              'tipo' => 'inamovible', 'irrenunciable' => true],
            ['mes' => 9,  'dia' => 19, 'nombre' => 'Día de las Glorias del Ejército',     'tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 10, 'dia' => 12, 'nombre' => 'Encuentro de Dos Mundos',             'tipo' => 'con_fines_de_semana', 'irrenunciable' => false],
            ['mes' => 10, 'dia' => 31, 'nombre' => 'Día de las Iglesias Evangélicas',     'tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 11, 'dia' => 1,  'nombre' => 'Día de Todos los Santos',             'tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 12, 'dia' => 8,  'nombre' => 'Inmaculada Concepción',               'tipo' => 'inamovible', 'irrenunciable' => false],
            ['mes' => 12, 'dia' => 25, 'nombre' => 'Navidad',                             'tipo' => 'inamovible', 'irrenunciable' => true],
        ];

        // Semana Santa (variable) — calculada por año
        $easter     = $this->easterDate($year);
        $viernes    = (clone $easter)->modify('-2 days');
        $sabado     = (clone $easter)->modify('-1 day');

        $result = [];

        foreach ($fixed as $h) {
            $result[] = [
                'fecha'         => sprintf('%04d-%02d-%02d', $year, $h['mes'], $h['dia']),
                'nombre'        => $h['nombre'],
                'tipo'          => $h['tipo'],
                'irrenunciable' => $h['irrenunciable'],
            ];
        }

        $result[] = ['fecha' => $viernes->format('Y-m-d'), 'nombre' => 'Viernes Santo',   'tipo' => 'inamovible', 'irrenunciable' => true];
        $result[] = ['fecha' => $sabado->format('Y-m-d'),  'nombre' => 'Sábado Santo',    'tipo' => 'inamovible', 'irrenunciable' => false];

        usort($result, fn($a, $b) => $a['fecha'] <=> $b['fecha']);

        return $result;
    }

    /** Calcula la fecha de Pascua (Domingo de Resurrección) para un año dado */
    private function easterDate(int $year): \DateTime
    {
        $a = $year % 19;
        $b = intdiv($year, 100);
        $c = $year % 100;
        $d = intdiv($b, 4);
        $e = $b % 4;
        $f = intdiv($b + 8, 25);
        $g = intdiv($b - $f + 1, 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30;
        $i = intdiv($c, 4);
        $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
        $m = intdiv($a + 11 * $h + 22 * $l, 451);
        $month = intdiv($h + $l - 7 * $m + 114, 31);
        $day   = (($h + $l - 7 * $m + 114) % 31) + 1;

        return new \DateTime(sprintf('%04d-%02d-%02d', $year, $month, $day));
    }
}
