import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const TruckIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
const WrenchIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const DocIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default function Index({ auth, vehicles }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [activeTab, setActiveTab] = useState('info'); 
    const [currentVehicle, setCurrentVehicle] = useState(null);

    const activeVehicle = currentVehicle ? vehicles.find(v => v.id === currentVehicle.id) || currentVehicle : null;

    const { data, setData, post, put, reset, processing, errors } = useForm({
        patent: '', brand: '', model: '', year: '', current_km: '', fuel_type: '', status: 'DISPONIBLE'
    });

    const [maintData, setMaintData] = useState({ type: 'PREVENTIVA', date: '', cost: '', km_at_maintenance: '', description: '', garage_name: '' });
    const [docData, setDocData] = useState({ document_type: 'REVISIÓN TÉCNICA', expiration_date: '', file: null });

    const openCreate = () => {
        setModalMode('create');
        setCurrentVehicle(null);
        reset();
        setActiveTab('info');
        setIsModalOpen(true);
    };

    const openEdit = (vehicle) => {
        setModalMode('edit');
        setCurrentVehicle(vehicle); 
        setData({
            patent: vehicle.patent, brand: vehicle.brand, model: vehicle.model,
            year: vehicle.year, current_km: vehicle.current_km,
            fuel_type: vehicle.fuel_type, status: vehicle.status
        });
        setActiveTab('info');
        setIsModalOpen(true);
    };

    const deleteVehicle = () => {
        if (confirm(`¿Estás seguro de eliminar el vehículo ${activeVehicle.patent}? Se borrará todo su historial.`)) {
            router.delete(route('vehicles.destroy', activeVehicle.id), {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const submitVehicle = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('vehicles.store'), { onSuccess: () => setIsModalOpen(false) });
        } else {
            put(route('vehicles.update', activeVehicle.id), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const submitMaintenance = (e) => {
        e.preventDefault();
        router.post(route('vehicles.maintenance.store', activeVehicle.id), maintData, {
            onSuccess: () => setMaintData({ type: 'PREVENTIVA', date: '', cost: '', km_at_maintenance: '', description: '', garage_name: '' }),
            preserveScroll: true
        });
    };

    const submitDocument = (e) => {
        e.preventDefault();
        router.post(route('vehicles.documents.store', activeVehicle.id), {
            ...docData,
            _method: 'post'
        }, {
            forceFormData: true,
            onSuccess: () => setDocData({ document_type: 'REVISIÓN TÉCNICA', expiration_date: '', file: null }),
            preserveScroll: true
        });
    };

    const deleteDocument = (id) => {
        if(confirm('¿Borrar documento?')) {
            router.delete(route('vehicles.documents.destroy', id), { preserveScroll: true });
        }
    };

    const getDocStatusBadge = (status) => {
        switch(status) {
            case 'VIGENTE': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Vigente</span>;
            case 'POR VENCER': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Por Vencer</span>;
            case 'VENCIDO': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold animate-pulse">VENCIDO</span>;
            default: return null;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Control de Flota</h2>}>
            <Head title="Vehículos" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between mb-6">
                        <div className="text-gray-600">Gestión de vehículos, mantenimientos y documentos.</div>
                        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2">
                            <span>+</span> Nuevo Vehículo
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patente</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kilometraje</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Alertas Doc.</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Documentos</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEdit(v)}>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{v.patent}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {v.brand} {v.model} <span className="text-gray-400 text-xs">({v.year})</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{v.current_km.toLocaleString()} km</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${v.status === 'DISPONIBLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {v.documents.some(d => d.status === 'VENCIDO') ? (
                                                <span className="text-red-500 font-bold text-xs flex justify-center items-center gap-1">⚠️ Vencido</span>
                                            ) : v.documents.some(d => d.status === 'POR VENCER') ? (
                                                <span className="text-yellow-600 font-bold text-xs flex justify-center items-center gap-1">⚠️ Atento</span>
                                            ) : (
                                                <span className="text-green-400 text-xs">OK</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-400">➡️ Docs.</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                        
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {modalMode === 'create' ? 'Nuevo Vehículo' : `Ficha: ${activeVehicle?.patent}`}
                                </h3>
                                {modalMode === 'edit' && <p className="text-sm text-gray-500">{activeVehicle?.brand} {activeVehicle?.model}</p>}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
                        </div>

                        <div className="flex border-b bg-white">
                            <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 ${activeTab === 'info' ? 'border-b-4 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <TruckIcon /> Datos Vehículo
                            </button>
                            {modalMode === 'edit' && (
                                <>
                                    <button onClick={() => setActiveTab('maintenance')} className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 ${activeTab === 'maintenance' ? 'border-b-4 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        <WrenchIcon /> Mantenimientos
                                    </button>
                                    <button onClick={() => setActiveTab('docs')} className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 ${activeTab === 'docs' ? 'border-b-4 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        <DocIcon /> Documentación
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                            {activeTab === 'info' && (
                                <form onSubmit={submitVehicle} className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Patente <span className="text-red-500">*</span></label>
                                            <input type="text" required value={data.patent} onChange={e => setData('patent', e.target.value.toUpperCase())} className="w-full border-gray-300 rounded" disabled={modalMode === 'edit'} />
                                            {errors.patent && <div className="text-red-500 text-xs">{errors.patent}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Tipo Combustible <span className="text-red-500">*</span></label>
                                            <select required value={data.fuel_type} onChange={e => setData('fuel_type', e.target.value)} className="w-full border-gray-300 rounded">
                                                <option value="">Seleccione...</option>
                                                <option value="DIESEL">DIESEL</option>
                                                <option value="GASOLINA">GASOLINA</option>
                                                <option value="ELECTRICO">ELÉCTRICO</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Marca <span className="text-red-500">*</span></label>
                                            <input type="text" required value={data.brand} onChange={e => setData('brand', e.target.value)} className="w-full border-gray-300 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Modelo <span className="text-red-500">*</span></label>
                                            <input type="text" required value={data.model} onChange={e => setData('model', e.target.value)} className="w-full border-gray-300 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Año <span className="text-red-500">*</span></label>
                                            <input type="number" required value={data.year} onChange={e => setData('year', e.target.value)} className="w-full border-gray-300 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Kilometraje Actual <span className="text-red-500">*</span></label>
                                            <input type="number" required value={data.current_km} onChange={e => setData('current_km', e.target.value)} className="w-full border-gray-300 rounded font-mono" />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Estado Operativo</label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-green-50">
                                                <input type="radio" name="status" value="DISPONIBLE" checked={data.status === 'DISPONIBLE'} onChange={e => setData('status', e.target.value)} />
                                                <span className="text-green-700 font-bold text-sm">🟢 Disponible</span>
                                            </label>
                                            <label className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-red-50">
                                                <input type="radio" name="status" value="EN TALLER" checked={data.status === 'EN TALLER'} onChange={e => setData('status', e.target.value)} />
                                                <span className="text-red-700 font-bold text-sm">🔴 En Taller</span>
                                            </label>
                                            <label className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-yellow-50">
                                                <input type="radio" name="status" value="EN RUTA" checked={data.status === 'EN RUTA'} onChange={e => setData('status', e.target.value)} />
                                                <span className="text-yellow-700 font-bold text-sm">🚚 En Ruta</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-6">
                                        {modalMode === 'edit' && (
                                            <button 
                                                type="button" 
                                                onClick={deleteVehicle} 
                                                className="text-red-500 hover:text-red-700 font-bold text-sm underline"
                                            >
                                                Eliminar Vehículo
                                            </button>
                                        )}
                                        
                                        <button type="submit" disabled={processing} className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded ${modalMode === 'create' ? 'w-full' : ''}`}>
                                            {modalMode === 'create' ? 'Crear Vehículo' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'maintenance' && (
                                <div className="space-y-6">
                                    <form onSubmit={submitMaintenance} className="bg-white p-4 rounded shadow border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-3 text-sm uppercase">Registrar Nuevo Evento</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                            <select required value={maintData.type} onChange={e => setMaintData({...maintData, type: e.target.value})} className="border-gray-300 rounded text-sm">
                                                <option value="PREVENTIVA">MANT. PREVENTIVA</option>
                                                <option value="CORRECTIVA">REPARACIÓN (Correctiva)</option>
                                            </select>
                                            <input type="date" required value={maintData.date} onChange={e => setMaintData({...maintData, date: e.target.value})} className="border-gray-300 rounded text-sm" />
                                            <input type="number" required placeholder="KM al momento" value={maintData.km_at_maintenance} onChange={e => setMaintData({...maintData, km_at_maintenance: e.target.value})} className="border-gray-300 rounded text-sm" />
                                            <input type="number" required placeholder="Costo ($)" value={maintData.cost} onChange={e => setMaintData({...maintData, cost: e.target.value})} className="border-gray-300 rounded text-sm" />
                                            <input type="text" required placeholder="Nombre Taller" value={maintData.garage_name} onChange={e => setMaintData({...maintData, garage_name: e.target.value})} className="border-gray-300 rounded text-sm md:col-span-2" />
                                            <textarea required placeholder="Descripción del trabajo..." value={maintData.description} onChange={e => setMaintData({...maintData, description: e.target.value})} className="border-gray-300 rounded text-sm md:col-span-3" rows="2"></textarea>
                                        </div>
                                        <button type="submit" className="bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded hover:bg-indigo-700 w-full md:w-auto">
                                            Guardar Historial
                                        </button>
                                    </form>

                                    <div className="bg-white rounded shadow overflow-hidden">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-gray-100 text-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Fecha</th>
                                                    <th className="px-4 py-2 text-left">Tipo</th>
                                                    <th className="px-4 py-2 text-left">Descripción</th>
                                                    <th className="px-4 py-2 text-right">KM</th>
                                                    <th className="px-4 py-2 text-right">Costo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {activeVehicle?.maintenances && activeVehicle.maintenances.length > 0 ? (
                                                    activeVehicle.maintenances.map(m => (
                                                        <tr key={m.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2">{m.date}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.type === 'PREVENTIVA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                                                    {m.type}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <div className="font-bold">{m.garage_name}</div>
                                                                <div className="text-gray-500 text-xs">{m.description}</div>
                                                            </td>
                                                            <td className="px-4 py-2 text-right font-mono">{m.km_at_maintenance}</td>
                                                            <td className="px-4 py-2 text-right font-bold text-green-700">${parseInt(m.cost).toLocaleString()}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Sin registros de mantenimiento.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="space-y-6">
                                    <form onSubmit={submitDocument} className="bg-white p-4 rounded shadow border border-green-100">
                                        <h4 className="font-bold text-green-800 mb-3 text-sm uppercase border-b pb-2">Nuevo Documento</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Documento</label>
                                                <select required value={docData.document_type} onChange={e => setDocData({...docData, document_type: e.target.value})} className="w-full border-gray-300 rounded text-sm">
                                                    <option>REVISIÓN TÉCNICA</option>
                                                    <option>PERMISO DE CIRCULACIÓN</option>
                                                    <option>SOAP (SEGURO OBLIGATORIO)</option>
                                                    <option>CERTIFICADO DE GASES</option>
                                                    <option>PADRÓN (INSCRIPCIÓN)</option>
                                                    <option>SEGURO COMPLEMENTARIO</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Fecha Vencimiento <span className="font-normal text-gray-400">(Opcional)</span></label>
                                                <input type="date" value={docData.expiration_date} onChange={e => setDocData({...docData, expiration_date: e.target.value})} className="w-full border-gray-300 rounded text-sm" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Adjuntar Archivo <span className="text-red-500">*</span></label>
                                                <input type="file" required onChange={e => setDocData({...docData, file: e.target.files[0]})} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" accept=".pdf,.jpg,.jpeg,.png" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 text-sm">Subir Documento</button>
                                    </form>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeVehicle?.documents && activeVehicle.documents.map(doc => (
                                            <div key={doc.id} className="bg-white p-4 rounded shadow border-l-4 border-gray-300 flex justify-between items-center group hover:border-blue-400 transition">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-800 text-sm">{doc.document_type}</h5>
                                                    {doc.expiration_date ? <p className="text-xs text-gray-500 mt-1">Vence: {doc.expiration_date}</p> : <p className="text-xs text-gray-400 mt-1 italic">Sin vencimiento</p>}
                                                    <div className="mt-2 flex items-center gap-2">
                                                        {getDocStatusBadge(doc.status)}
                                                        {doc.file_path && <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 flex items-center gap-1">📄 Ver Archivo</a>}
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteDocument(doc.id)} className="text-gray-300 hover:text-red-500 font-bold p-2 ml-2" title="Eliminar documento">🗑️</button>
                                            </div>
                                        ))}
                                    </div>
                                    {(!activeVehicle?.documents || activeVehicle.documents.length === 0) && (
                                        <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                                            <p className="text-gray-400">No hay documentación cargada.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}