<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Herramientas de Administración</title>
    @vite(['resources/js/app.jsx'])
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

            <div class="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 class="font-medium text-yellow-800 mb-2">⚠️ Importante</h3>
                <p class="text-yellow-700 text-sm">
                    Estas herramientas son temporales y deben eliminarse después de usar. Una vez corregidos los permisos, puedes volver a intentar asignar permisos desde la interfaz normal.
                </p>
            </div>
        </div>
    </div>

    <script>
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