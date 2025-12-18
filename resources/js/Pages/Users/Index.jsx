import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, users }) {
    const handleDelete = (id) => {
        if(confirm('¿Eliminar usuario?')) router.delete(route('users.destroy', id));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800">Usuarios del Sistema</h2>
                    <Link href={route('users.create')} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">+ Nuevo Usuario</Link>
                </div>
            }
        >
            <Head title="Usuarios" />
            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Permisos</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.permissions && user.permissions.map(p => (
                                                <span key={p} className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 border border-blue-200">
                                                    {p}
                                                </span>
                                            ))}
                                            {(!user.permissions || user.permissions.length === 0) && <span className="text-gray-400 text-xs italic">Sin acceso</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <Link href={route('users.edit', user.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Borrar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}