import { Navigate } from 'react-router-dom';

type RutaAdminProps = {
    children: JSX.Element;
};

function RutaAdmin({ children }: RutaAdminProps) {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!token || !usuarioGuardado) {
        return <Navigate to="/Login" replace />;
    }

    try {
        const usuario = JSON.parse(usuarioGuardado);
        const roles = usuario.roles || [];

        if (!roles.includes('ADMIN')) {
            return <Navigate to="/GestionHome" replace />;
        }

        return children;
    } catch (error) {
        return <Navigate to="/Login" replace />;
    }
}

export default RutaAdmin;