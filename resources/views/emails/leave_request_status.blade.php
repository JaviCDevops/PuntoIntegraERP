<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Actualización de solicitud de vacaciones</title>
</head>
<body style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
    <h2 style="color: #1f2937;">Actualización de tu solicitud</h2>

    <p>Hola {{ $user->name ?? 'colaborador/a' }},</p>

    <p>
        Tu solicitud de <strong>{{ ucfirst($leave->type) }}</strong>
        para el período
        <strong>{{ $leave->start_date?->format('d/m/Y') ?? '-' }} ➜ {{ $leave->end_date?->format('d/m/Y') ?? '-' }}</strong>
        ha sido
        <strong style="color: {{ $leave->status === 'aprobada' ? '#047857' : '#b91c1c' }};">
            {{ $leave->status }}
        </strong>.
    </p>

    <p><strong>Días considerados (hábiles):</strong> {{ $leave->days }}</p>

    @if($leave->reason)
        <p><strong>Motivo registrado:</strong></p>
        <p style="background: #f3f4f6; padding: 10px; border-radius: 6px;">{{ $leave->reason }}</p>
    @endif

    <p>Si tienes dudas, contacta al área de RRHH.</p>
</body>
</html>