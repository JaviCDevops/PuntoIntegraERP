import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const employee = user.employee || {}; // Datos de empleado si existen

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
                                    <span className="block text-gray-800 font-medium font-mono">{employee.rut || 'No registrado'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase">Fecha Contrato</span>
                                    <span className="block text-gray-800 font-medium">
                                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* --- SECCIÓN 2: EDITAR DATOS DE CUENTA --- */}
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <section>
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
                        </div>

                        {/* --- SECCIÓN 3: CAMBIAR CONTRASEÑA --- */}
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <section>
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
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}