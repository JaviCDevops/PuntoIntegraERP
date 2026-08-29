<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Vacaciones - {{ $employee->user->name }}</title>
    <style>
        body { font-family: sans-serif; font-size: 13px; color: #333; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: bold; color: #1e40af; }
        .meta { color: #666; font-size: 12px; margin-top: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #eff6ff; color: #1e3a8a; font-size: 11px; text-transform: uppercase; }
        .summary { background: #f0fdf4; border: 1px solid #86efac; padding: 12px; margin-bottom: 20px; }
        .summary strong { color: #166534; font-size: 18px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Informe de Vacaciones</div>
        <div class="meta">
            Colaborador: <strong>{{ $employee->user->name }}</strong> |
            RUT: {{ $employee->formatted_rut ?? $employee->rut }} |
            Cargo: {{ $employee->position ?? '-' }} |
            Generado: {{ now()->format('d/m/Y H:i') }}
        </div>
    </div>

    <div class="summary">
        Saldo actual (año {{ now()->year }}):
        <strong>{{ number_format($currentBalance, 1, ',', '.') }} días hábiles</strong>
    </div>

    <h3>Resumen por Periodo (Año Calendario)</h3>
    <table>
        <thead>
            <tr>
                <th>Año</th>
                <th>Periodo</th>
                <th>Días Ganados</th>
                <th>Días Tomados</th>
                <th>Saldo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($vacationPeriods as $period)
                <tr>
                    <td>{{ $period['year'] }}</td>
                    <td>{{ $period['period_start'] }} - {{ $period['period_end'] }}</td>
                    <td>{{ $period['earned'] }}</td>
                    <td>{{ $period['taken'] }}</td>
                    <td>{{ $period['balance'] }}</td>
                </tr>
            @empty
                <tr><td colspan="5">Sin periodos registrados.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3>Histórico de Solicitudes de Vacaciones</h3>
    <table>
        <thead>
            <tr>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Días Hábiles</th>
                <th>Estado</th>
                <th>Motivo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($vacationLeaves as $leave)
                <tr>
                    <td>{{ $leave->start_date->format('d/m/Y') }}</td>
                    <td>{{ $leave->end_date->format('d/m/Y') }}</td>
                    <td>{{ $leave->days }}</td>
                    <td>{{ ucfirst($leave->status) }}</td>
                    <td>{{ $leave->reason ?? '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="5">No hay solicitudes de vacaciones registradas.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">PuntoIntegra ERP — Informe de Vacaciones</div>
</body>
</html>
