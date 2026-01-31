import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

// 1. Recibimos 'users'
export default function Edit({ auth, board, users = [] }) {
    
    const { data, setData, put, processing, errors } = useForm({
        title: board.name || board.title || '', // A veces se llama name o title, aseguramos ambos
        description: board.description || '',
        columns: board.columns || [],
        rows: board.rows || [],
        // 2. Cargamos los miembros actuales si existen
        user_ids: board.members ? board.members.map(m => m.id) : [] 
    });

    const addColumn = () => {
        setData('columns', [...data.columns, { name: 'Nueva Columna', color: '#e2e8f0', id: null }]);
    };
    
    const removeColumn = (index) => {
        const newCols = [...data.columns];
        newCols.splice(index, 1);
        setData('columns', newCols);
    };

    const updateColumn = (index, field, value) => {
        const newCols = [...data.columns];
        newCols[index][field] = value;
        setData('columns', newCols);
    };

    const addRow = () => {
        setData('rows', [...data.rows, { name: 'Nueva Fila', color: '#ffffff', id: null }]);
    };

    const removeRow = (index) => {
        const newRows = [...data.rows];
        newRows.splice(index, 1);
        setData('rows', newRows);
    };

    const updateRow = (index, field, value) => {
        const newRows = [...data.rows];
        newRows[index][field] = value;
        setData('rows', newRows);
    };

    // 3. Lógica para marcar/desmarcar usuarios
    const handleMember = (id) => {
        if (data.user_ids.includes(id)) {
            setData('user_ids', data.user_ids.filter(m => m !== id));
        } else {
            setData('user_ids', [...data.user_ids, id]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('boards.update', board.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Editar Tablero</h2>}>
            <Head title="Editar Tablero" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            
                            {/* DATOS BÁSICOS */}
                            <div className="mb-6 grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block font-medium text-sm text-gray-700">
                                        Nombre del Tablero <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" 
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)} 
                                        required 
                                    />
                                    {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium text-sm text-gray-700">Descripción</label>
                                    <textarea className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" 
                                        value={data.description} onChange={e => setData('description', e.target.value)} />
                                </div>
                            </div>

                            <hr className="my-6" />

                            {/* ESTRUCTURA (COLUMNAS Y FILAS) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-700">Columnas (Eje X)</h3>
                                        <button type="button" onClick={addColumn} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">+ Añadir</button>
                                    </div>
                                    <div className="space-y-3">
                                        {data.columns.map((col, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input type="color" className="h-9 w-9 p-0 border rounded cursor-pointer" 
                                                    value={col.color} onChange={e => updateColumn(index, 'color', e.target.value)} />
                                                <input 
                                                    type="text" 
                                                    className="border-gray-300 rounded text-sm flex-1" 
                                                    value={col.name} 
                                                    onChange={e => updateColumn(index, 'name', e.target.value)} 
                                                    placeholder="Nombre Columna" 
                                                    required
                                                />
                                                <button type="button" onClick={() => removeColumn(index)} className="text-red-500 font-bold px-2">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.columns && <div className="text-red-500 text-sm mt-2">{errors.columns}</div>}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-700">Filas (Eje Y)</h3>
                                        <button type="button" onClick={addRow} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200">+ Añadir</button>
                                    </div>
                                    <div className="space-y-3">
                                        {data.rows.map((row, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input type="color" className="h-9 w-9 p-0 border rounded cursor-pointer" 
                                                    value={row.color} onChange={e => updateRow(index, 'color', e.target.value)} />
                                                <input 
                                                    type="text" 
                                                    className="border-gray-300 rounded text-sm flex-1" 
                                                    value={row.name} 
                                                    onChange={e => updateRow(index, 'name', e.target.value)} 
                                                    placeholder="Nombre Fila" 
                                                    required
                                                />
                                                <button type="button" onClick={() => removeRow(index)} className="text-red-500 font-bold px-2">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.rows && <div className="text-red-500 text-sm mt-2">{errors.rows}</div>}
                                </div>
                            </div>

                            {/* 4. SECCIÓN NUEVA: GESTIÓN DE MIEMBROS */}
                            <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Gestión de Miembros (Acceso)</label>
                                <div className="flex flex-wrap gap-2">
                                    {users?.map(u => (
                                        <button 
                                            key={u.id} type="button" 
                                            onClick={() => handleMember(u.id)}
                                            className={`px-3 py-1 rounded-full text-sm border transition flex items-center gap-2 
                                                ${data.user_ids.includes(u.id) 
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {/* Indicador visual si está seleccionado */}
                                            {data.user_ids.includes(u.id) && <span>✓</span>}
                                            {u.name}
                                        </button>
                                    ))}
                                    {(!users || users.length === 0) && (
                                        <span className="text-gray-400 text-sm italic">No hay otros usuarios disponibles.</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Los usuarios seleccionados podrán ver y editar este tablero.</p>
                            </div>

                            {/* BOTONES DE ACCIÓN */}
                            <div className="flex items-center justify-end mt-8 border-t pt-4">
                                <Link href={route('boards.index')} className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none mr-4">
                                    Cancelar
                                </Link>
                                <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition transform active:scale-95">
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}