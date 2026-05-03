import API_URL from './api';

export type PerfilData = {
    usuario_id: number;
    correo: string;
    estado: string;
    email_verificado: boolean;
    perfil_usuario_id: number;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    foto_url: string | null;
    biografia: string | null;
    direccion: string | null;
    distrito: string | null;
    ciudad: string | null;
    pais: string | null;
    recibe_notif_email: boolean;
    recibe_notif_push: boolean;
    recibe_notif_sms: boolean;
    updated_at?: string;
};

export type PerfilFormData = {
    nombres: string;
    apellidos: string;
    telefono: string;
    foto_url: string;
    biografia: string;
    direccion: string;
    distrito: string;
    ciudad: string;
    pais: string;
};

export type NotificacionesData = {
    recibe_notif_email: boolean;
    recibe_notif_push: boolean;
    recibe_notif_sms: boolean;
};

const obtenerToken = () => {
    return localStorage.getItem('token');
};

export const obtenerPerfil = async (): Promise<PerfilData> => {
    const token = obtenerToken();

    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/perfil`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'No se pudo obtener el perfil');
    }

    return data.perfil;
};

export const actualizarPerfil = async (perfil: PerfilFormData): Promise<PerfilData> => {
    const token = obtenerToken();

    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/perfil`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(perfil)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'No se pudo actualizar el perfil');
    }

    return data.perfil;
};

export const actualizarNotificaciones = async (
    notificaciones: NotificacionesData
): Promise<PerfilData> => {
    const token = obtenerToken();

    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/perfil/notificaciones`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notificaciones)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'No se pudieron actualizar las notificaciones');
    }

    return data.perfil;
};