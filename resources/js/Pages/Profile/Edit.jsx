import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState } from 'react';

export default function Edit({ mustVerifyEmail, status, employee: employeeProp }) {
    const user = usePage().props.auth.user;
    const employee = employeeProp || user.employee || {}; // Datos de empleado si existen
    const [activeTab, setActiveTab] = useState(employee?.id ? 'leave' : 'account');

    const formatRut = (rut) => {
        if (!rut) return '-';
        const clean = String(rut).replace(/[^0-9kK]/g, '');
        if (clean.length < 2) return rut;
        const body = clean.slice(0, -1);
        const dv = clean.slice(-1).toUpperCase();
        const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${withDots}-${dv}`;
    };

    // --- FORMATO DE FECHA CONSISTENTE (Día/Mes/Año) ---
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    // --- FORMULARIO 1: DATOS BÁSICOS ---
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submitInfo = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    // --- FORMULARIO 2: CONTRASEÑA ---
    const { 
        data: pwdData, 
        setData: setPwdData, 
        put: putPwd, 
        errors: pwdErrors, 
        processing: pwdProcessing, 
        reset: resetPwd, 
        recentlySuccessful: pwdSuccessful 
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPwd = (e) => {
        e.preventDefault();
        putPwd(route('password.update'), {
            onSuccess: () => resetPwd(),
        });
    };

    const {
        data: leaveData,
        setData: setLeaveData,
        post: postLeave,
        processing: leaveProcessing,
        errors: leaveErrors,
        reset: resetLeave,
    } = useForm({
        type: 'vacaciones',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const submitLeave = (e) => {
        e.preventDefault();
        postLeave(route('profile.leaves.store'), {
            onSuccess: () => resetLeave(),
        });
    };

    const leaves = employee?.leaves || [];
    const documents = employee?.documents || [];
    const tabs = employee?.id
        ? [
            { id: 'leave', label: 'Solicitar Vacaciones / Ausencia' },
            { id: 'documents', label: 'Documentos Personales' },
            { id: 'account', label: 'Información de la Cuenta' },
            { id: 'password', label: 'Actualizar Contraseña' },
        ]
        : [
            { id: 'account', label: 'Información de la Cuenta' },
            { id: 'password', label: 'Actualizar Contraseña' },
        ];

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mi Perfil</h2>}
        >
            <Head title="Mi Perfil" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* --- SECCIÓN 1: TARJETA DE EMPLEADO (VISUALIZACIÓN) --- */}
                    <div className="bg-white p-4 sm:p-8 shadow sm:rounded-lg border-l-4 border-blue-500">
                        <section>
                            <header className="flex items-center gap-4 mb-4">
                                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">Ficha del Colaborador</h2>
                                    <p className="text-sm text-gray-600">
                                        Información contractual y de RRHH.
                                    </p>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase">Cargo / Puesto</span>
                                    <span className="block text-gray-800 font-medium">{employee.position || 'No asignado'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase">Departamento</span>
                                    <span className="block text-gray-800 font-medium">{employee.department || 'General'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase">RUT</span>
                                    <span className="block text-gray-800 font-medium font-mono">{formatRut(employee.rut)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase">Fecha Contrato</span>
                                    <span className="block text-gray-800 font-medium">
                                        {employee.hire_date ? formatDate(employee.hire_date) : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase">Saldo Vacaciones</span>
                                    <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${employee.vacation_balance > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {employee.vacation_balance || 0} Días
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase">Estado</span>
                                    <span className="text-green-600 font-bold text-sm">● Activo</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap gap-2 px-4 sm:px-8 pt-4" aria-label="Tabs">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 text-sm font-bold rounded-t-md border-b-2 transition ${
                                            activeTab === tab.id
                                                ? 'text-indigo-700 border-indigo-600 bg-indigo-50'
                                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-4 sm:p-8">
                            {activeTab === 'leave' && employee?.id && (
                                <section>
                                    <header>
                                        <h2 className="text-lg font-medium text-gray-900">Solicitar Vacaciones / Ausencia</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Registra tu solicitud desde tu perfil, sin entrar al módulo administrativo RRHH.
                                        </p>
                                    </header>

                                    <form onSubmit={submitLeave} className="mt-6 space-y-4 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Tipo</label>
                                            <select
                                                value={leaveData.type}
                                                onChange={(e) => setLeaveData('type', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="vacaciones">Vacaciones Legales</option>
                                                <option value="administrativo">Permiso Administrativo</option>
                                                <option value="licencia">Licencia Médica</option>
                                            </select>
                                            {leaveErrors.type && <div className="text-red-500 text-sm mt-1">{leaveErrors.type}</div>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700">Desde</label>
                                                <input
                                                    type="date"
                                                    value={leaveData.start_date}
                                                    onChange={(e) => setLeaveData('start_date', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Formato: dd-mm-aaaa</p>
                                                {leaveErrors.start_date && <div className="text-red-500 text-sm mt-1">{leaveErrors.start_date}</div>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700">Hasta</label>
                                                <input
                                                    type="date"
                                                    value={leaveData.end_date}
                                                    onChange={(e) => setLeaveData('end_date', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Formato: dd-mm-aaaa</p>
                                                {leaveErrors.end_date && <div className="text-red-500 text-sm mt-1">{leaveErrors.end_date}</div>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Motivo (Opcional)</label>
                                            <textarea
                                                value={leaveData.reason}
                                                onChange={(e) => setLeaveData('reason', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                rows="3"
                                            />
                                            {leaveErrors.reason && <div className="text-red-500 text-sm mt-1">{leaveErrors.reason}</div>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={leaveProcessing}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
                                        >
                                            Enviar Solicitud
                                        </button>
                                    </form>

                                    <div className="mt-8 max-w-2xl">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Mis Solicitudes</h3>
                                        {leaves.length === 0 ? (
                                            <p className="text-sm text-gray-500">No tienes solicitudes registradas.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {leaves.map((leave) => (
                                                    <div key={leave.id} className="border border-gray-200 rounded-md p-3">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-semibold text-gray-800 capitalize">{leave.type}</p>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                                leave.status === 'aprobada' ? 'bg-green-100 text-green-700' :
                                                                leave.status === 'rechazada' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {leave.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatDate(leave.start_date)} ➜ {formatDate(leave.end_date)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {activeTab === 'documents' && employee?.id && (
                                <section>
                                    <header>
                                        <h2 className="text-lg font-medium text-gray-900">Documentos Personales</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Aquí puedes ver los documentos cargados en tu carpeta personal.
                                        </p>
                                    </header>

                                    <div className="mt-6 space-y-3 max-w-2xl">
                                        {documents.length === 0 ? (
                                            <p className="text-sm text-gray-500">No tienes documentos cargados.</p>
                                        ) : (
                                            documents.map((doc) => (
                                                <div key={doc.id} className="border border-gray-200 rounded-md p-3 flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">{doc.type || 'Documento'}</p>
                                                        <p className="text-xs text-gray-400">Subido: {formatDate(doc.created_at)}</p>
                                                    </div>
                                                    <a
                                                        href={`/storage/${doc.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        Ver
                                                    </a>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            )}

                            {activeTab === 'account' && (
                                <section className="max-w-2xl">
                                    <header>
                                        <h2 className="text-lg font-medium text-gray-900">Información de la Cuenta</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Actualiza tu nombre de perfil y dirección de correo electrónico.
                                        </p>
                                    </header>

                                    <form onSubmit={submitInfo} className="mt-6 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">
                                                Nombre <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">
                                                Correo Electrónico <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                                            >
                                                Guardar
                                            </button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-green-600 font-bold">¡Guardado!</p>
                                            </Transition>
                                        </div>
                                    </form>
                                </section>
                            )}

                            {activeTab === 'password' && (
                                <section className="max-w-2xl">
                                    <header>
                                        <h2 className="text-lg font-medium text-gray-900">Actualizar Contraseña</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Asegúrate de usar una contraseña larga y aleatoria para mantener la seguridad.
                                        </p>
                                    </header>

                                    <form onSubmit={submitPwd} className="mt-6 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">
                                                Contraseña Actual <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={pwdData.current_password}
                                                onChange={(e) => setPwdData('current_password', e.target.value)}
                                                required
                                            />
                                            {pwdErrors.current_password && <div className="text-red-500 text-sm mt-1">{pwdErrors.current_password}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">
                                                Nueva Contraseña <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={pwdData.password}
                                                onChange={(e) => setPwdData('password', e.target.value)}
                                                required
                                            />
                                            {pwdErrors.password && <div className="text-red-500 text-sm mt-1">{pwdErrors.password}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">
                                                Confirmar Contraseña <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={pwdData.password_confirmation}
                                                onChange={(e) => setPwdData('password_confirmation', e.target.value)}
                                                required
                                            />
                                            {pwdErrors.password_confirmation && <div className="text-red-500 text-sm mt-1">{pwdErrors.password_confirmation}</div>}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                type="submit"
                                                disabled={pwdProcessing}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                                            >
                                                Actualizar Clave
                                            </button>

                                            <Transition
                                                show={pwdSuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-green-600 font-bold">¡Actualizada!</p>
                                            </Transition>
                                        </div>
                                    </form>
                                </section>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}