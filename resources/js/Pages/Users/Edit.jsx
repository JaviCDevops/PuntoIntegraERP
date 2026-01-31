import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, user }) {
    // 1. Inicializamos el formulario con los datos del Usuario Y del Empleado (si existe)
    const { data, setData, put, processing, errors } = useForm({
        // Datos de Usuario
        name: user.name, 
        email: user.email, 
        password: '', 
        password_confirmation: '',
        permissions: user.permissions || [],

        // Datos de Empleado (Usamos optional chaining ?. por si el usuario no es empleado aún)
        rut: user.employee?.rut || '',
        position: user.employee?.position || '',
        department: user.employee?.department || '',
        // Cortamos la fecha por si viene en formato ISO largo (YYYY-MM-DDT...)
        hire_date: user.employee?.hire_date ? user.employee.hire_date.split('T')[0] : '',
        base_salary: user.employee?.base_salary || '',
        phone: user.employee?.phone || '',
        address: user.employee?.address || '',
        birth_date: user.employee?.birth_date ? user.employee.birth_date.split('T')[0] : ''
    });

    const availablePermissions = [
        { id: 'dashboard', label: 'Ver Dashboard' },
        { id: 'quotes', label: 'Gestión Comercial (Cotizaciones)' },
        { id: 'projects', label: 'Gestión de Proyectos' },
        { id: 'clients', label: 'Gestión de Clientes' },
        { id: 'rrhh', label: 'Recursos Humanos (RRHH)' },
        { id: 'vehicles', label: 'Gestión de Flota (Vehículos)' },
        { id: 'areas', label: 'Gestión de Áreas (Mantenedor)' }, // <--- AGREGADO AQUÍ
        { id: 'users', label: 'Administrar Usuarios' },
    ];

    const handleCheckbox = (id) => {
        if (data.permissions.includes(id)) {
            setData('permissions', data.permissions.filter(p => p !== id));
        } else {
            setData('permissions', [...data.permissions, id]);
        }
    };

    const submit = (e) => { e.preventDefault(); put(route('users.update', user.id)); };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Editar Usuario Unificado</h2>}>
            <Head title="Editar Usuario" />
            <div className="py-12 max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                    <form onSubmit={submit} className="space-y-8">
                        
                        {/* --- SECCIÓN 1: DATOS DE ACCESO --- */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                1. Credenciales de Acceso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">
                                        Nombre Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        className="w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                        required 
                                    />
                                    {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">
                                        Email (Login) <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        value={data.email} 
                                        onChange={e => setData('email', e.target.value)} 
                                        className="w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                        required 
                                    />
                                    {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                </div>
                            </div>

                            {/* Alerta de Contraseña */}
                            <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-200 text-sm flex items-center gap-2 text-yellow-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="font-bold">Nota:</span> Deja los campos de contraseña en blanco si no deseas cambiarla.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Nueva Contraseña</label>
                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Confirmar Contraseña</label>
                                    <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>

                            <div className="mt-6 bg-gray-50 p-4 rounded border border-gray-200">
                                <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">Permisos del Sistema</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {availablePermissions.map(p => (
                                        <label key={p.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition">
                                            <input 
                                                type="checkbox" 
                                                checked={data.permissions.includes(p.id)}
                                                onChange={() => handleCheckbox(p.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- SECCIÓN 2: DATOS DE PERSONAL (RH) --- */}
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                            <h3 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                2. Ficha de Empleado
                            </h3>
                            
                            <div className="bg-blue-100/50 text-blue-800 text-sm p-3 rounded mb-4 flex items-start gap-2">
                                <span className="text-xl">ℹ️</span>
                                <div>
                                    <p>Aquí puedes editar la información contractual del usuario.</p>
                                    <p className="text-xs mt-1 opacity-75">Si el usuario no tenía ficha, al llenar el RUT se creará una nueva.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">RUT</label>
                                    <input type="text" placeholder="Ej: 12.345.678-9" value={data.rut} onChange={e => setData('rut', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    {errors.rut && <div className="text-red-500 text-xs mt-1">{errors.rut}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Cargo / Puesto</label>
                                    <input type="text" placeholder="Ej: Soldador Calificado" value={data.position} onChange={e => setData('position', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    {errors.position && <div className="text-red-500 text-xs mt-1">{errors.position}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Departamento</label>
                                    <input type="text" placeholder="Ej: Operaciones" value={data.department} onChange={e => setData('department', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Sueldo Base</label>
                                    <input type="number" placeholder="$" value={data.base_salary} onChange={e => setData('base_salary', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Fecha de Contrato</label>
                                    <input type="date" value={data.hire_date} onChange={e => setData('hire_date', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    {errors.hire_date && <div className="text-red-500 text-xs mt-1">{errors.hire_date}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Fecha de Nacimiento</label>
                                    <input type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700">Dirección</label>
                                    <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Teléfono</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <Link href={route('users.index')} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm">
                                Cancelar
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-bold shadow-md transform active:scale-95 transition-all flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : 'Actualizar Usuario Unificado'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}