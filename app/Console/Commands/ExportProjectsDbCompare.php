<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportProjectsDbCompare extends Command
{
    protected $signature = 'projects:export-db-compare
        {--old=mysql_old : Conexión de base de datos antigua}
        {--new=mysql : Conexión de base de datos nueva}
        {--dir=reports : Carpeta dentro de storage/app para los CSV}';

    protected $description = 'Exporta información de proyectos desde BD antigua y nueva, ordenada por código, cliente y descripción.';

    public function handle(): int
    {
        $oldConnection = (string) $this->option('old');
        $newConnection = (string) $this->option('new');
        $directory = trim((string) $this->option('dir'), '/');

        try {
            $oldRows = $this->fetchProjects($oldConnection, 'old');
            $newRows = $this->fetchProjects($newConnection, 'new');
        } catch (\Throwable $exception) {
            $this->error('No se pudo leer una de las conexiones: ' . $exception->getMessage());
            return self::FAILURE;
        }

        $this->sortRows($oldRows);
        $this->sortRows($newRows);

        $allRows = [...$oldRows, ...$newRows];
        $this->sortRows($allRows);

        $timestamp = now()->format('Ymd_His');
        $basePath = storage_path('app/' . $directory);

        if (!is_dir($basePath)) {
            mkdir($basePath, 0755, true);
        }

        $oldFile = $basePath . "/projects_old_{$timestamp}.csv";
        $newFile = $basePath . "/projects_new_{$timestamp}.csv";
        $allFile = $basePath . "/projects_compare_{$timestamp}.csv";

        $this->writeCsv($oldFile, $oldRows);
        $this->writeCsv($newFile, $newRows);
        $this->writeCsv($allFile, $allRows);

        $this->info('✅ Exportación completada');
        $this->line("- Antigua: {$oldFile}");
        $this->line("- Nueva: {$newFile}");
        $this->line("- Combinado: {$allFile}");

        return self::SUCCESS;
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function fetchProjects(string $connection, string $source): array
    {
        $projectTable = 'projects';

        if (!Schema::connection($connection)->hasTable($projectTable)) {
            throw new \RuntimeException("La conexión {$connection} no contiene la tabla {$projectTable}.");
        }

        $projectColumns = Schema::connection($connection)->getColumnListing('projects');
        $quoteColumns = Schema::connection($connection)->hasTable('quotes')
            ? Schema::connection($connection)->getColumnListing('quotes')
            : [];
        $clientColumns = Schema::connection($connection)->hasTable('clients')
            ? Schema::connection($connection)->getColumnListing('clients')
            : [];

        $descriptionExpression = $this->buildDescriptionExpression($projectColumns, $quoteColumns);
        $clientExpression = $this->buildClientExpression($projectColumns, $clientColumns);

        $query = DB::connection($connection)
            ->table('projects')
            ->leftJoin('quotes', 'projects.quote_id', '=', 'quotes.id');

        if (Schema::connection($connection)->hasTable('clients')) {
            $query->leftJoin('clients as quote_clients', 'quotes.client_id', '=', 'quote_clients.id');

            if (in_array('client_id', $projectColumns, true)) {
                $query->leftJoin('clients as project_clients', 'projects.client_id', '=', 'project_clients.id');
            }
        }

        $rows = $query
            ->selectRaw("COALESCE(projects.code, '') as project_code")
            ->selectRaw("{$clientExpression} as client")
            ->selectRaw("{$descriptionExpression} as description")
            ->get();

        return $rows->map(function ($row) use ($source, $connection) {
            return [
                'source' => $source,
                'connection' => $connection,
                'project_code' => trim((string) ($row->project_code ?? '')),
                'client' => trim((string) ($row->client ?? '')),
                'description' => trim((string) ($row->description ?? '')),
            ];
        })->all();
    }

    private function buildDescriptionExpression(array $projectColumns, array $quoteColumns): string
    {
        $parts = [];

        if (in_array('name', $projectColumns, true)) {
            $parts[] = 'projects.name';
        }

        if (in_array('description', $projectColumns, true)) {
            $parts[] = 'projects.description';
        }

        if (in_array('description', $quoteColumns, true)) {
            $parts[] = 'quotes.description';
        }

        if (in_array('name', $quoteColumns, true)) {
            $parts[] = 'quotes.name';
        }

        if (empty($parts)) {
            return "''";
        }

        return 'COALESCE(' . implode(', ', $parts) . ", '')";
    }

    private function buildClientExpression(array $projectColumns, array $clientColumns): string
    {
        if (empty($clientColumns) || !in_array('razon_social', $clientColumns, true)) {
            return "''";
        }

        if (in_array('client_id', $projectColumns, true)) {
            return "COALESCE(project_clients.razon_social, quote_clients.razon_social, '')";
        }

        return "COALESCE(quote_clients.razon_social, '')";
    }

    /**
     * @param array<int, array<string, string>> $rows
     */
    private function sortRows(array &$rows): void
    {
        usort($rows, function (array $a, array $b) {
            $codeCompare = strnatcasecmp($a['project_code'], $b['project_code']);
            if ($codeCompare !== 0) {
                return $codeCompare;
            }

            $clientCompare = strcasecmp($a['client'], $b['client']);
            if ($clientCompare !== 0) {
                return $clientCompare;
            }

            return strcasecmp($a['description'], $b['description']);
        });
    }

    /**
     * @param array<int, array<string, string>> $rows
     */
    private function writeCsv(string $filePath, array $rows): void
    {
        $file = fopen($filePath, 'w');

        if ($file === false) {
            throw new \RuntimeException("No se pudo crear el archivo {$filePath}");
        }

        fputcsv($file, ['source', 'connection', 'project_code', 'client', 'description']);

        foreach ($rows as $row) {
            fputcsv($file, [
                $row['source'],
                $row['connection'],
                $row['project_code'],
                $row['client'],
                $row['description'],
            ]);
        }

        fclose($file);
    }
}
