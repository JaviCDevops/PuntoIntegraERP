import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Create({ auth, clients, areas }) { 
    const [selectedClient, setSelectedClient] = useState(null);
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false); // <--- STATE FOR MODAL

    // --- MAIN QUOTE FORM ---
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        area: '', 
        description: '',
        net_value: '',
        valid_until: '',
        reminder_date: '',
    });

    // --- AUXILIARY FORM FOR NEW AREA ---
    const { 
        data: areaData, 
        setData: setAreaData, 
        post: postArea, 
        processing: areaProcessing, 
        reset: resetArea,
        errors: areaErrors 
    } = useForm({
        name: ''
    });

    const submitArea = (e) => {
        e.preventDefault();
        postArea(route('areas.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAreaModalOpen(false);
                resetArea();
                // Inertia will automatically reload the 'areas' prop
            }
        });
    };

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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8 relative">
                        
                        <form onSubmit={submit} className="space-y-8">
                            
                            {/* SECTION 1: GENERAL DATA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* --- AREA SELECTOR WITH + BUTTON --- */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Área del Proyecto</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={data.area}
                                            onChange={(e) => setData('area', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">-- Seleccione un Área --</option>
                                            {areas.map((area) => (
                                                <option key={area.id} value={area.name}>{area.name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button"
                                            onClick={() => setIsAreaModalOpen(true)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 rounded font-bold text-lg shadow transition flex items-center justify-center"
                                            title="Crear Nueva Área"
                                        >
                                            +
                                        </button>
                                    </div>
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

                            {/* SECTION 2: CLIENT INFO (READ ONLY) */}
                            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="md:col-span-3 pb-2 border-b border-gray-200 mb-2 font-bold text-gray-500 text-xs uppercase tracking-wide">
                                    Información del Cliente (Automático)
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
                                    <label className="block text-gray-500 font-medium">Contacto / Email</label>
                                    <input type="text" readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-0 cursor-not-allowed" value={(selectedClient?.contacto_nombre || '') + ' - ' + (selectedClient?.contacto_email || '')} />
                                </div>
                            </div>

                            {/* SECTION 3: DETAIL AND BUDGET */}
                            <div className="space-y-6 pt-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Descripción del Servicio</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Describa el servicio a realizar..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    ></textarea>
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    
                                    {/* LEFT COLUMN: FINANCIAL INPUTS AND DATES */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Valor Neto (UF)</label>
                                            <div className="relative rounded-md shadow-sm">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.net_value}
                                                    onChange={(e) => setData('net_value', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 font-mono text-lg"
                                                    placeholder="0.00"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm font-bold">UF</span>
                                                </div>
                                            </div>
                                            {errors.net_value && <div className="text-red-500 text-sm mt-1">{errors.net_value}</div>}
                                        </div>

                                        {/* --- DATE BLOCK: REMINDER + EXPIRATION --- */}
                                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                                            <div>
                                                <label className="block text-xs font-bold text-pink-600 uppercase mb-1">Recordatorio</label>
                                                <input
                                                    type="date"
                                                    value={data.reminder_date}
                                                    onChange={(e) => setData('reminder_date', e.target.value)}
                                                    className="block w-full rounded-md border-pink-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
                                                />
                                                <p className="text-[10px] text-gray-500 mt-1">Aviso preventivo.</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-red-600 uppercase mb-1">Perdido (Expiración)</label>
                                                <input
                                                    type="date"
                                                    value={data.valid_until}
                                                    onChange={(e) => setData('valid_until', e.target.value)}
                                                    className="block w-full rounded-md border-red-300 focus:border-red-500 focus:ring-red-500 text-sm"
                                                />
                                                <p className="text-[10px] text-gray-500 mt-1">Fecha límite.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN: GRAPHICAL SUMMARY */}
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
                                    {processing ? 'Guardando...' : 'Crear Cotización'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            {/* --- AUXILIARY MODAL: CREATE QUICK AREA --- */}
            {isAreaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-96 border-2 border-indigo-100 transform transition-all scale-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-green-100 text-green-600 p-1 rounded text-sm">✚</span>
                            Nueva Área
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Área</label>
                            <input 
                                type="text" 
                                autoFocus
                                value={areaData.name}
                                onChange={e => setAreaData('name', e.target.value)}
                                className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ej: Mantención, Legal..."
                            />
                            {areaErrors.name && <p className="text-red-500 text-xs mt-1">{areaErrors.name}</p>}
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-3">
                            <button 
                                onClick={() => setIsAreaModalOpen(false)}
                                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 font-medium text-sm"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={submitArea}
                                disabled={areaProcessing}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 text-sm shadow-sm"
                            >
                                {areaProcessing ? 'Guardando...' : 'Guardar Área'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}