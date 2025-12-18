import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, employee }) {
    const [activeTab, setActiveTab] = useState('info');

    const { data, setData, put, processing } = useForm({
        position: employee.position,
        department: employee.department || '',
        phone: employee.phone || '',
        address: employee.address || '',
        base_salary: employee.base_salary,
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        put(route('rrhh.update', employee.id), { preserveScroll: true });
    };

    const { data: leaveData, setData: setLeaveData, post: postLeave, reset: resetLeave, errors: leaveErrors } = useForm({
        employee_id: employee.id,
        type: 'vacaciones',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const submitLeave = (e) => {
        e.preventDefault();
        postLeave(route('rrhh.leaves.store'), {
            onSuccess: () => resetLeave()
        });
    };

    const { data: docData, setData: setDocData, post: postDoc, progress, reset: resetDoc, errors: docErrors } = useForm({
        employee_id: employee.id,
        name: '',
        type: 'Contrato',
        file: null
    });

    const submitDoc = (e) => {
        e.preventDefault();
        postDoc(route('rrhh.documents.store'), {
            forceFormData: true,
            onSuccess: () => resetDoc()
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Expediente: {employee.user.name}</h2>}>
            <Head title={`Ficha - ${employee.user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {employee.user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold">{employee.user.name}</h3>
                                <p className="text-gray-500">{employee.position} - {employee.department}</p>
                                <p className="text-xs text-gray-400">RUT: {employee.rut}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Saldo de Vacaciones</div>
                            <div className={`text-3xl font-bold ${employee.vacation_balance > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {employee.vacation_balance} días
                            </div>
                        </div>
                    </div>

                    <div className="flex border-b border-gray-200 mb-6">
                        <button onClick={() => setActiveTab('info')} className={`px-6 py-3 font-medium text-sm ${activeTab === 'info' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Información Personal
                        </button>
                        <button onClick={() => setActiveTab('vacations')} className={`px-6 py-3 font-medium text-sm ${activeTab === 'vacations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Vacaciones y Asistencia
                        </button>
                        <button onClick={() => setActiveTab('documents')} className={`px-6 py-3 font-medium text-sm ${activeTab === 'documents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Carpeta Digital
                        </button>
                    </div>

                    {activeTab === 'info' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <form onSubmit={submitProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Datos Laborales</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Cargo</label>
                                            <input type="text" className="w-full border rounded p-2" value={data.position} onChange={e => setData('position', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Departamento</label>
                                            <input type="text" className="w-full border rounded p-2" value={data.department} onChange={e => setData('department', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sueldo Base</label>
                                            <input type="number" className="w-full border rounded p-2" value={data.base_salary} onChange={e => setData('base_salary', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Datos de Contacto</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                            <input type="text" className="w-full border rounded p-2" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                            <input type="text" className="w-full border rounded p-2" value={data.address} onChange={e => setData('address', e.target.value)} />
                                        </div>
                                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                                            <label className="block text-xs font-bold text-yellow-800 uppercase mb-1">En caso de emergencia</label>
                                            <input type="text" placeholder="Nombre contacto" className="w-full border rounded p-2 mb-2 text-sm" value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} />
                                            <input type="text" placeholder="Teléfono contacto" className="w-full border rounded p-2 text-sm" value={data.emergency_contact_phone} onChange={e => setData('emergency_contact_phone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2 flex justify-end">
                                    <button disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow">
                                        Actualizar Ficha
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'vacations' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4">Registrar Ausencia</h4>
                                <form onSubmit={submitLeave} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Tipo</label>
                                        <select className="w-full border rounded p-2" value={leaveData.type} onChange={e => setLeaveData('type', e.target.value)}>
                                            <option value="vacaciones">Vacaciones Legales</option>
                                            <option value="administrativo">Permiso Administrativo</option>
                                            <option value="licencia">Licencia Médica</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Desde</label>
                                        <input type="date" className="w-full border rounded p-2" value={leaveData.start_date} onChange={e => setLeaveData('start_date', e.target.value)} />
                                        {leaveErrors.start_date && <span className="text-red-500 text-xs">{leaveErrors.start_date}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Hasta</label>
                                        <input type="date" className="w-full border rounded p-2" value={leaveData.end_date} onChange={e => setLeaveData('end_date', e.target.value)} />
                                        {leaveErrors.end_date && <span className="text-red-500 text-xs">{leaveErrors.end_date}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Motivo (Opcional)</label>
                                        <textarea className="w-full border rounded p-2" rows="2" value={leaveData.reason} onChange={e => setLeaveData('reason', e.target.value)}></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded">
                                        Registrar
                                    </button>
                                </form>
                            </div>

                            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4">Historial de Ausencias</h4>
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-left">
                                            <th className="p-2">Tipo</th>
                                            <th className="p-2">Fechas</th>
                                            <th className="p-2">Estado</th>
                                            <th className="p-2 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.leaves.length === 0 ? (
                                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">Sin registros históricos</td></tr>
                                        ) : (
                                            employee.leaves.map(leave => (
                                                <tr key={leave.id} className="border-t hover:bg-gray-50">
                                                    <td className="p-2 capitalize">{leave.type}</td>
                                                    <td className="p-2 text-gray-600">{new Date(leave.start_date).toLocaleDateString()} al {new Date(leave.end_date).toLocaleDateString()}</td>
                                                    <td className="p-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                            ${leave.status === 'aprobada' ? 'bg-green-100 text-green-700' : ''}
                                                            ${leave.status === 'rechazada' ? 'bg-red-100 text-red-700' : ''}
                                                            ${leave.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                        `}>
                                                            {leave.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        {leave.status === 'pendiente' && auth.user.role === 'admin' ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button 
                                                                    onClick={() => router.put(route('rrhh.leaves.status', leave.id), { status: 'aprobada' })}
                                                                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                                                                >
                                                                    ✓ Aprobar
                                                                </button>
                                                                <button 
                                                                    onClick={() => router.put(route('rrhh.leaves.status', leave.id), { status: 'rechazada' })}
                                                                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                                                                >
                                                                    ✕ Rechazar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">
                                                                {leave.status === 'pendiente' ? 'Esperando aprobación' : 'Procesado'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4">Subir Documento</h4>
                                <form onSubmit={submitDoc} className="space-y-4">
                                    
                                    <div>
                                        <label className="block text-sm font-medium">Nombre del Documento</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej: Contrato 2025" 
                                            className="w-full border rounded p-2" 
                                            value={docData.name} 
                                            onChange={e => setDocData('name', e.target.value)} 
                                        />
                                        {docErrors.name && <span className="text-red-500 text-xs">{docErrors.name}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">Tipo</label>
                                        <select 
                                            className="w-full border rounded p-2 bg-white"
                                            value={docData.type}
                                            onChange={e => setDocData('type', e.target.value)}
                                        >
                                            <option value="Contrato">Contrato</option>
                                            <option value="Anexo">Anexo</option>
                                            <option value="Cédula">Cédula de Identidad</option>
                                            <option value="Certificado">Certificado</option>
                                            <option value="Liquidación">Liquidación</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                        {docErrors.type && <span className="text-red-500 text-xs">{docErrors.type}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">Archivo (PDF/IMG)</label>
                                        <input 
                                            type="file" 
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                            onChange={e => setDocData('file', e.target.files[0])} 
                                        />
                                        {docErrors.file && <span className="text-red-500 text-xs">{docErrors.file}</span>}
                                    </div>

                                    {progress && (
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                        </div>
                                    )}

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded">
                                        Subir Archivo
                                    </button>
                                </form>
                            </div>

                            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4">Carpeta Digital</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {employee.documents.length === 0 ? (
                                        <div className="col-span-2 text-center text-gray-500 py-8">La carpeta está vacía.</div>
                                    ) : (
                                        employee.documents.map(doc => (
                                            <div key={doc.id} className="border rounded p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center overflow-hidden">
                                                    <span className="text-2xl mr-3">📄</span>
                                                    <div>
                                                        <div className="font-bold text-sm truncate">{doc.name}</div>
                                                        <div className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</div>
                                                        <div className="text-xs text-blue-500 font-semibold">{doc.type}</div>
                                                    </div>
                                                </div>
                                                <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-semibold ml-2">
                                                    Descargar
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}