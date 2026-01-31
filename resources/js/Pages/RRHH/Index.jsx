import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, employees }) {
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800">Departamento de RRHH</h2>
                        <p className="text-sm text-gray-500">Gestión de personal, documentos y vacaciones</p>
                    </div>
                    {/* NOTA: Ya no hay botón de "Nuevo Empleado" aquí. 
                        Ahora se crean desde "Usuarios" */}
                    <div className="text-sm text-gray-500 italic bg-gray-100 px-3 py-1 rounded">
                        Para ingresar nuevo personal, ve a <Link href={route('users.create')} className="text-indigo-600 font-bold hover:underline">Usuarios</Link>
                    </div>
                </div>
            }
        >
            <Head title="RRHH - Personal" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Colaborador</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Cargo / Depto</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-blue-800 uppercase tracking-wider">Vacaciones</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-blue-800 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{employee.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">RUT: {employee.rut}</div>
                                        <div className="text-xs text-gray-400">Ingreso: {employee.hire_date}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700">{employee.position}</div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                                            {employee.department || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            employee.vacation_balance > 5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {employee.vacation_balance} Días
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {employee.is_active ? (
                                            <span className="text-green-600 font-bold text-xs">● Activo</span>
                                        ) : (
                                            <span className="text-red-500 font-bold text-xs">● Inactivo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                        {/* Botón Principal: Ver Ficha (Documentos, etc) */}
                                        <Link 
                                            href={route('rrhh.show', employee.id)} 
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition font-bold"
                                        >
                                            📂 Carpeta
                                        </Link>

                                        {/* Botón Secundario: Editar Datos (Redirige a Usuarios) */}
                                        {/* NOTA: Necesitamos el user_id para editar. 
                                            Asegúrate de que tu controlador RRHH Index lo esté enviando. 
                                            Si no, usa employee.user.id si cargaste la relación. */}
                                        {employee.user_id && (
                                            <Link 
                                                href={route('users.edit', employee.user_id)} 
                                                className="text-gray-400 hover:text-gray-600 hover:underline text-xs"
                                                title="Editar Datos Personales"
                                            >
                                                Editar Datos
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No hay empleados registrados. Crea uno desde el menú "Usuarios".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}