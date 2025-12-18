import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ auth, users }) {
    const { data, setData, post, processing } = useForm({
        title: '', description: '',
        columns: [{ name: 'Pendiente', color: '#fca5a5' }, { name: 'En Proceso', color: '#fcd34d' }, { name: 'Terminado', color: '#86efac' }],
        rows: [{ name: 'General', color: '#3b82f6' }],
        members: []
    });

    const addCol = () => setData('columns', [...data.columns, { name: 'Nueva Columna', color: '#cbd5e1' }]);
    const removeCol = (index) => setData('columns', data.columns.filter((_, i) => i !== index));
    const updateCol = (index, field, val) => {
        const newCols = [...data.columns];
        newCols[index][field] = val;
        setData('columns', newCols);
    };

    const addRow = () => setData('rows', [...data.rows, { name: 'Nueva Fila', color: '#3b82f6' }]);
    const removeRow = (index) => setData('rows', data.rows.filter((_, i) => i !== index));
    const updateRow = (index, field, val) => {
        const newRows = [...data.rows];
        newRows[index][field] = val;
        setData('rows', newRows);
    };

    const handleMember = (id) => {
        if(data.members.includes(id)) setData('members', data.members.filter(m => m !== id));
        else setData('members', [...data.members, id]);
    }

    const submit = (e) => { e.preventDefault(); post(route('boards.store')); };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Nuevo Tablero</h2>}>
            <Head title="Crear Tablero" />
            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="space-y-6">
                    
                    <div className="bg-gray-800 p-6 rounded-lg shadow text-white">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Título</label>
                                <input type="text" value={data.title} onChange={e=>setData('title', e.target.value)} className="w-full rounded text-black" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Descripción</label>
                                <input type="text" value={data.description} onChange={e=>setData('description', e.target.value)} className="w-full rounded text-black" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold text-gray-700 mb-4">COLUMNAS (Vertical)</h3>
                            {data.columns.map((col, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <span className="py-2 text-gray-400 font-bold w-4">{i+1}</span>
                                    <input type="text" value={col.name} onChange={e=>updateCol(i, 'name', e.target.value)} className="flex-1 rounded border-gray-300 h-9 text-sm" />
                                    <input type="color" value={col.color} onChange={e=>updateCol(i, 'color', e.target.value)} className="h-9 w-9 p-0 border-0 rounded cursor-pointer" />
                                    <button type="button" onClick={() => removeCol(i)} className="text-red-500 font-bold px-2">✖</button>
                                </div>
                            ))}
                            <button type="button" onClick={addCol} className="w-full mt-2 bg-gray-600 text-white py-2 rounded font-bold hover:bg-gray-700">+ Agregar Columna</button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold text-gray-700 mb-4">FILAS (Horizontal)</h3>
                            {data.rows.map((row, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <span className="py-2 text-gray-400 font-bold w-4">{i+1}</span>
                                    <input type="text" value={row.name} onChange={e=>updateRow(i, 'name', e.target.value)} className="flex-1 rounded border-gray-300 h-9 text-sm" />
                                    <button type="button" onClick={() => removeRow(i)} className="text-red-500 font-bold px-2">✖</button>
                                </div>
                            ))}
                            <button type="button" onClick={addRow} className="w-full mt-2 bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">+ Agregar Fila</button>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow text-white">
                        <label className="block text-sm font-bold mb-2">Asignar Miembros:</label>
                        <div className="flex flex-wrap gap-2">
                            {users.map(u => (
                                <button 
                                    key={u.id} type="button" 
                                    onClick={() => handleMember(u.id)}
                                    className={`px-3 py-1 rounded-full text-sm border ${data.members.includes(u.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-500 hover:bg-gray-700'}`}
                                >
                                    {u.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow hover:bg-blue-700">Guardar Tablero Completo</button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}