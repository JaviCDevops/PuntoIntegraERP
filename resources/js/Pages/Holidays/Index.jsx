import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function HolidaysIndex({ auth, holidays, currentYear }) {
    const { props } = usePage();
    const csrfToken = props.csrf_token;

    const [year, setYear] = useState(currentYear);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState(null);
    const [syncOk, setSyncOk] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        name: '',
        type: 'inamovible',
        irrenunciable: false,
    });

    function changeYear(y) {
        setYear(y);
        router.get(route('holidays.index'), { year: y }, { preserveState: false });
    }

    function handleDelete(id) {
        if (!confirm('¿Eliminar este feriado?')) return;
        router.delete(route('holidays.destroy', id));
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route('holidays.store'), { onSuccess: () => reset() });
    }

    async function handleSync() {
        setSyncing(true);
        setSyncMsg(null);
        router.post(route('holidays.sync'), { year, _token: csrfToken }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setSyncOk(true);
                setSyncMsg(page.props.flash?.success ?? 'Sincronización completada.');
            },
            onError: () => {
                setSyncOk(false);
                setSyncMsg('Error al sincronizar.');
            },
            onFinish: () => setSyncing(false),
        });
    }

    const typeLabel = {
        inamovible: 'Inamovible',
        con_fines_de_semana: 'Con fines de semana',
        religioso: 'Religioso',
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Feriados Nacionales</h2>}>
            <Head title="Feriados" />

            <div className="py-8 max-w-5xl mx-auto px-4 space-y-6">

                {/* Controles de año y sincronización */}
                <div className="bg-white rounded-lg shadow p-5 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Año:</label>
                        <select
                            value={year}
                            onChange={e => changeYear(Number(e.target.value))}
                            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                        >
                            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded text-sm"
                    >
                        {syncing ? '⏳ Sincronizando...' : '🔄 Sincronizar desde API oficial'}
                    </button>

                    {syncMsg && (
                        <span className={`text-sm ${syncOk ? 'text-green-700' : 'text-red-600'}`}>
                            {syncOk ? '✅' : '❌'} {syncMsg}
                        </span>
                    )}
                </div>

                {/* Tabla de feriados */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Irrenunciable</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {holidays.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                        No hay feriados cargados para {year}. Usa el botón de sincronización.
                                    </td>
                                </tr>
                            )}
                            {holidays.map(h => (
                                <tr key={h.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-mono">{h.date}</td>
                                    <td className="px-4 py-2">{h.name}</td>
                                    <td className="px-4 py-2 text-gray-500">{typeLabel[h.type] ?? h.type}</td>
                                    <td className="px-4 py-2 text-center">
                                        {h.irrenunciable ? (
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Sí</span>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            onClick={() => handleDelete(h.id)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Agregar feriado manual */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">Agregar feriado manual</h3>
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha</label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                                required
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div className="flex-1 min-w-48">
                            <label className="block text-xs text-gray-600 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                                placeholder="Ej: Año Nuevo"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Tipo</label>
                            <select
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                            >
                                <option value="inamovible">Inamovible</option>
                                <option value="con_fines_de_semana">Con fines de semana</option>
                                <option value="religioso">Religioso</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pb-1.5">
                            <input
                                type="checkbox"
                                id="irrenunciable"
                                checked={data.irrenunciable}
                                onChange={e => setData('irrenunciable', e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="irrenunciable" className="text-sm text-gray-700">Irrenunciable</label>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded text-sm"
                        >
                            Agregar
                        </button>
                    </form>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
