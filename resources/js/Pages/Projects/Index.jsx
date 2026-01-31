import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ListIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
const EditIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const NoteIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);

export default function Index({ auth, projects = [], filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [milestoneCount, setMilestoneCount] = useState(1);
    const [viewMode, setViewMode] = useState('lista'); 

    const [searchCode, setSearchCode] = useState(filters.search_code || '');
    const [searchClient, setSearchClient] = useState(filters.search_client || '');
    const [searchStatus, setSearchStatus] = useState(filters.search_status || 'todos');

    const kanbanColumns = {
        'activo':     { title: 'En Proceso', color: 'border-blue-500', bg: 'bg-blue-50' },
        'pausado':    { title: 'Pausado',    color: 'border-orange-500', bg: 'bg-orange-50' },
        'finalizado': { title: 'Terminado',  color: 'border-green-500',  bg: 'bg-green-50' }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('projects.index'),
                { search_code: searchCode, search_client: searchClient, search_status: searchStatus },
                { preserveState: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchCode, searchClient, searchStatus]);

    const { data, setData, put, processing } = useForm({
        oc_number: '', internal_notes: '', start_date: '', deadline: '', milestones: []
    });

    const openModal = (project) => {
        setCurrentProject(project);
        setMilestoneCount(project.milestones?.length || 1);
        
        // Función auxiliar para cortar la hora si viene en formato ISO (2024-01-01T00:00:00)
        const formatDate = (dateStr) => dateStr ? dateStr.substring(0, 10) : '';

        setData({
            oc_number: project.oc_number || '',
            internal_notes: project.internal_notes || '',
            start_date: formatDate(project.start_date),
            deadline: formatDate(project.deadline),
            milestones: project.milestones?.length > 0 
                ? project.milestones 
                : [{ milestone_order: 1, percentage: 100, amount: project.quote?.total_value || 0, invoice_number: '', status: 'PENDIENTE' }]
        });
        setIsModalOpen(true);
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        router.put(route('projects.update', draggableId), {
            status: destination.droppableId
        }, { preserveScroll: true });
    };

    const getProjectsByStatus = (status) => {
        return (projects || []).filter(p => (p.status || 'activo') === status);
    };

    const handleMilestoneCountChange = (e) => {
        const count = parseInt(e.target.value) || 1;
        setMilestoneCount(count);
        const newMilestones = Array.from({ length: count }, (_, i) => data.milestones[i] || { milestone_order: i + 1, percentage: 0, amount: 0, invoice_number: '', status: 'PENDIENTE' });
        setData('milestones', newMilestones);
    };

    const updateMilestone = (index, field, value) => {
        const newMilestones = [...data.milestones];
        newMilestones[index][field] = value;
        const totalProjectValue = parseFloat(currentProject?.quote?.total_value || 0);
        if (field === 'percentage') newMilestones[index]['amount'] = (totalProjectValue * (value / 100)).toFixed(2);
        else if (field === 'amount') newMilestones[index]['percentage'] = ((value / totalProjectValue) * 100).toFixed(2);
        setData('milestones', newMilestones);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('projects.update', currentProject.id), { onSuccess: () => setIsModalOpen(false) });
    };

    const getPaymentStatus = (project) => {
        if (!project.milestones || project.milestones.length === 0) return <span className="text-gray-400 italic text-[10px]">Sin configurar</span>;
        const paid = project.milestones.filter(m => m.status === 'PAGADO').length;
        const total = project.milestones.length;
        return <span className="text-orange-500 font-bold text-xs">{paid}/{total} Pagos</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h2 className="font-bold text-2xl text-gray-800">Proyectos en Curso</h2>
                        
                        <div className="bg-gray-200 rounded-lg p-1 flex text-sm">
                            <button 
                                onClick={() => setViewMode('lista')}
                                className={`px-3 py-1 rounded font-medium transition ${viewMode === 'lista' ? 'bg-white shadow text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Lista
                            </button>
                            <button 
                                onClick={() => setViewMode('kanban')}
                                className={`px-3 py-1 rounded font-medium transition ${viewMode === 'kanban' ? 'bg-white shadow text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Kanban
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Proyectos" />

            <div className="py-8">
                <div className="max-w-[98%] mx-auto">
                    
                    <div className="bg-gray-100 p-4 rounded-t-lg border-b border-gray-200 flex flex-wrap gap-4 items-end mb-4 shadow-sm">
                        {/* Filtros */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase"># Código:</label>
                            <input type="text" placeholder="Ej: 2024..." className="w-40 text-sm border-gray-300 rounded block" value={searchCode} onChange={e => setSearchCode(e.target.value)} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Cliente:</label>
                            <input type="text" placeholder="Buscar cliente..." className="w-full text-sm border-gray-300 rounded block" value={searchClient} onChange={e => setSearchClient(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Estado:</label>
                            <select className="w-40 text-sm border-gray-300 rounded block" value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
                                <option value="todos">-- Todos --</option>
                                <option value="activo">EN PROCESO</option>
                                <option value="finalizado">TERMINADO</option>
                                <option value="pausado">PAUSADO</option>
                            </select>
                        </div>
                        <div className="flex-1 text-right self-center">
                            <span className="text-blue-600 font-bold text-sm">Resultados: {(projects || []).length}</span>
                        </div>
                    </div>

                    {viewMode === 'lista' && (
                        <div className="bg-white shadow rounded-lg overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cód. Proyecto / OC</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase w-1/3">Detalle</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Pagos</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(projects || []).map((project) => (
                                        <tr key={project.id} className="hover:bg-blue-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                <div className="text-blue-600">{project.code}</div>
                                                {project.oc_number && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        OC: {project.oc_number}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {project.quote?.client_snapshot?.razon_social || project.client?.razon_social || 'Desconocido'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs uppercase">
                                                {project.quote?.description || 'SIN DETALLE'}
                                                {project.internal_notes && (
                                                    <span className="ml-2 text-yellow-600 inline-flex items-center" title={project.internal_notes}>
                                                        <NoteIcon />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{getPaymentStatus(project)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                    project.status === 'finalizado' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'pausado' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {project.status === 'activo' ? 'EN PROCESO' : 
                                                     project.status === 'finalizado' ? 'TERMINADO' : 
                                                     (project.status || 'EN PROCESO').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button 
                                                    onClick={() => openModal(project)}
                                                    className="bg-blue-400 hover:bg-blue-500 text-white p-1.5 rounded shadow transition"
                                                    title="Gestionar"
                                                >
                                                    <EditIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {viewMode === 'kanban' && (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-[600px]">
                                {Object.entries(kanbanColumns).map(([columnId, columnDef]) => (
                                    <div key={columnId} className="bg-gray-100 rounded-lg flex flex-col h-full shadow-sm">
                                        
                                        <div className={`p-3 text-center font-bold text-gray-700 border-t-4 ${columnDef.color} bg-white rounded-t-lg shadow-sm flex justify-between items-center`}>
                                            <span>{columnDef.title}</span>
                                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                                                {getProjectsByStatus(columnId).length}
                                            </span>
                                        </div>

                                        <Droppable droppableId={columnId}>
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="p-3 flex-1 overflow-y-auto space-y-3"
                                                >
                                                    {getProjectsByStatus(columnId).map((project, index) => (
                                                        <Draggable key={project.id.toString()} draggableId={project.id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="bg-white p-4 rounded shadow border-l-4 border-transparent hover:border-blue-400 transition cursor-grab group relative"
                                                                >
                                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10">
                                                                        <button 
                                                                            onClick={() => openModal(project)}
                                                                            className="bg-gray-100 hover:bg-blue-100 text-blue-600 p-1 rounded-full shadow block border border-blue-200"
                                                                            title="Gestionar Proyecto"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h4 className="font-bold text-sm text-gray-800 leading-tight pr-6">
                                                                            {project.quote?.client_snapshot?.razon_social || project.client?.razon_social || 'Desconocido'}
                                                                        </h4>
                                                                        <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                                            {project.code}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 uppercase">
                                                                        {project.quote?.description || 'Sin detalle'}
                                                                    </p>

                                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                                        {project.oc_number && (
                                                                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                                                                OC: {project.oc_number}
                                                                            </span>
                                                                        )}
                                                                        {project.internal_notes && (
                                                                            <div className="bg-yellow-50 p-1 rounded text-[10px] text-yellow-800 border border-yellow-100 flex items-center gap-1">
                                                                                <NoteIcon />
                                                                                <span className="truncate max-w-[100px]">{project.internal_notes}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="flex justify-between items-center text-xs text-gray-400 font-mono pt-2 border-t border-gray-100">
                                                                        <span>{getPaymentStatus(project)}</span>
                                                                    </div>
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
                    )}
                </div>
            </div>

            {isModalOpen && currentProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto py-10">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                Gestionar Proyecto: <span className="text-blue-600">{currentProject.code}</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✖</button>
                        </div>
                        <div className="bg-gray-100 p-3 rounded mb-6 flex space-x-6 text-sm">
                            <div><span className="font-bold">Cliente:</span> {currentProject.quote?.client_snapshot?.razon_social || 'Desconocido'}</div>
                            <div><span className="font-bold">Monto Total:</span> {parseFloat(currentProject.quote?.total_value || 0).toLocaleString()} UF</div>
                        </div>
                        
                        <form onSubmit={submit}>
                            <div className="mb-4 bg-yellow-50 p-4 rounded border border-yellow-200">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    N° Orden de Compra (OC) <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    value={data.oc_number} 
                                    onChange={e => setData('oc_number', e.target.value)} 
                                    placeholder="Ej: 5022-CM25" 
                                    // Bloquear si ya existe un número guardado en la BD
                                    disabled={!!currentProject.oc_number}
                                    className={`w-full text-sm rounded border-gray-300 ${currentProject.oc_number ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            
                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 mb-6">
                                <h4 className="font-bold text-blue-800 mb-3 text-sm">Plazos del Proyecto</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Inicio Proyecto: <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="date" 
                                            required 
                                            // CORRECCIÓN: Aseguramos el formato YYYY-MM-DD cortando la cadena
                                            value={data.start_date ? data.start_date.substring(0, 10) : ''} 
                                            onChange={e => setData('start_date', e.target.value)} 
                                            // Bloquear si ya existe fecha guardada en el proyecto original
                                            // CÓDIGO DE PRUEBA (Nunca bloquea)
                                            disabled={false}
                                            className={`w-full text-sm rounded border-gray-300 ${currentProject.start_date ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Entrega Final: <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="date" 
                                            required 
                                            // CORRECCIÓN: Aseguramos el formato YYYY-MM-DD cortando la cadena
                                            value={data.deadline ? data.deadline.substring(0, 10) : ''} 
                                            onChange={e => setData('deadline', e.target.value)} 
                                            // Bloquear si ya existe fecha guardada en el proyecto original
                                            // CÓDIGO DE PRUEBA (Nunca bloquea)
                                            disabled={false}
                                            className={`w-full text-sm rounded border-gray-300 ${currentProject.deadline ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Notas / Comentarios Internos</label>
                                <textarea rows="3" value={data.internal_notes} onChange={e => setData('internal_notes', e.target.value)} placeholder="Agrega detalles importantes sobre el proyecto..." className="w-full text-sm rounded border-gray-300"></textarea>
                            </div>
                            
                            <div className="mb-6 border-t pt-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <label className="text-sm font-bold text-gray-700">Cantidad de Pagos (Hitos):</label>
                                    <input type="number" min="1" max="12" value={milestoneCount} onChange={handleMilestoneCountChange} className="w-20 text-sm rounded border-gray-300 text-center" />
                                    <span className="text-xs text-gray-400">(Reinicia los montos al cambiar)</span>
                                </div>
                                <div className="space-y-3">
                                    {data.milestones.map((ms, index) => (
                                        <div key={index} className="flex items-end space-x-2 bg-gray-50 p-2 rounded border border-gray-200">
                                            <div className="w-16 font-bold text-blue-500 text-sm pb-2">Pago {index + 1}</div>
                                            
                                            <div className="w-20">
                                                <label className="block text-xs text-gray-500 mb-1">% <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="number" 
                                                    required 
                                                    value={ms.percentage} 
                                                    onChange={e => updateMilestone(index, 'percentage', e.target.value)} 
                                                    className="w-full text-sm border-gray-300 rounded" 
                                                />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Monto (UF) <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="number" 
                                                    required 
                                                    step="0.01" 
                                                    value={ms.amount} 
                                                    onChange={e => updateMilestone(index, 'amount', e.target.value)} 
                                                    className="w-full text-sm border-gray-300 rounded" 
                                                />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">N° Factura</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Pendiente..." 
                                                    value={ms.invoice_number || ''} 
                                                    onChange={e => updateMilestone(index, 'invoice_number', e.target.value)} 
                                                    className="w-full text-sm border-gray-300 rounded" 
                                                />
                                            </div>
                                            
                                            <div className="w-32">
                                                <label className="block text-xs text-gray-500 mb-1">Estado <span className="text-red-500">*</span></label>
                                                <select 
                                                    required 
                                                    value={ms.status} 
                                                    onChange={e => updateMilestone(index, 'status', e.target.value)} 
                                                    className="w-full text-sm border-gray-300 rounded p-2"
                                                >
                                                    <option value="PENDIENTE">PENDIENTE</option>
                                                    <option value="FACTURADO">FACTURADO</option>
                                                    <option value="PAGADO">PAGADO</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded text-lg shadow transition">{processing ? 'Guardando...' : 'Guardar Cambios'}</button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}