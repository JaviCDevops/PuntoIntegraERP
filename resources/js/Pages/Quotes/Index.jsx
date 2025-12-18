import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const EyeIcon = ({ off }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        {off ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />}
    </svg>
);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const EditIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const PdfIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const NoteIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);

export default function Index({ auth, quotes, filters }) {
    const [viewMode, setViewMode] = useState('lista'); 
    const [valuesVisible, setValuesVisible] = useState(false);

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta cotización?')) {
            router.delete(route('quotes.destroy', id), {
                preserveScroll: true,
                onSuccess: () => alert('Cotización eliminada')
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'adjudicada': return 'bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-500';
            case 'pendiente': return 'bg-orange-100 text-orange-800 border-orange-300 focus:ring-orange-500';
            case 'enviada': return 'bg-emerald-100 text-emerald-800 border-emerald-300 focus:ring-emerald-500';
            case 'perdida': return 'bg-red-100 text-red-800 border-red-300 focus:ring-red-500';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    
    const [searchCode, setSearchCode] = useState(filters.search_code || '');
    const [searchClient, setSearchClient] = useState(filters.search_client || '');
    const [searchStatus, setSearchStatus] = useState(filters.search_status || 'todos');
    const [hideLost, setHideLost] = useState(filters.hide_lost === 'true');

    const kanbanColumns = {
        pendiente: { title: 'Pendiente', color: 'border-orange-500', bg: 'bg-gray-100' },
        enviada: { title: 'Enviada', color: 'border-emerald-500', bg: 'bg-emerald-50' },
        adjudicada: { title: 'Adjudicado', color: 'border-blue-500', bg: 'bg-blue-50' },
        perdida: { title: 'Perdido', color: 'border-red-500', bg: 'bg-red-50' }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('quotes.index'),
                { search_code: searchCode, search_client: searchClient, search_status: searchStatus, hide_lost: hideLost },
                { preserveState: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchCode, searchClient, searchStatus, hideLost]);

    const handleStatusChange = (id, newStatus) => {
        if (newStatus === 'adjudicada') {
            if(!confirm('¿Adjudicar esta cotización? Se creará el proyecto.')) return;
        }
        router.patch(route('quotes.update-status', id), { status: newStatus }, { preserveScroll: true });
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        if (destination.droppableId !== result.source.droppableId) {
            handleStatusChange(draggableId, destination.droppableId);
        }
    };

    const getQuotesByStatus = (status) => quotes.filter(q => q.status === status);
    const formatMoney = (amount, symbol = '$') => valuesVisible ? `${symbol} ${parseFloat(amount).toLocaleString('es-CL')}` : '***';
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CL');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h2 className="font-bold text-2xl text-gray-800">Gestión Comercial</h2>
                        
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
                    <div className="flex space-x-2">
                        <button onClick={() => setValuesVisible(!valuesVisible)} className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition">
                            <EyeIcon off={valuesVisible} />
                        </button>
                        <Link href={route('quotes.create')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded shadow transition">
                            + Nueva Cotización
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Gestión Comercial" />

            <div className="py-8">
                <div className="max-w-[95%] mx-auto">
                    
                    <div className="bg-gray-100 p-4 rounded-t-lg border-b border-gray-200 flex flex-wrap gap-4 items-end mb-4 shadow-sm">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase"># Código:</label>
                            <input type="text" placeholder="Ej: 2025_01..." className="w-40 text-sm border-gray-300 rounded block" value={searchCode} onChange={e => setSearchCode(e.target.value)} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Filtro Cliente:</label>
                            <input type="text" placeholder="Buscar cliente..." className="w-full text-sm border-gray-300 rounded block" value={searchClient} onChange={e => setSearchClient(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Estado:</label>
                            <select className="w-40 text-sm border-gray-300 rounded block" value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
                                <option value="todos">-- Todos --</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="enviada">Enviada</option>
                                <option value="adjudicada">Adjudicada</option>
                                <option value="perdida">Perdida</option>
                            </select>
                        </div>
                        <div>
                            <button onClick={() => setHideLost(!hideLost)} className={`text-sm font-bold py-2 px-4 rounded border transition ${hideLost ? 'bg-red-500 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                                {hideLost ? 'Ocultar perdidos' : 'Ver perdidos'}
                            </button>
                        </div>
                        <div className="flex-1 text-right self-center">
                            <span className="text-blue-600 font-bold text-sm">Resultados: {quotes.length}</span>
                        </div>
                    </div>

                    {viewMode === 'lista' && (
                        <div className="bg-white shadow rounded-lg overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cód.</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Area</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Detalle</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Notas</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Neto (UF)</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total (UF)</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Estado</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {quotes.map((quote) => (
                                        <tr key={quote.id} className="hover:bg-blue-50 transition">
                                            <td className="px-4 py-4 font-bold text-blue-600 text-sm">{quote.code}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{quote.area || 'Ingeniería'}</td>
                                            <td className="px-4 py-4 text-sm text-gray-800 font-medium">{quote.client.razon_social}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500 truncate max-w-xs">{quote.description}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {quote.internal_notes && <span title={quote.internal_notes} className="cursor-help text-yellow-600"><NoteIcon /></span>}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm text-gray-400 font-mono">{formatMoney(quote.net_value, 'UF')}</td>
                                            <td className="px-4 py-4 text-right text-sm text-gray-400 font-mono">{formatMoney(quote.total_value, 'UF')}</td>
                                            
                                            <td className="px-4 py-4 text-center">
                                                <div className="relative">
                                                    <select 
                                                        value={quote.status} 
                                                        onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                                                        className={`text-xs font-bold border rounded py-1 pr-8 cursor-pointer outline-none shadow-sm ${getStatusColor(quote.status)}`}
                                                    >
                                                        <option className="bg-white text-gray-800" value="pendiente">Pendiente</option>
                                                        <option className="bg-white text-gray-800" value="enviada">Enviada</option>
                                                        <option className="bg-white text-gray-800" value="adjudicada">Adjudicada</option>
                                                        <option className="bg-white text-gray-800" value="perdida">Perdida</option>
                                                    </select>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-center flex justify-center space-x-2">
                                                                                
                                                {(quote.status === 'pendiente' || quote.status === 'enviada') && (
                                                    <Link 
                                                        href={route('quotes.edit', quote.id)}
                                                        className="bg-blue-400 hover:bg-blue-500 text-white p-1.5 rounded shadow transition"
                                                        title="Editar Cotización"
                                                    >
                                                        <EditIcon />
                                                    </Link>
                                                )}
                                            
                                                <a href={route('quotes.pdf', quote.id)} target="_blank" className="bg-sky-500 text-white p-1.5 rounded shadow" title="Descargar PDF">
                                                    <PdfIcon />
                                                </a>
                                                
                                                <button 
                                                    className="bg-red-400 text-white p-1.5 rounded shadow" 
                                                    onClick={() => handleDelete(quote.id)} 
                                                    type="button"
                                                >
                                                    <TrashIcon />
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
                            <div className={`grid grid-cols-1 gap-4 h-full ${hideLost ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>

                                {Object.entries(kanbanColumns)
                                    .filter(([columnId]) => !(hideLost && columnId === 'perdida')) 
                                    .map(([columnId, columnDef]) => (
                                    
                                    <div key={columnId} className="bg-gray-100 rounded-lg flex flex-col h-full min-h-[500px]">
                                        <div className={`p-3 text-center font-bold text-gray-700 border-t-4 ${columnDef.color} bg-white rounded-t-lg shadow-sm flex justify-between items-center`}>
                                            <span>{columnDef.title}</span>
                                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                                                {getQuotesByStatus(columnId).length}
                                            </span>
                                        </div>

                                        <Droppable droppableId={columnId}>
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="p-3 flex-1 overflow-y-auto space-y-3"
                                                >
                                                    {getQuotesByStatus(columnId).map((quote, index) => (
                                                        <Draggable key={quote.id.toString()} draggableId={quote.id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="bg-white p-4 rounded shadow border-l-4 border-transparent hover:border-blue-400 transition cursor-grab group relative"
                                                                >
                                                                    {(quote.status === 'pendiente' || quote.status === 'enviada') && (
                                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10">
                                                                            <Link 
                                                                                href={route('quotes.edit', quote.id)}
                                                                                className="bg-gray-100 hover:bg-blue-100 text-blue-600 p-1 rounded-full shadow block border border-blue-200"
                                                                                title="Editar Cotización"
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                            </Link>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h4 className="font-bold text-sm text-gray-800 leading-tight pr-6">
                                                                            {quote.client.razon_social}
                                                                        </h4>
                                                                        <div className="flex space-x-1">
                                                                            <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                                                {quote.code}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                                                        {quote.description || 'Sin detalle...'}
                                                                    </p>

                                                                    {quote.internal_notes && (
                                                                        <div className="mb-2 bg-yellow-50 p-1.5 rounded text-[10px] text-yellow-800 border border-yellow-100 flex items-start gap-1">
                                                                            <span className="mt-0.5"><NoteIcon /></span>
                                                                            <span className="line-clamp-2">{quote.internal_notes}</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="flex justify-between items-center text-xs text-gray-400 font-mono pt-2 border-t border-gray-100">
                                                                        <span>{formatDate(quote.created_at)}</span>
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
        </AuthenticatedLayout>
    );
}