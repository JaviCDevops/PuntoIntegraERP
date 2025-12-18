import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        rut: '',
        razon_social: '',
        giro: '',
        direccion: '',
        contacto_nombre: '',
        contacto_email: '',
        telefono: '',
    });

    const handleRutChange = (e) => {
        let value = e.target.value.replace(/[^0-9kK]/g, ''); 
        
        if (value.length > 1) {
            const body = value.slice(0, -1);
            const dv = value.slice(-1).toUpperCase();
            const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            
            value = `${formattedBody}-${dv}`;
        }

        setData('rut', value);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('clients.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Agregar Nuevo Cliente</h2>}
        >
            <Head title="Crear Cliente" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">RUT (Sin puntos)</label>
                                    <input
                                        type="text"
                                        placeholder="12345678-9"
                                        maxLength="12"
                                        value={data.rut}
                                        onChange={handleRutChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.rut && <div className="text-red-500 text-xs mt-1">{errors.rut}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Razón Social</label>
                                    <input
                                        type="text"
                                        value={data.razon_social}
                                        onChange={e => setData('razon_social', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.razon_social && <div className="text-red-500 text-xs mt-1">{errors.razon_social}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Giro</label>
                                    <input
                                        type="text"
                                        value={data.giro}
                                        onChange={e => setData('giro', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.giro && <div className="text-red-500 text-xs mt-1">{errors.giro}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Dirección Comercial</label>
                                    <input
                                        type="text"
                                        value={data.direccion}
                                        onChange={e => setData('direccion', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.direccion && <div className="text-red-500 text-xs mt-1">{errors.direccion}</div>}
                                </div>
                            </div>

                            <hr />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Nombre Contacto</label>
                                    <input
                                        type="text"
                                        value={data.contacto_nombre}
                                        onChange={e => setData('contacto_nombre', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.contacto_nombre && <div className="text-red-500 text-xs mt-1">{errors.contacto_nombre}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Teléfono</label>
                                    <input
                                        type="text"
                                        value={data.telefono}
                                        onChange={e => setData('telefono', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.telefono && <div className="text-red-500 text-xs mt-1">{errors.telefono}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={data.contacto_email}
                                        onChange={e => setData('contacto_email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.contacto_email && <div className="text-red-500 text-xs mt-1">{errors.contacto_email}</div>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <Link href={route('clients.index')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                    Cancelar
                                </Link>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold">
                                    Guardar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}