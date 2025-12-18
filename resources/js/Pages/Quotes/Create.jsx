import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Create({ auth, clients }) {
    const [selectedClient, setSelectedClient] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        area: 'Ingeniería', 
        description: '',
        net_value: '',
        valid_until: '',
    });

    useEffect(() => {
        if (data.client_id) {
            const clientFound = clients.find(c => c.id == data.client_id);
            setSelectedClient(clientFound || null);
        } else {
            setSelectedClient(null);
        }
    }, [data.client_id]);

    const submit = (e) => {
        e.preventDefault();
        post(route('quotes.store'));
    };

    const iva = data.net_value ? data.net_value * 0.19 : 0;
    const total = data.net_value ? parseFloat(data.net_value) + iva : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Nueva Cotización</h2>}
        >
            <Head title="Crear Cotización" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Área del Proyecto</label>
                                    <select
                                        value={data.area}
                                        onChange={(e) => setData('area', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="Ingeniería">Ingeniería</option>
                                        <option value="Montaje">Montaje</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                        <option value="Suministros">Suministros</option>
                                    </select>
                                    {errors.area && <div className="text-red-500 text-sm mt-1">{errors.area}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Cliente Empresa</label>
                                    <select
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">-- Buscar Cliente Guardado --</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.razon_social}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.client_id && <div className="text-red-500 text-sm mt-1">{errors.client_id}</div>}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="md:col-span-3 pb-2 border-b border-gray-200 mb-2 font-bold text-gray-500 text-xs uppercase tracking-wide">
                                    Información del Cliente (Automático)
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">R.U.T</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed"
                                        value={selectedClient?.rut || ''}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">Giro Comercial</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed"
                                        value={selectedClient?.giro || ''}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">Teléfono Central</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed"
                                        value={selectedClient?.telefono || ''}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-500 font-medium">Dirección Comercial</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed"
                                        value={selectedClient?.direccion || ''}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">Contacto</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed"
                                        value={selectedClient?.contacto_nombre || ''}
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-gray-500 font-medium">Email Contacto</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed"
                                        value={selectedClient?.contacto_email || ''}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Detalle del Servicio</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Describa el servicio a realizar..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    ></textarea>
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Neto en UF</label>
                                            <div className="relative rounded-md shadow-sm">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.net_value}
                                                    onChange={(e) => setData('net_value', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="0.00"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm font-bold">UF</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Válido Hasta</label>
                                            <input
                                                type="date"
                                                value={data.valid_until}
                                                onChange={(e) => setData('valid_until', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-center">
                                        <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-4 border-b pb-2">Resumen Cotización</h3>
                                        
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Monto Neto:</span>
                                            <span className="font-mono">{parseFloat(data.net_value || 0).toLocaleString()} UF</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                                            <span>IVA (19%):</span>
                                            <span className="font-mono">{iva.toLocaleString()} UF</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-2xl text-indigo-700">
                                            <span>Total:</span>
                                            <span>{total.toLocaleString()} <span className="text-sm text-indigo-400">UF</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 border-t pt-6 border-gray-100">
                                <Link href={route('quotes.index')} className="px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition">
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    {processing ? 'Guardando...' : 'Crear Cotización'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}