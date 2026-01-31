import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function Show({ auth, board }) {
    const [localTasks, setLocalTasks] = useState(board.tasks || []);
    const [addingTask, setAddingTask] = useState({ rowId: null, colId: null });
    const [editingTask, setEditingTask] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, reset } = useForm({ title: '' });

    useEffect(() => { setLocalTasks(board.tasks || []); }, [board.tasks]);

    const filteredTasks = useMemo(() => {
        if (!searchTerm) return localTasks;
        const lower = searchTerm.toLowerCase();
        return localTasks.filter(t => 
            t.title.toLowerCase().includes(lower) || 
            (t.description && t.description.toLowerCase().includes(lower))
        );
    }, [localTasks, searchTerm]);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const [destRowId, destColId] = destination.droppableId.split('-').map(Number);

        const newTasks = localTasks.map(t => {
            if (t.id.toString() === draggableId) {
                return { ...t, board_row_id: destRowId, board_column_id: destColId };
            }
            return t;
        });
        setLocalTasks(newTasks);

        router.put(route('boards.task.move', draggableId), {
            row_id: destRowId, 
            column_id: destColId
        }, { preserveScroll: true, onError: () => setLocalTasks(board.tasks) });
    };

    const handleAddTask = (e, rowId, colId) => {
        e.preventDefault();
        if (!data.title.trim()) { setAddingTask({rowId:null, colId:null}); return; }
        
        router.post(route('boards.task.store', board.id), {
            title: data.title, 
            row_id: rowId, 
            column_id: colId
        }, { 
            onSuccess: () => { 
                setAddingTask({rowId:null, colId:null}); 
                reset(); 
            } 
        });
    };

    const saveTaskDetails = () => {
        if(!editingTask || !editingTask.title.trim()) return; // Validación extra
        router.put(route('boards.task.update', editingTask.id), {
            title: editingTask.title, 
            description: editingTask.description
        }, { 
            preserveScroll: true, 
            onSuccess: () => setEditingTask(null) 
        });
    };

    const deleteTask = () => {
        if(!confirm('¿Borrar tarea?')) return;
        router.delete(route('boards.task.destroy', editingTask.id), {
            preserveScroll: true, 
            onSuccess: () => setEditingTask(null)
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-gray-800">{board.name}</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded uppercase">Vista Matriz</span>
                </div>
                <input 
                    type="text" 
                    placeholder="Filtrar tareas..." 
                    className="border-gray-300 rounded-full text-sm w-64 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        }>
            <Head title={board.name} />
            
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="p-6 h-[calc(100vh-100px)] overflow-auto bg-gray-100">
                    <div className="inline-block min-w-full shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200">
                        
                        <div className="flex sticky top-0 z-20 shadow-sm">
                            <div className="w-48 flex-shrink-0 bg-gray-50 border-b border-r border-gray-200 p-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-center flex items-center justify-center">
                                Filas \ Columnas
                            </div>
                            
                            {board.columns.map(col => (
                                <div 
                                    key={col.id} 
                                    className="w-80 flex-shrink-0 bg-white border-b border-r border-gray-200 p-3 text-center font-bold text-sm uppercase tracking-wide relative"
                                    style={{ borderTop: `4px solid ${col.color}` }}
                                >
                                    {col.name} 
                                    <span className="absolute right-2 top-2 text-[10px] bg-gray-100 text-gray-600 px-1.5 rounded-full">
                                        {filteredTasks.filter(t => t.board_column_id === col.id).length}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {board.rows.map(row => (
                            <div key={row.id} className="flex items-stretch min-h-[160px] group">
                                
                                <div 
                                    className="w-48 flex-shrink-0 bg-gray-50 border-b border-r border-gray-200 p-4 font-bold text-gray-700 text-sm flex items-center justify-center sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                                    style={{ borderLeft: `4px solid ${row.color}` }}
                                >
                                    {row.name}
                                </div>

                                {board.columns.map(col => {
                                    const cellTasks = filteredTasks.filter(t => t.board_row_id === row.id && t.board_column_id === col.id);
                                    const isAdding = addingTask.rowId === row.id && addingTask.colId === col.id;
                                    
                                    const droppableId = `${row.id}-${col.id}`;

                                    return (
                                        <Droppable key={droppableId} droppableId={droppableId}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef} {...provided.droppableProps} 
                                                    className={`w-80 flex-shrink-0 border-b border-r border-gray-100 p-2 flex flex-col space-y-2 transition-colors 
                                                        ${snapshot.isDraggingOver ? 'bg-blue-50 ring-inset ring-2 ring-blue-200' : 'bg-white hover:bg-gray-50'}
                                                    `}
                                                >
                                                    {isAdding ? (
                                                        <form onSubmit={(e) => handleAddTask(e, row.id, col.id)} className="mb-2 bg-white p-2 rounded shadow-lg ring-2 ring-blue-500 z-50 relative">
                                                            <input 
                                                                autoFocus 
                                                                type="text" 
                                                                required
                                                                value={data.title} 
                                                                onChange={e => setData('title', e.target.value)} 
                                                                onBlur={() => !data.title && setAddingTask({rowId:null, colId:null})}
                                                                className="w-full border-gray-300 rounded text-sm mb-2" 
                                                                placeholder="Nueva tarea..." 
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <button type="button" onClick={() => setAddingTask({rowId:null, colId:null})} className="text-gray-500 text-xs">Cancelar</button>
                                                                <button type="submit" className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">Guardar</button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setAddingTask({rowId: row.id, colId: col.id})}
                                                            className="w-full text-left text-gray-300 hover:text-blue-600 text-[10px] font-bold uppercase py-1 px-1 rounded hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
                                                        >
                                                            + Añadir
                                                        </button>
                                                    )}

                                                    {cellTasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                    onClick={() => setEditingTask(task)}
                                                                    className={`p-3 rounded border border-gray-200 bg-white hover:shadow-md cursor-pointer relative group transition-all
                                                                        ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500 z-50' : 'shadow-sm'}
                                                                    `}
                                                                    style={{ ...provided.draggableProps.style }}
                                                                >
                                                                    <div className="text-sm text-gray-800 leading-snug font-medium">{task.title}</div>
                                                                    {task.description && <div className="mt-1 text-xs text-gray-400 line-clamp-1">📝 {task.description}</div>}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {editingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-700">Editar Tarea</h3>
                            <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Título <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full border-gray-300 rounded font-semibold text-gray-800 focus:ring-blue-500 focus:border-blue-500" 
                                    value={editingTask.title} 
                                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                                <textarea rows="4" className="w-full border-gray-300 rounded text-sm text-gray-600 bg-gray-50 focus:bg-white transition" placeholder="Detalles..." value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}></textarea>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <button onClick={deleteTask} className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline">Eliminar</button>
                            <button 
                                onClick={saveTaskDetails} 
                                disabled={!editingTask.title.trim()}
                                className={`font-bold py-2 px-6 rounded shadow transition 
                                    ${!editingTask.title.trim() 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}