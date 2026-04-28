<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Correo de Solicitudes de Vacaciones</title>
    @vite(['resources/js/app.jsx'])
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-4">Correo destinatario de solicitudes de vacaciones</h1>
            <p class="text-sm text-gray-600 mb-6">Solo los usuarios con acceso al módulo de Usuarios pueden ver y cambiar este correo.</p>

            @if(session('success'))
                <div class="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
                    {{ session('success') }}
                </div>
            @endif

            <form action="{{ route('admin.vacation-email.save') }}" method="POST">
                @csrf
                <label class="block text-sm font-bold text-gray-700 mb-2">Correo destinatario</label>
                <input type="email" name="vacation_email" value="{{ old('vacation_email', $vacation_email) }}" class="w-full rounded border-gray-300 p-3 mb-3 text-sm" placeholder="correo@ejemplo.cl" required />
                @error('vacation_email')
                    <p class="text-red-600 text-sm mb-3">{{ $message }}</p>
                @enderror
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">Guardar correo</button>
            </form>

            <div class="mt-6 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded p-4">
                <p><strong>Comportamiento:</strong></p>
                <ul class="list-disc list-inside mt-2">
                    <li>Si no hay correo configurado, las solicitudes se envían a todos los usuarios con permiso de Usuarios.</li>
                    <li>Una vez configurado, todas las nuevas solicitudes irán a este correo.</li>
                </ul>
            </div>

            <div class="mt-6 text-xs text-gray-500">Nota: El destinatario solo puede ser cambiado por usuarios con permiso de Usuarios.</div>
        </div>
    </div>
</body>
</html>