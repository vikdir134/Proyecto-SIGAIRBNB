import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API_URL from '../services/api';

function SidebarGestion() {
    const navigate = useNavigate();

    const [nombreUsuario, setNombreUsuario] = useState('Usuario');
    const [iniciales, setIniciales] = useState('U');
    const [esAdmin, setEsAdmin] = useState(false);
    const [esSecretario, setEsSecretario] = useState(false);
    const [esCliente, setEsCliente] = useState(false);

    const cargarDatosUsuario = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        /*
            Primero leemos el usuario guardado después del login.
            Ahí deberían venir los roles: CLIENTE, ADMIN, SECRETARIO, etc.
        */
        const usuarioGuardado = localStorage.getItem('usuario');

        if (usuarioGuardado) {
            try {
                const usuario = JSON.parse(usuarioGuardado);

                const roles: string[] = Array.isArray(usuario.roles)
                    ? usuario.roles
                    : [];

                setEsCliente(roles.includes('CLIENTE'));
                setEsSecretario(roles.includes('SECRETARIO'));
                setEsAdmin(roles.includes('ADMIN'));
            } catch (error) {
                console.error('No se pudo leer el usuario del localStorage:', error);
            }
        }

        /*
            Luego cargamos el perfil para mostrar nombre e iniciales.
        */
        try {
            const response = await fetch(`${API_URL}/perfil`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return;
            }

            const nombres = data.perfil?.nombres || '';
            const apellidos = data.perfil?.apellidos || '';

            const nombreCompleto = `${nombres} ${apellidos}`.trim();

            if (nombreCompleto) {
                setNombreUsuario(nombreCompleto);
            }

            const inicialNombre = nombres.charAt(0).toUpperCase();
            const inicialApellido = apellidos.charAt(0).toUpperCase();

            const nuevasIniciales = `${inicialNombre}${inicialApellido}`.trim();

            setIniciales(nuevasIniciales || 'U');

        } catch (error) {
            console.error('No se pudo cargar el perfil en el sidebar:', error);
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/Login');
    };

    useEffect(() => {
        cargarDatosUsuario();
    }, []);

    return (
        <aside className="gestion-sidebar">
            <div>
                <p className="sidebar-title">PERFIL</p>

                <div className="sidebar-user">
                    <div className="sidebar-avatar">{iniciales}</div>
                    <p>{nombreUsuario}</p>
                </div>

                <nav className="sidebar-menu">
                    <NavLink to="/" end>
                        Volver al inicio
                    </NavLink>

                    {/* Funciones del cliente */}
                    {esCliente && (
                        <>
                            <NavLink to="/Busqueda">
                                Buscar inmuebles
                            </NavLink>

                            <NavLink to="/MisSolicitudesReserva">
                                Mis solicitudes
                            </NavLink>
                        </>
                    )}

                    {/* Funciones del administrador */}
                    {esAdmin && (
                        <>
                            <NavLink to="/GestionHome">
                                Dashboard
                            </NavLink>

                            <NavLink to="/GestionEdificio">
                                Registrar Edificio
                            </NavLink>

                            <NavLink to="/GestionUnidad">
                                Registrar Piso / Local
                            </NavLink>

                            <NavLink to="/GestionMantenimiento">
                                Mantenimiento
                            </NavLink>

                            <NavLink to="/GestionDisponibilidad">
                                Disponibilidad
                            </NavLink>

                            <NavLink to="/GestionPublicacion">
                                Publicar inmueble
                            </NavLink>

                            <NavLink to="/GestionSolicitudesReserva">
                                Solicitudes de reserva
                            </NavLink>

                            <NavLink to="/gestion/conceptos-cobro">
                                Conceptos de cobro
                            </NavLink>

                            <NavLink to="/gestion/ingresos-alquiler" className="sidebar-link">
                                Ingresos de alquiler
                            </NavLink>

                            <NavLink to="/GestionTarifas" className="sidebar-link">
                                Tarifas / IPC
                            </NavLink>

                            <NavLink to="/GestionAdmin">
                                Mantenimiento Admin
                            </NavLink>
                        </>
                    )}

                    {/* Funciones del secretario */}
                    {esSecretario && !esAdmin && (
                        <>
                            <NavLink to="/GestionSolicitudesReserva">
                                Control de ocupación
                            </NavLink>

                            <NavLink to="/gestion/conceptos-cobro">
                                Conceptos de cobro
                            </NavLink>

                            <NavLink to="/gestion/ingresos-alquiler" className="sidebar-link">
                                Ingresos de alquiler
                            </NavLink>

                            <NavLink to="/GestionTarifas" className="sidebar-link">
                                Tarifas / IPC
                            </NavLink>
                        </>
                    )}

                    <NavLink to="/GestionPerfil">
                        Perfil
                    </NavLink>
                </nav>
            </div>

            <button onClick={cerrarSesion} className="sidebar-logout">
                Cerrar Sesión
            </button>
        </aside>
    );
}

export default SidebarGestion;