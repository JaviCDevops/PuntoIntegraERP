import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';


export default function Index({ auth, employees }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', rut: '', position: '', 
        department: '', hire_date: '', base_salary: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('rrhh.store'), {
            onSuccess: () => { setIsModalOpen(false); reset(); }
        });
    };

    const handleDelete = (id, name) => {
        if (confirm(`¿Estás seguro de eliminar a ${name}? Esta acción borrará su historial y usuario.`)) {
            router.delete(route('rrhh.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Recursos Humanos</h2>}>
            <Head title="RRHH - Empleados" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-gray-600">Gestión de Personal ({employees.length})</div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
                            + Nuevo Empleado
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre / Cargo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato Desde</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacaciones Disp.</th>
                                    <th className="px-6 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                                    <div className="text-sm text-gray-500">{emp.position}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.department || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.hire_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.vacation_balance > 5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {emp.vacation_balance} días
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={route('rrhh.show', emp.id)} className="text-blue-600 hover:text-blue-900">Ver Ficha →</Link>
                                        </td>

                                        <button 
                                            onClick={() => handleDelete(emp.id, emp.name)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                            title="Eliminar Empleado"
                                        >
                                            Eliminar
                                        </button>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Registrar Nuevo Colaborador</h3>
<form onSubmit={handleSubmit} className="space-y-4">
    <div>
        <label className="block text-sm font-medium">Nombre Completo</label>
        <input 
            type="text" 
            className="w-full border rounded p-2" 
            value={data.name} 
            onChange={e => setData('name', e.target.value)} 
        />
        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
    </div>

    <div className="grid grid-cols-2 gap-2">
        <div>
            <label className="block text-sm font-medium">RUT</label>
            <input 
                type="text" 
                className="w-full border rounded p-2" 
                value={data.rut} 
                onChange={e => setData('rut', e.target.value)} 
            />
            {errors.rut && <div className="text-red-500 text-xs mt-1">{errors.rut}</div>}
        </div>
        <div>
            <label className="block text-sm font-medium">Email (Login)</label>
            <input 
                type="email" 
                className="w-full border rounded p-2" 
                value={data.email} 
                onChange={e => setData('email', e.target.value)} 
            />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
        </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
        <div>
            <label className="block text-sm font-medium">Cargo</label>
            <input 
                type="text" 
                className="w-full border rounded p-2" 
                value={data.position} 
                onChange={e => setData('position', e.target.value)} 
            />
            {errors.position && <div className="text-red-500 text-xs mt-1">{errors.position}</div>}
        </div>
        <div>
            <label className="block text-sm font-medium">Departamento</label>
            <input 
                type="text" 
                className="w-full border rounded p-2" 
                value={data.department} 
                onChange={e => setData('department', e.target.value)} 
            />
        </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
        <div>
            <label className="block text-sm font-medium">Fecha Contrato</label>
            <input 
                type="date" 
                className="w-full border rounded p-2" 
                value={data.hire_date} 
                onChange={e => setData('hire_date', e.target.value)} 
            />
            {errors.hire_date && <div className="text-red-500 text-xs mt-1">{errors.hire_date}</div>}
        </div>
        <div>
            <label className="block text-sm font-medium">Sueldo Base</label>
            <input 
                type="number" 
                className="w-full border rounded p-2" 
                value={data.base_salary} 
                onChange={e => setData('base_salary', e.target.value)} 
            />
            {errors.base_salary && <div className="text-red-500 text-xs mt-1">{errors.base_salary}</div>}
        </div>
    </div>

    <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
        <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
    </div>
</form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}