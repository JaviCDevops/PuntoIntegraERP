import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';

export default function Kanban({ auth, project, columns, users }) {
    const { put } = useForm();
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        priority: 'media',
        assigned_to: '',
    });

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        put(route('tasks.move', draggableId), {
            data: { column_id: destination.droppableId, new_index: destination.index },
            preserveScroll: true,
        });
    };

    const submitTask = (e) => {
        e.preventDefault();
        post(route('tasks.store', project.id), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    const getPriorityColor = (p) => {
        if(p === 'alta') return 'border-l-4 border-red-500';
        if(p === 'media') return 'border-l-4 border-yellow-500';
        return 'border-l-4 border-blue-500';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Tablero: {project.name}</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm shadow"
                    >
                        + Nueva Tarea
                    </button>
                </div>
            }
        >
            <Head title={`Kanban - ${project.name}`} />

            <div className="py-8 h-[calc(100vh-140px)]"> 
                <div className="max-w-[98%] mx-auto h-full overflow-hidden">
                    
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex space-x-4 h-full overflow-x-auto pb-4">
                            {columns.map((column) => (
                                <div key={column.id} className="w-80 flex-shrink-0 flex flex-col bg-gray-100 rounded-lg max-h-full">
                                    <div className={`p-3 font-bold text-gray-700 border-b border-gray-200 bg-white rounded-t-lg flex justify-between items-center`}>
                                        <span>{column.name}</span>
                                        <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full">{column.tasks.length}</span>
                                    </div>

                                    <Droppable droppableId={column.id.toString()}>
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="p-3 flex-1 overflow-y-auto space-y-3"
                                            >
                                                {column.tasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-white p-3 rounded shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing ${getPriorityColor(task.priority)}`}
                                                            >
                                                                <div className="font-bold text-sm text-gray-800 mb-1">{task.title}</div>
                                                                
                                                                {task.assigned_user && (
                                                                    <div className="flex items-center mt-2">
                                                                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold mr-1">
                                                                            {task.assigned_user.name.charAt(0)}
                                                                        </div>
                                                                        <span className="text-xs text-gray-500">{task.assigned_user.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Crear Nueva Tarea</h3>
                        
                        <form onSubmit={submitTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                <input 
                                    type="text" 
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    autoFocus
                                />
                                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea 
                                    rows="2"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                                    <select 
                                        value={data.priority}
                                        onChange={e => setData('priority', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    >
                                        <option value="baja">Baja</option>
                                        <option value="media">Media</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Asignar a</label>
                                    <select 
                                        value={data.assigned_to}
                                        onChange={e => setData('assigned_to', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    >
                                        <option value="">-- Nadie --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold"
                                >
                                    Guardar Tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}