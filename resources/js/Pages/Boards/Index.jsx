import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, boards }) {
    
    const handleDelete = (id) => {
        if(confirm('¿Seguro que quieres borrar este tablero? Se perderán todas las tareas.')) {
            router.delete(route('boards.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800">Mis Tableros Kanban</h2>
                    <Link href={route('boards.create')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded shadow flex items-center">
                        <span className="mr-1 text-xl">+</span> Crear Tablero
                    </Link>
                </div>
            }
        >
            <Head title="Tableros" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {boards.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            <p className="text-gray-500 text-lg">No tienes tableros creados aún.</p>
                            <p className="text-gray-400 text-sm mb-6">¡Crea el primero para organizar tus tareas!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {boards.map((board) => {
                                const isMaster = board.type === 'master' || board.is_fixed;

                                return (
                                    <div 
                                        key={board.id} 
                                        className={`bg-white overflow-hidden shadow-sm sm:rounded-lg border-l-4 transition hover:shadow-lg relative
                                            ${isMaster ? 'border-indigo-600 ring-1 ring-indigo-50' : 'border-blue-500'}
                                        `}
                                    >
                                        {isMaster && (
                                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase tracking-wider">
                                                Automático
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center space-x-3 overflow-hidden">
                                                    {isMaster ? (
                                                        <span className="text-2xl" title="Tablero Maestro">👑</span>
                                                    ) : (
                                                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                                                    )}
                                                    
                                                    <div>
                                                        <h3 className={`text-lg font-bold truncate leading-tight ${isMaster ? 'text-indigo-900' : 'text-gray-800'}`}>
                                                            {board.name || board.title}
                                                        </h3>
                                                        {isMaster && <p className="text-[10px] text-indigo-500 font-bold uppercase">Tablero Maestro</p>}
                                                    </div>
                                                </div>

                                                <div className="flex space-x-1 flex-shrink-0 ml-2">
                                                    <Link 
                                                        href={route('boards.edit', board.id)} 
                                                        className="bg-gray-100 text-gray-600 p-1.5 rounded hover:bg-yellow-100 hover:text-yellow-600 transition" 
                                                        title="Editar Nombre"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </Link>
                                                    
                                                    {!isMaster && (
                                                        <button onClick={() => handleDelete(board.id)} className="bg-gray-100 text-gray-600 p-1.5 rounded hover:bg-red-100 hover:text-red-600 transition">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden text-ellipsis leading-relaxed">
                                                {isMaster 
                                                    ? 'Aquí se visualizan automáticamente todos los proyectos adjudicados y sus estados.'
                                                    : (board.description || 'Sin descripción disponible.')
                                                }
                                            </p>

                                            <div className="flex items-center text-xs text-gray-400 mb-5 font-medium bg-gray-50 p-2 rounded">
                                                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                                {board.lists_count || 0} Listas · {board.cards_count || 0} Tarjetas
                                            </div>

                                            <Link 
                                                href={route('boards.show', board.id)}
                                                className={`block w-full text-center font-bold py-2.5 rounded transition shadow-sm
                                                    ${isMaster 
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                                        : 'bg-white border border-blue-500 text-blue-600 hover:bg-blue-50'
                                                    }
                                                `}
                                            >
                                                {isMaster ? 'Ver Tablero Maestro' : 'Entrar al Tablero'}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}