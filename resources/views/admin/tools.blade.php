<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Herramientas de Administración</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(['resources/js/admin-tools.js'])
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-800 mb-8">Herramientas de Administración</h1>

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-700 mb-4">🔧 Corrección de Permisos de Usuario</h2>
                <p class="text-gray-600 mb-4">
                    Esta herramienta corrige problemas con los permisos de usuarios que pueden estar causando que no se guarden correctamente.
                </p>
                    <div class="border border-gray-200 rounded p-4">
                        <h3 class="font-medium text-gray-800 mb-2">Opción 3: Configurar correo de vacaciones</h3>
                        <p class="text-sm text-gray-600 mb-3">Define el correo al que se enviarán las solicitudes de vacaciones.</p>
                        <a href="{{ route('admin.vacation-email') }}" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded inline-block">
                            Configurar correo
                        </a>
                    </div>
                </div>

                <div id="results" class="mt-6 hidden">
                    <h3 class="font-medium text-gray-800 mb-2">Resultados:</h3>
                    <pre id="results-content" class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96"></pre>
                </div>
            </div>

            <!-- FERIADOS CHILE -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-700 mb-4">📅 Feriados Nacionales (Chile)</h2>
                <p class="text-gray-600 mb-4">
                    Sincroniza los feriados oficiales desde la API del Gobierno de Chile. Esto permite que el sistema descuente correctamente los días hábiles en las solicitudes de vacaciones (no se cuentan fines de semana ni feriados).
                </p>

                <div class="border border-gray-200 rounded p-4 mb-4">
                    <h3 class="font-medium text-gray-800 mb-2">Sincronizar feriados desde API oficial</h3>
                    <p class="text-sm text-gray-600 mb-3">
                        Descarga los feriados del año actual y el siguiente desde
                        <code class="bg-gray-100 px-1 rounded text-xs">apis.digital.gob.cl</code>.
                        Si ya existen, los actualiza. No elimina datos previos.
                    </p>
                    <div class="flex items-center gap-3">
                        <button onclick="syncHolidays()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                            🔄 Sincronizar ahora
                        </button>
                        <span id="sync-status" class="text-sm text-gray-500 hidden"></span>
                    </div>
                </div>

                <div class="border border-gray-200 rounded p-4">
                    <h3 class="font-medium text-gray-800 mb-2">Ver / gestionar feriados</h3>
                    <p class="text-sm text-gray-600 mb-3">Revisa los feriados cargados, agrega manualmente o elimina los que no correspondan.</p>
                    <a href="{{ route('holidays.index') }}" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block">
                        Ver feriados
                    </a>
                </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 class="font-medium text-yellow-800 mb-2">⚠️ Importante</h3>
                <p class="text-yellow-700 text-sm">
                    Estas herramientas son temporales y deben eliminarse después de usar. Una vez corregidos los permisos, puedes volver a intentar asignar permisos desde la interfaz normal.
                </p>
            </div>
        </div>
    </div>

    <script>
        async function syncHolidays() {
            const btn = document.querySelector('button[onclick="syncHolidays()"]');
            const status = document.getElementById('sync-status');

            btn.disabled = true;
            btn.textContent = '⏳ Sincronizando...';
            status.textContent = '';
            status.classList.remove('hidden', 'text-green-600', 'text-red-600');
            status.classList.add('text-gray-500');

            try {
                const response = await fetch('{{ route('holidays.sync') }}', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json',
                    },
                });

                const data = await response.json();

                status.classList.remove('text-gray-500');
                if (response.ok) {
                    status.classList.add('text-green-600');
                    status.textContent = '✅ ' + (data.message ?? 'Sincronización completada.');
                } else {
                    status.classList.add('text-red-600');
                    status.textContent = '❌ ' + (data.message ?? 'Error al sincronizar.');
                }
            } catch (error) {
                status.classList.remove('text-gray-500');
                status.classList.add('text-red-600');
                status.textContent = '❌ Error de conexión: ' + error.message;
            } finally {
                status.classList.remove('hidden');
                btn.disabled = false;
                btn.textContent = '🔄 Sincronizar ahora';
            }
        }

        async function fixAllPermissions() {
            try {
                const response = await fetch('/admin/fix-permissions');
                const data = await response.json();
                showResults(data);
            } catch (error) {
                showResults({ error: error.message });
            }
        }

        async function fixRtapiaPermissions() {
            try {
                const response = await fetch('/admin/fix-rtapia');
                const data = await response.json();
                showResults(data);
            } catch (error) {
                showResults({ error: error.message });
            }
        }

        function showResults(data) {
            const resultsDiv = document.getElementById('results');
            const resultsContent = document.getElementById('results-content');

            resultsContent.textContent = JSON.stringify(data, null, 2);
            resultsDiv.classList.remove('hidden');
        }
    </script>
</body>
</html>