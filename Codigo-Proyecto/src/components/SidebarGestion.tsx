import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API_URL from '../services/api';

function SidebarGestion() {
    const navigate = useNavigate();

    const [nombreUsuario, setNombreUsuario] = useState('Usuario');
    const [iniciales, setIniciales] = useState('U');

    const cargarDatosUsuario = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

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

            setIniciales(`${inicialNombre}${inicialApellido}` || 'U');

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
                    <NavLink to="/GestionHome">Dashboard</NavLink>
                    <NavLink to="/GestionEdificio">Registrar Edificio</NavLink>
                    <NavLink to="/GestionUnidad">Registrar Piso / Local</NavLink>
                    <NavLink to="/GestionMantenimiento">Mantenimiento</NavLink>
                    <NavLink to="/GestionPerfil">Perfil</NavLink>
                </nav>
            </div>

            <button onClick={cerrarSesion} className="sidebar-logout">
                Cerrar Sesión
            </button>
        </aside>
    );
}

export default SidebarGestion;