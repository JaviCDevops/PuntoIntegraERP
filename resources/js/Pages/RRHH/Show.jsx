import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, employee, canManageUsers, vacationPeriods = [], currentVacationBalance }) {
    const [activeTab, setActiveTab] = useState('info');

    // --- FORMATO DE FECHA CONSISTENTE (Día/Mes/Año) ---
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    // --- FORMULARIO DE VACACIONES (Se mantiene) ---
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

    // --- FORMULARIO DE DOCUMENTOS (Se mantiene) ---
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

    // Función auxiliar para formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Expediente Digital</h2>}>
            <Head title={`Ficha - ${employee.user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- ENCABEZADO DE PERFIL --- */}
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-100">
                        <div className="flex items-center">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                {employee.user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900">{employee.user.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="font-semibold text-blue-700">{employee.position}</span>
                                    <span>•</span>
                                    <span>{employee.department || 'General'}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-100 inline-block px-1 rounded">RUT: {employee.rut}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Saldo Vacaciones</div>
                                <div className={`text-3xl font-bold ${(currentVacationBalance ?? employee.vacation_balance) > 5 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                    {Number(currentVacationBalance ?? employee.vacation_balance).toFixed(1)} <span className="text-sm text-gray-400 font-normal">días hábiles</span>
                                </div>
                            </div>
                            
                            {/* Botón para ir a Editar al Módulo de Usuarios */}
                            {canManageUsers && (
                                <div className="border-l pl-6">
                                    <Link 
                                        href={route('users.edit', employee.user.id)}
                                        className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 transition group"
                                        title="Editar Datos Maestros"
                                    >
                                        <div className="p-2 bg-gray-100 rounded-full group-hover:bg-indigo-100 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-bold mt-1">Editar Ficha</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- NAVEGACIÓN DE TABS --- */}
                    <div className="bg-white rounded-t-lg border-b border-gray-200 flex overflow-x-auto">
                        <button onClick={() => setActiveTab('info')} className={`px-6 py-4 font-bold text-sm border-b-2 transition ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Información Personal
                        </button>
                        <button onClick={() => setActiveTab('vacations')} className={`px-6 py-4 font-bold text-sm border-b-2 transition ${activeTab === 'vacations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Vacaciones y Asistencia
                        </button>
                        <button onClick={() => setActiveTab('documents')} className={`px-6 py-4 font-bold text-sm border-b-2 transition ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Carpeta Digital
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-b-lg shadow-sm min-h-[400px]">
                        
                        {/* --- TAB 1: INFORMACIÓN (SOLO LECTURA) --- */}
                        {activeTab === 'info' && (
                            <div className="animate-fade-in-up">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-sm">Modo Lectura</h4>
                                        <p className="text-blue-700 text-xs">
                                            Para modificar estos datos (Sueldo, Cargo, Dirección), debes ir al módulo de 
                                            <Link href={route('users.edit', employee.user.id)} className="underline font-bold ml-1 hover:text-blue-900">Usuarios</Link>.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 uppercase text-xs tracking-wider">Datos Laborales</h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3">
                                                <span className="text-sm text-gray-500">Cargo:</span>
                                                <span className="col-span-2 text-sm font-medium text-gray-900">{employee.position}</span>
                                            </div>
                                            <div className="grid grid-cols-3">
                                                <span className="text-sm text-gray-500">Departamento:</span>
                                                <span className="col-span-2 text-sm font-medium text-gray-900">{employee.department || '-'}</span>
                                            </div>
                                            <div className="grid grid-cols-3">
                                                <span className="text-sm text-gray-500">Fecha Ingreso:</span>
                                                <span className="col-span-2 text-sm font-medium text-gray-900">
                                                    {employee.hire_date ? formatDate(employee.hire_date) : '-'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3">
                                                <span className="text-sm text-gray-500">Sueldo Base:</span>
                                                <span className="col-span-2 text-sm font-medium text-gray-900 font-mono">
                                                    {employee.base_salary ? formatCurrency(employee.base_salary) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 uppercase text-xs tracking-wider">Datos de Contacto</h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3">
                                                <span className="text-sm text-gray-500">Email:</span>
                                                <span className="col-span-2 text-sm font-medium text-gray-900">{employee.user.email}</span>
                                            </div>
                                            <div className="grid grid-cols-3">
                                                <span className="text-sm text-gray-500">Teléfono:</span>
                                                <span className="col-span-2 text-sm font-medium text-gray-900">{employee.phone || 'No registrado'}</span>
                                            </div>
                                            <div className="grid grid-cols-3">
                                                <span className="text-sm text-gray-500">Dirección:</span>
                                                <span className="col-span-2 text-sm font-medium text-gray-900">{employee.address || 'No registrada'}</span>
                                            </div>
                                            
                                            <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-100">
                                                <span className="block text-xs font-bold text-yellow-800 uppercase mb-1">Contacto Emergencia</span>
                                                <div className="text-sm text-gray-800 font-bold">{employee.emergency_contact_name || 'Sin información'}</div>
                                                <div className="text-sm text-gray-600">{employee.emergency_contact_phone}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 2: VACACIONES (FUNCIONAL) --- */}
                        {activeTab === 'vacations' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Informe de Vacaciones */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-lg flex items-center gap-2">
                                            <span>📋</span> Informe de Vacaciones — Año {new Date().getFullYear()}
                                        </h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Saldo actual: <strong>{Number(currentVacationBalance ?? employee.vacation_balance).toFixed(1)} días hábiles</strong>
                                            {' · '}Periodo calendario: 01/01/{new Date().getFullYear()} - 31/12/{new Date().getFullYear()}
                                        </p>
                                    </div>
                                    <a
                                        href={route('rrhh.vacations.pdf', employee.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg shadow transition text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Exportar a PDF
                                    </a>
                                </div>

                                {/* Resumen por Periodo */}
                                {vacationPeriods.length > 0 && (
                                    <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm">
                                        <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                            <span>📊</span> Resumen de Vacaciones por Periodo
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm divide-y divide-gray-200">
                                                <thead className="bg-blue-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-bold text-gray-500">Periodo</th>
                                                        <th className="px-4 py-2 text-center font-bold text-gray-500">Días Ganados</th>
                                                        <th className="px-4 py-2 text-center font-bold text-gray-500">Días Tomados</th>
                                                        <th className="px-4 py-2 text-center font-bold text-gray-500">Saldo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {vacationPeriods.map((period, idx) => (
                                                        <tr key={idx} className={period.is_current ? 'bg-blue-50/50' : ''}>
                                                            <td className="px-4 py-3 text-gray-700">
                                                                <span className="font-bold">Año {period.year ?? period.year_index}</span>
                                                                <span className="text-xs text-gray-500 ml-2">({period.period_start} - {period.period_end})</span>
                                                                {period.is_current && <span className="ml-2 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">Actual</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-center font-medium text-gray-700">{period.earned}</td>
                                                            <td className="px-4 py-3 text-center font-medium text-gray-700">{period.taken}</td>
                                                            <td className={`px-4 py-3 text-center font-bold ${period.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{period.balance}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Formulario */}
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 h-fit">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span>📅</span> Registrar Ausencia
                                    </h4>
                                    <form onSubmit={submitLeave} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                                Tipo <span className="text-red-500">*</span>
                                            </label>
                                            <select required className="w-full border-gray-300 rounded text-sm focus:ring-blue-500" value={leaveData.type} onChange={e => setLeaveData('type', e.target.value)}>
                                                <option value="vacaciones">Vacaciones Legales</option>
                                                <option value="administrativo">Permiso Administrativo</option>
                                                <option value="licencia">Licencia Médica</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                                    Desde <span className="text-red-500">*</span>
                                                </label>
                                                <input type="date" required className="w-full border-gray-300 rounded text-sm" value={leaveData.start_date} onChange={e => setLeaveData('start_date', e.target.value)} />
                                                {leaveErrors.start_date && <span className="text-red-500 text-[10px]">{leaveErrors.start_date}</span>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                                    Hasta <span className="text-red-500">*</span>
                                                </label>
                                                <input type="date" required className="w-full border-gray-300 rounded text-sm" value={leaveData.end_date} onChange={e => setLeaveData('end_date', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Motivo (Opcional)</label>
                                            <textarea className="w-full border-gray-300 rounded text-sm" rows="2" value={leaveData.reason} onChange={e => setLeaveData('reason', e.target.value)}></textarea>
                                        </div>
                                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow transition text-sm">
                                            Registrar Solicitud
                                        </button>
                                    </form>
                                </div>

                                {/* Tabla Historial */}
                                <div className="md:col-span-2">
                                    <h4 className="font-bold text-gray-800 mb-4">Historial de Solicitudes</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full text-sm divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-bold text-gray-500">Tipo</th>
                                                    <th className="px-4 py-2 text-left font-bold text-gray-500">Periodo</th>
                                                    <th className="px-4 py-2 text-center font-bold text-gray-500">Días</th>
                                                    <th className="px-4 py-2 text-center font-bold text-gray-500">Estado</th>
                                                    <th className="px-4 py-2 text-right font-bold text-gray-500">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {employee.leaves.length === 0 ? (
                                                    <tr><td colSpan="5" className="p-4 text-center text-gray-400 italic">No hay registros</td></tr>
                                                ) : (
                                                    employee.leaves.map(leave => (
                                                        <tr key={leave.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 capitalize">{leave.type}</td>
                                                            <td className="px-4 py-3 text-gray-600">
                                                                {formatDate(leave.start_date)} <span className="text-gray-400">➜</span> {formatDate(leave.end_date)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center font-bold text-gray-700">
                                                                {leave.days != null ? Math.round(leave.days) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide
                                                                    ${leave.status === 'aprobada' ? 'bg-green-100 text-green-700' : ''}
                                                                    ${leave.status === 'rechazada' ? 'bg-red-100 text-red-700' : ''}
                                                                    ${leave.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                                `}>
                                                                    {leave.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                {leave.status === 'pendiente' && canManageUsers ? (
                                                                    <div className="flex justify-end gap-1">
                                                                        <button onClick={() => router.put(route('rrhh.leaves.status', leave.id), { status: 'aprobada' })} className="bg-green-100 hover:bg-green-200 text-green-700 p-1 rounded" title="Aprobar">
                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                                        </button>
                                                                        <button onClick={() => router.put(route('rrhh.leaves.status', leave.id), { status: 'rechazada' })} className="bg-red-100 hover:bg-red-200 text-red-700 p-1 rounded" title="Rechazar">
                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-300 text-xs">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* --- TAB 3: DOCUMENTOS (FUNCIONAL) --- */}
                        {activeTab === 'documents' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 h-fit">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span>📂</span> Subir Documento
                                    </h4>
                                    <form onSubmit={submitDoc} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                                Nombre <span className="text-red-500">*</span>
                                            </label>
                                            <input type="text" required placeholder="Ej: Contrato Marzo 2025" className="w-full border-gray-300 rounded text-sm" value={docData.name} onChange={e => setDocData('name', e.target.value)} />
                                            {docErrors.name && <span className="text-red-500 text-[10px]">{docErrors.name}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                                Tipo <span className="text-red-500">*</span>
                                            </label>
                                            <select required className="w-full border-gray-300 rounded text-sm bg-white" value={docData.type} onChange={e => setDocData('type', e.target.value)}>
                                                <option value="Contrato">Contrato</option>
                                                <option value="Anexo">Anexo</option>
                                                <option value="Cédula">Cédula de Identidad</option>
                                                <option value="Licencia Médica">Licencia Médica</option>
                                                <option value="Certificado">Certificado</option>
                                                <option value="Liquidación">Liquidación</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                                Archivo <span className="text-red-500">*</span>
                                            </label>
                                            <input type="file" required className="w-full text-xs" onChange={e => setDocData('file', e.target.files[0])} />
                                            {docErrors.file && <span className="text-red-500 text-[10px]">{docErrors.file}</span>}
                                        </div>
                                        {progress && (
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                            </div>
                                        )}
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded shadow transition text-sm">
                                            Subir a Carpeta
                                        </button>
                                    </form>
                                </div>

                                <div className="md:col-span-2">
                                    <h4 className="font-bold text-gray-800 mb-4">Documentos Almacenados</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {employee.documents.length === 0 ? (
                                            <div className="col-span-2 text-center text-gray-400 py-10 border-2 border-dashed border-gray-200 rounded-lg">
                                                Carpeta vacía
                                            </div>
                                        ) : (
                                            employee.documents.map(doc => (
                                                <div key={doc.id} className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between hover:shadow-md transition group">
                                                    <div className="flex items-center overflow-hidden">
                                                        <div className="bg-blue-50 p-2 rounded text-blue-600 mr-3">
                                                            📄
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-gray-800 truncate max-w-[150px]">{doc.name}</div>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{doc.type}</div>
                                                            <div className="text-[10px] text-gray-400">{formatDate(doc.created_at)}</div>
                                                        </div>
                                                    </div>
                                                    <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
                                                        Ver
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
            </div>
        </AuthenticatedLayout>
    );
}