import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

// Iconos para mantener consistencia con los otros módulos
const EditIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const UserPlusIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>);

export default function Index({ auth, clients }) {
    const [search, setSearch] = useState('');

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este cliente? Se borrarán sus datos de contacto.')) {
            router.delete(route('clients.destroy', id), {
                preserveScroll: true, // Mantiene la posición de la pantalla
            });
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition"
                    >
                        <UserPlusIcon />
                        <span>Nuevo Cliente</span>
                    </Link>
                </div>
            }
        >
            <Head title="Clientes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Barra de Búsqueda */}
                    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Buscar Cliente</label>
                            <input 
                                type="text" 
                                placeholder="Escribe RUT o Razón Social y presiona Enter..." 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">RUT</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Razón Social</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Datos de Contacto</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-indigo-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600 font-bold">
                                            {client.rut}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{client.razon_social}</div>
                                            <div className="text-xs text-gray-500">{client.giro || 'Sin giro registrado'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {client.contacto_nombre || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span>📧 {client.contacto_email || '-'}</span>
                                                <span>📞 {client.telefono || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-2">
                                                <Link 
                                                    href={route('clients.edit', client.id)} 
                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded transition"
                                                    title="Editar"
                                                >
                                                    <EditIcon />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(client.id)} 
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded transition"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {clients.length === 0 && (
                            <div className="p-10 text-center text-gray-500 border-t border-gray-100">
                                No se encontraron clientes registrados.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}