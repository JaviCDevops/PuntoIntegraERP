import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, clients }) {
    const [search, setSearch] = useState('');

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            router.delete(route('clients.destroy', id));
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.get(route('clients.index'), { search }, { preserveState: true });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Cartera de Clientes</h2>
                    <Link
                        href={route('clients.create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow"
                    >
                        + Nuevo Cliente
                    </Link>
                </div>
            }
        >
            <Head title="Clientes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Buscar por RUT o Razón Social (Presiona Enter)..." 
                            className="w-full md:w-1/3 border-gray-300 rounded-md shadow-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">RUT</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Razón Social</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email / Teléfono</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                            {client.rut}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{client.razon_social}</div>
                                            <div className="text-xs text-gray-500">{client.giro}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {client.contacto_nombre}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{client.contacto_email}</div>
                                            <div className="text-xs">{client.telefono}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={route('clients.edit', client.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                                            <button 
                                                onClick={() => handleDelete(client.id)} 
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Borrar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {clients.length === 0 && <div className="p-6 text-center text-gray-500">No hay clientes registrados.</div>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}