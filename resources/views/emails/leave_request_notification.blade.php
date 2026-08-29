<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva solicitud de vacaciones</title>
</head>
<body style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
    @php
        $fullName = trim($employee->user->name ?? '');
        $nameParts = preg_split('/\s+/', $fullName);
        $apellido = count($nameParts) > 1 ? end($nameParts) : $fullName;
    @endphp

    <div style="margin-bottom: 16px;">
        <img src="{{ asset('logo.webp') }}" alt="{{ config('app.name') }}" style="height: 48px; width: auto;" />
    </div>

    <h2 style="color: #1f2937;">Nueva solicitud de vacaciones</h2>
    <p>Se ha registrado una nueva solicitud de vacaciones en el sistema.</p>

    <p><strong>Nombre:</strong> {{ $employee->user->name ?? 'Sin usuario asociado' }}</p>
    <p><strong>Apellido:</strong> {{ $apellido ?: '-' }}</p>
    <p><strong>RUT:</strong> {{ $employee->formatted_rut ?: ($employee->rut ?? '-') }}</p>
    <p><strong>Tipo de solicitud:</strong> {{ ucfirst($leave->type) }}</p>
    <p><strong>Período:</strong> {{ $leave->start_date?->format('d/m/Y') ?? '-' }} ➜ {{ $leave->end_date?->format('d/m/Y') ?? '-' }}</p>
    <p><strong>Días solicitados (hábiles):</strong> {{ $leave->days }}</p>
    <p><strong>Saldo de días disponible:</strong> {{ $employee->vacation_balance }} días</p>

    @if($leave->reason)
        <p><strong>Motivo:</strong></p>
        <p style="background: #f3f4f6; padding: 10px; border-radius: 6px;">{{ $leave->reason }}</p>
    @endif

    <p>Estado actual: <strong>{{ ucfirst($leave->status) }}</strong></p>

    <p>Revisa la solicitud en el sistema de RRHH.</p>
</body>
</html>
