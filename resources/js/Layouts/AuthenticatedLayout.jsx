import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ user, header, children }) {
    const { props } = usePage();
    const notifications = props.notifications || [];
    
    const [showNotif, setShowNotif] = useState(false);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                
                                {user.permissions && user.permissions.includes('dashboard') && (
                                    <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                        Dashboard
                                    </NavLink>
                                )}

                                {user.permissions && user.permissions.includes('quotes') && (
                                    <NavLink href={route('quotes.index')} active={route().current('quotes.*')}>
                                        Presupuestos
                                    </NavLink>
                                )}

                                {user.permissions && user.permissions.includes('projects') && (
                                    <NavLink href={route('projects.index')} active={route().current('projects.*')}>
                                        Proyectos
                                    </NavLink>
                                )}

                                {user.permissions && user.permissions.includes('projects') && (
                                    <NavLink href={route('boards.index')} active={route().current('boards.*')}>
                                        Tableros
                                    </NavLink>
                                )}

                                {user.permissions && user.permissions.includes('clients') && (
                                    <NavLink href={route('clients.index')} active={route().current('clients.*')}>
                                        Clientes
                                    </NavLink>
                                )}

                                {user.permissions && user.permissions.includes('users') && (
                                    <NavLink href={route('users.index')} active={route().current('users.*')}>
                                        Usuarios
                                    </NavLink>
                                )}
                                
                                {user.permissions && user.permissions.includes('rrhh') && (
                                    <NavLink href={route('rrhh.index')} active={route().current('rrhh.*')}>
                                        RRHH
                                    </NavLink>
                                )}

                                {user.permissions && user.permissions.includes('vehicles') && (
                                    <NavLink href={route('vehicles.index')} active={route().current('vehicles.*')}>
                                        Flota
                                    </NavLink>
                                )}

                                {/* AGREGADO: Enlace de Áreas para Escritorio */}
                                {user.permissions && user.permissions.includes('areas') && (
                                    <NavLink href={route('areas.index')} active={route().current('areas.*')}>
                                        Áreas
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            
                            <div className="relative mr-4">
                                <button 
                                    onClick={() => setShowNotif(!showNotif)}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none relative transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                    </svg>

                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                                    )}
                                </button>

                                {showNotif && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <div className="px-4 py-2 border-b border-gray-100 font-bold text-gray-700 text-sm">
                                            Notificaciones ({notifications.length})
                                        </div>
                                        
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-4 text-sm text-gray-500 text-center">
                                                No tienes notificaciones pendientes.
                                            </div>
                                        ) : (
                                            <div className="max-h-64 overflow-y-auto">
                                                {notifications.map((notif) => (
                                                    <Link 
                                                        key={notif.id} 
                                                        href={notif.link}
                                                        onClick={() => setShowNotif(false)}
                                                        className="block px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                                                    >
                                                        <div className="flex items-start">
                                                            <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full mr-3 ${notif.type === 'deadline' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        
                        {user.permissions && user.permissions.includes('dashboard') && (
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                Dashboard
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('quotes') && (
                            <ResponsiveNavLink href={route('quotes.index')} active={route().current('quotes.*')}>
                                Presupuestos
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('projects') && (
                            <ResponsiveNavLink href={route('projects.index')} active={route().current('projects.*')}>
                                Proyectos
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('projects') && (
                            <ResponsiveNavLink href={route('boards.index')} active={route().current('boards.*')}>
                                Tableros
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('clients') && (
                            <ResponsiveNavLink href={route('clients.index')} active={route().current('clients.*')}>
                                Clientes
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('users') && (
                            <ResponsiveNavLink href={route('users.index')} active={route().current('users.*')}>
                                Usuarios
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('rrhh') && (
                            <ResponsiveNavLink href={route('rrhh.index')} active={route().current('rrhh.*')}>
                                RRHH
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('vehicles') && (
                            <ResponsiveNavLink href={route('vehicles.index')} active={route().current('vehicles.*')}>
                                Flota
                            </ResponsiveNavLink>
                        )}

                        {user.permissions && user.permissions.includes('areas') && (
                            <ResponsiveNavLink href={route('areas.index')} active={route().current('areas.*')}>
                                Áreas
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}