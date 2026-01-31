import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Recibimos 'areas' y 'quote' desde el controlador
export default function Edit({ auth, quote, clients, areas }) {
    
    // Inicializamos el cliente seleccionado basado en la cotización guardada
    const [selectedClient, setSelectedClient] = useState(
        clients.find(c => c.id === quote.client_id) || null
    );

    const { data, setData, put, processing, errors } = useForm({
        client_id: quote.client_id,
        area: quote.area || '', 
        description: quote.description || '',
        net_value: quote.net_value,
        valid_until: quote.valid_until ? quote.valid_until.split('T')[0] : '',
        reminder_date: quote.reminder_date ? quote.reminder_date.split('T')[0] : '',        
    });

    // Actualizar info visual del cliente si cambian la selección
    useEffect(() => {
        if (data.client_id) {
            const clientFound = clients.find(c => c.id == data.client_id);
            setSelectedClient(clientFound || null);
        }
    }, [data.client_id]);

    const submit = (e) => {
        e.preventDefault();
        put(route('quotes.update', quote.id));
    };

    const iva = data.net_value ? data.net_value * 0.19 : 0;
    const total = data.net_value ? parseFloat(data.net_value) + iva : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Editar Cotización <span className="text-indigo-600">#{quote.code}</span>
                    </h2>
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider
                        ${quote.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${quote.status === 'enviada' ? 'bg-blue-100 text-blue-800' : ''}
                        ${quote.status === 'adjudicada' ? 'bg-green-100 text-green-800' : ''}
                        ${quote.status === 'perdida' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                        {quote.status}
                    </span>
                </div>
            }
        >
            <Head title={`Editar Cotización ${quote.code}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        
                        <form onSubmit={submit} className="space-y-8">
                            
                            {/* SECCIÓN 1: DATOS GENERALES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
                                        Área del Proyecto <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.area}
                                        onChange={(e) => setData('area', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">-- Seleccione un Área --</option>
                                        {/* Selector dinámico desde la BD */}
                                        {areas.map((area) => (
                                            <option key={area.id} value={area.name}>{area.name}</option>
                                        ))}
                                    </select>
                                    {errors.area && <div className="text-red-500 text-sm mt-1">{errors.area}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
                                        Cliente Empresa <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
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

                            {/* SECCIÓN 2: INFO CLIENTE (SOLO LECTURA) */}
                            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="md:col-span-3 pb-2 border-b border-gray-200 mb-2 font-bold text-gray-500 text-xs uppercase tracking-wide">
                                    Información del Cliente
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">R.U.T</label>
                                    <input type="text" readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed" value={selectedClient?.rut || ''} />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">Giro Comercial</label>
                                    <input type="text" readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed" value={selectedClient?.giro || ''} />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">Teléfono Central</label>
                                    <input type="text" readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed" value={selectedClient?.telefono || ''} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-500 font-medium">Dirección Comercial</label>
                                    <input type="text" readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed" value={selectedClient?.direccion || ''} />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-medium">Contacto</label>
                                    <input type="text" readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed" value={selectedClient?.contacto_nombre || ''} />
                                </div>
                            </div>

                            {/* SECCIÓN 3: DETALLE Y PRESUPUESTO */}
                            <div className="space-y-6 pt-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
                                        Descripción del Servicio <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Describa el servicio a realizar..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    ></textarea>
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>

                                {/* INPUTS FINANCIEROS Y FECHAS (Reorganizados) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
                                                Valor Neto (UF) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative rounded-md shadow-sm">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.net_value}
                                                    onChange={(e) => setData('net_value', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 font-mono text-lg"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm font-bold">UF</span>
                                                </div>
                                            </div>
                                            {errors.net_value && <div className="text-red-500 text-sm mt-1">{errors.net_value}</div>}
                                        </div>

                                        <div className="bg-orange-50 p-3 rounded border border-orange-200">
                                            <label className="block text-sm font-bold text-orange-800 uppercase mb-1">
                                                Válido Hasta (Expiración) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.valid_until}
                                                onChange={(e) => setData('valid_until', e.target.value)}
                                                className="block w-full rounded-md border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* RESUMEN GRÁFICO */}
                                    <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-center h-full">
                                        <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-4 border-b pb-2">Resumen Financiero</h3>
                                        
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Monto Neto:</span>
                                            <span className="font-mono">{parseFloat(data.net_value || 0).toLocaleString()} UF</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                                            <span>IVA (19%):</span>
                                            <span className="font-mono">{iva.toLocaleString()} UF</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-3xl text-indigo-700 mt-2 pt-4 border-t border-gray-100">
                                            <span className="text-lg self-center">Total:</span>
                                            <span>{total.toLocaleString()} <span className="text-sm text-indigo-400 font-medium">UF</span></span>
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
                                    className="px-6 py-2 bg-indigo-600 border border-transparent rounded-md font-bold text-white uppercase tracking-widest hover:bg-indigo-700 shadow-lg transform active:scale-95 transition-all"
                                >
                                    {processing ? 'Guardando...' : 'Actualizar Cotización'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}