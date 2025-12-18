import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, quote, clients }) {
    const { data, setData, put, processing, errors } = useForm({
        client_id: quote.client_id,
        area: quote.area || 'Ingeniería',
        description: quote.description || '',
        net_value: quote.net_value,
        valid_until: quote.valid_until,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('quotes.update', quote.id));
    };

    const iva = data.net_value ? data.net_value * 0.19 : 0;
    const total = data.net_value ? parseFloat(data.net_value) + iva : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Editar Cotización #{quote.code}</h2>}
        >
            <Head title={`Editar ${quote.code}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                                <select
                                    value={data.client_id}
                                    onChange={(e) => setData('client_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.razon_social}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Área</label>
                                    <select
                                        value={data.area}
                                        onChange={(e) => setData('area', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    >
                                        <option value="Ingeniería">Ingeniería</option>
                                        <option value="Montaje">Montaje</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                        <option value="Suministros">Suministros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descripción Corta</label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valor Neto (UF)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.net_value}
                                        onChange={(e) => setData('net_value', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-right">
                                    <div className="text-sm text-gray-500">IVA (19%): {iva.toLocaleString()}</div>
                                    <div className="text-lg font-bold text-indigo-600">Total: {total.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <Link href={route('quotes.index')} className="text-gray-600 hover:text-gray-900">Cancelar</Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}