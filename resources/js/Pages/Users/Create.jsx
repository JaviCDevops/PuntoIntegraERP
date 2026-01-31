import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import axios from 'axios'; // Necesario para consultar el RUT en vivo

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        // Datos de Identificación y RRHH
        rut: '', 
        name: '', 
        position: '', 
        department: '', 
        hire_date: '',
        base_salary: '', 
        phone: '', 
        address: '', 
        birth_date: '',
        
        // Credenciales de Acceso
        email: '', 
        password: '', 
        password_confirmation: '',
        permissions: [],
    });

    // --- LÓGICA: CONSULTAR HISTORIAL DE RUT ---
    const checkRutHistory = async (rutValue) => {
        // Solo consultamos si el RUT tiene un largo válido (ej: 12.345.678-9)
        if (rutValue && rutValue.length > 7) {
            try {
                const response = await axios.get(route('users.check-rut', rutValue));
                
                if (response.data.status === 'exists') {
                    // CASO: Existe historial (ex-empleado)
                    alert(`⚠️ AVISO DE HISTORIAL ENCONTRADO\n\nEste RUT pertenece a: ${response.data.name}\nÚltimo cargo registrado: ${response.data.position}\n\nAL GUARDAR: El sistema reactivará automáticamente su ficha histórica y la vinculará a este nuevo usuario.`);
                } else if (response.data.status === 'taken') {
                    // CASO: RUT ocupado por usuario activo
                    alert(`⛔ ERROR: ${response.data.message}`);
                }
            } catch (error) {
                console.error("Error verificando RUT:", error);
            }
        }
    };

    const availablePermissions = [
        { id: 'dashboard', label: 'Ver Dashboard' },
        { id: 'quotes', label: 'Gestión Comercial (Cotizaciones)' },
        { id: 'projects', label: 'Gestión de Proyectos' },
        { id: 'clients', label: 'Gestión de Clientes' },
        { id: 'rrhh', label: 'Recursos Humanos (RRHH)' }, 
        { id: 'vehicles', label: 'Gestión de Flota (Vehículos)' }, 
        { id: 'areas', label: 'Gestión de Áreas (Mantenedor)' }, // <--- Permiso Nuevo
        { id: 'users', label: 'Administrar Usuarios' },
    ];

    const handleCheckbox = (id) => {
        if (data.permissions.includes(id)) {
            setData('permissions', data.permissions.filter(p => p !== id));
        } else {
            setData('permissions', [...data.permissions, id]);
        }
    };

    const submit = (e) => { 
        e.preventDefault(); 
        post(route('users.store')); 
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Nuevo Usuario</h2>}>
            <Head title="Crear Usuario" />
            <div className="py-12 max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                    <form onSubmit={submit} className="space-y-8">
                        
                        {/* --- SECCIÓN 1: IDENTIFICACIÓN (RUT PRIMERO) --- */}
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                            <h3 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                                Identificación Personal (Clave)
                            </h3>
                            
                            <div className="bg-white/60 p-3 rounded text-sm text-blue-800 mb-4 flex items-start gap-2">
                                <span className="text-xl">ℹ️</span>
                                <p>Ingresa el <strong>RUT</strong> primero. El sistema verificará automáticamente si existe un historial laboral previo para reactivarlo.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">RUT / DNI <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 12.345.678-9" 
                                        value={data.rut} 
                                        onChange={e => setData('rut', e.target.value)}
                                        onBlur={e => checkRutHistory(e.target.value)} // <--- Validación al salir del campo
                                        className="w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-800" 
                                    />
                                    {errors.rut && <div className="text-red-500 text-xs mt-1">{errors.rut}</div>}
                                </div>
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
                            </div>
                        </div>

                        {/* --- SECCIÓN 2: CREDENCIALES DE ACCESO --- */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                                <span className="bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                                Credenciales de Acceso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Contraseña</label>
                                    <input 
                                        type="password" 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="w-full rounded border-gray-300 shadow-sm" 
                                        placeholder="Dejar en blanco para auto-generar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Confirmar Contraseña</label>
                                    <input 
                                        type="password" 
                                        value={data.password_confirmation} 
                                        onChange={e => setData('password_confirmation', e.target.value)} 
                                        className="w-full rounded border-gray-300 shadow-sm" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- SECCIÓN 3: DETALLES CONTRACTUALES (RRHH) --- */}
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                Detalles Contractuales (Ficha RRHH)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded border border-gray-100">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Cargo</label>
                                    <input type="text" value={data.position} onChange={e => setData('position', e.target.value)} className="w-full rounded border-gray-300 shadow-sm" placeholder="Ej: Soldador" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Departamento</label>
                                    <input type="text" value={data.department} onChange={e => setData('department', e.target.value)} className="w-full rounded border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Sueldo Base</label>
                                    <input type="number" value={data.base_salary} onChange={e => setData('base_salary', e.target.value)} className="w-full rounded border-gray-300 shadow-sm" placeholder="$" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Fecha Contrato</label>
                                    <input type="date" value={data.hire_date} onChange={e => setData('hire_date', e.target.value)} className="w-full rounded border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Nacimiento</label>
                                    <input type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} className="w-full rounded border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Teléfono</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full rounded border-gray-300 shadow-sm" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-gray-700">Dirección</label>
                                    <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="w-full rounded border-gray-300 shadow-sm" />
                                </div>
                            </div>
                        </div>

                        {/* --- SECCIÓN 4: PERMISOS --- */}
                        <div className="mt-6 bg-gray-50 p-4 rounded border border-gray-200">
                            <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">Permisos del Sistema</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {availablePermissions.map(p => (
                                    <label key={p.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition select-none">
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

                        {/* --- BOTONES DE ACCIÓN --- */}
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
                                ) : 'Guardar Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}