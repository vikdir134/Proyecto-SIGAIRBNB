import API_URL from './api';

export type UsuarioAdmin = {
    usuario_id: number;
    empresa_id: number;
    correo: string;
    estado: string;
    email_verificado: boolean;
    activo: boolean;
    created_at: string;
    ultimo_acceso?: string | null;

    nombres?: string | null;
    apellidos?: string | null;
    telefono?: string | null;
    tipo_documento?: string | null;
    numero_documento?: string | null;

    roles?: string | null;
};

const obtenerToken = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No hay sesión activa. Inicia sesión nuevamente.');
    }

    return token;
};

export const listarUsuariosAdmin = async () => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/admin/usuarios`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al listar usuarios');
    }

    return data;
};

export const inactivarUsuarioAdmin = async (usuarioId: number | string) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/admin/usuarios/${usuarioId}/inactivar`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al inactivar usuario');
    }

    return data;
};

export const reactivarUsuarioAdmin = async (usuarioId: number | string) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/admin/usuarios/${usuarioId}/reactivar`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al reactivar usuario');
    }

    return data;
};