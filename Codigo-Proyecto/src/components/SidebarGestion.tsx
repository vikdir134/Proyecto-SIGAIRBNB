import { NavLink, useNavigate } from 'react-router-dom';

function SidebarGestion() {
    const navigate = useNavigate();

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/Login');
    };

    return (
        <aside className="gestion-sidebar">
            <div>
                <p className="sidebar-title">PERFIL</p>

                <div className="sidebar-user">
                    <div className="sidebar-avatar">U1</div>
                    <p>Usuario 1</p>
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