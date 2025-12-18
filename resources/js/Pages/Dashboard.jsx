import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ auth, kpis, chart, alertas, ausentes_list }) {
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false }, 
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 14 },
                callbacks: {
                    label: function(context) {
                        return new Intl.NumberFormat('es-CL', { 
                            style: 'decimal', 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(context.raw);
                    }
                }
            }
        },
        scales: {
            y: { 
                beginAtZero: true,
                grid: { borderDash: [2, 4], color: '#e2e8f0' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    const chartData = {
        labels: chart.labels,
        datasets: [
            {
                label: 'Ventas',
                data: chart.data,
                borderColor: '#4f46e5', 
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                tension: 0.4, 
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4f46e5',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            },
        ],
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { 
            style: 'decimal',      
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        }).format(amount);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Panel de Control</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ventas este Mes</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                        {formatCurrency(kpis.ventas_mes)} <span className="text-sm font-normal text-gray-400">UF</span>
                                    </h3>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-emerald-500 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Proyectos Activos</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{kpis.proyectos_activos}</h3>
                                    <Link href={route('boards.index')} className="text-xs text-emerald-600 hover:underline mt-2 inline-block font-medium">Ver Tablero &rarr;</Link>
                                </div>
                                <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-purple-500 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Equipo Activo</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{kpis.empleados_activos}</h3>
                                    {kpis.ausentes_hoy > 0 ? (
                                        <span className="text-xs text-red-500 font-bold mt-2 inline-block">⚠ {kpis.ausentes_hoy} ausente(s)</span>
                                    ) : (
                                        <span className="text-xs text-gray-400 mt-2 inline-block">Asistencia completa</span>
                                    )}
                                </div>
                                <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-orange-400 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Por Gestionar</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{kpis.cotizaciones_pendientes}</h3>
                                    <Link href={route('quotes.index')} className="text-xs text-orange-600 hover:underline mt-2 inline-block font-medium">Ir a Ventas &rarr;</Link>
                                </div>
                                <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-700 text-lg">Tendencia de Ventas (6 Meses)</h3>
                            </div>
                            <div className="h-72 w-full">
                                <Line options={chartOptions} data={chartData} />
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="font-bold text-gray-700 text-lg mb-4 flex items-center">
                                <span className="mr-2">🔥</span> Atención Requerida
                            </h3>
                            
                            {alertas.rrhh && alertas.rrhh.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-red-500 uppercase mb-2">RRHH Pendiente</p>
                                    <div className="space-y-2">
                                        {alertas.rrhh.map(req => (
                                            <div key={req.id} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100">
                                                <div>
                                                    <span className="text-sm font-bold text-gray-800">{req.employee.user.name}</span>
                                                    <div className="text-xs text-gray-500 capitalize">{req.type}</div>
                                                </div>
                                                <Link href={route('rrhh.show', req.employee.id)} className="text-xs text-red-600 font-bold hover:underline">
                                                    Revisar
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {alertas.proyectos && alertas.proyectos.length > 0 ? (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Entregas Próximas</p>
                                    <div className="space-y-3">
                                        {alertas.proyectos.map(alerta => (
                                            <div key={alerta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate" title={alerta.title}>{alerta.title}</p>
                                                    <p className="text-xs text-gray-500">{alerta.deadline}</p>
                                                </div>
                                                <div className={`ml-2 px-2 py-1 text-[10px] font-bold text-white rounded whitespace-nowrap 
                                                    ${alerta.days_diff < 0 ? 'bg-red-500' : 'bg-yellow-500'}`}>
                                                    {alerta.days_diff < 0 
                                                        ? `${Math.abs(Math.round(alerta.days_diff))}d ATRASO` 
                                                        : `${Math.round(alerta.days_diff)} Días`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                !alertas.rrhh.length && (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-sm">Todo al día. ¡Buen trabajo!</p>
                                    </div>
                                )
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}