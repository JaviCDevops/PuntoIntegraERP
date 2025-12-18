import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name, email: user.email, password: '', password_confirmation: '',
        permissions: user.permissions || []
    });

    const availablePermissions = [
        { id: 'dashboard', label: 'Ver Dashboard' },
        { id: 'quotes', label: 'Gestión Comercial (Cotizaciones)' },
        { id: 'projects', label: 'Gestión de Proyectos' },
        { id: 'clients', label: 'Gestión de Clientes' },
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
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Editar Usuario</h2>}>
            <Head title="Editar Usuario" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="block text-sm font-bold text-gray-700">Nombre</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded border-gray-300" /></div>
                            <div><label className="block text-sm font-bold text-gray-700">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full rounded border-gray-300" /></div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
                            <span className="font-bold">Nota:</span> Deja la contraseña en blanco si no quieres cambiarla.
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="block text-sm font-bold text-gray-700">Nueva Contraseña</label>
                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full rounded border-gray-300" /></div>
                            <div><label className="block text-sm font-bold text-gray-700">Confirmar Contraseña</label>
                            <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full rounded border-gray-300" /></div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-3">Permisos de Acceso</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {availablePermissions.map(p => (
                                    <label key={p.id} className="flex items-center space-x-2 cursor-pointer">
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

                        <div className="flex justify-end space-x-3">
                            <Link href={route('users.index')} className="px-4 py-2 bg-gray-100 rounded text-gray-700">Cancelar</Link>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Actualizar Usuario</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}