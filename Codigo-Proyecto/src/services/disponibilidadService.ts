import API_URL from './api';


export interface InmuebleDisponibilidad {
    inmueble_id: number;
    empresa_id: number;
    edificio_id: number | null;
    codigo_edificio: string | null;
    nombre_edificio: string | null;
    codigo: string;
    tipo_inmueble: 'EDIFICIO' | 'PISO' | 'LOCAL';
    nombre: string;
    subtipo_unidad: string | null;
    direccion_linea1: string;
    numero: string | null;
    distrito: string | null;
    ciudad: string | null;
    provincia: string | null;
    departamento: string | null;
    planta: string | null;
    letra: string | null;
    estado_operativo: string;
    es_publicable: boolean;
    activo: boolean;
    created_at: string;
}

export interface BloqueoDisponibilidad {
    bloqueo_disponibilidad_id: number;
    bloqueo_padre_id: number | null;
    inmueble_id: number;
    codigo_inmueble?: string;
    nombre_inmueble?: string;
    tipo_inmueble?: string;
    fecha_inicio: string;
    fecha_fin: string;
    motivo: string | null;
    origen: 'MANUAL' | 'MANTENIMIENTO' | 'OTRO';
    activo: boolean;
    created_at: string;
}

export interface BloqueoFormData {
    inmueble_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    motivo: string;
    origen: 'MANUAL' | 'MANTENIMIENTO' | 'OTRO';
}

export interface EditarBloqueoFormData {
    fecha_inicio: string;
    fecha_fin: string;
    motivo: string;
    origen: 'MANUAL' | 'MANTENIMIENTO' | 'OTRO';
}

const obtenerToken = () => {
    return localStorage.getItem('token');
};

const construirHeaders = () => {
    const token = obtenerToken();

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

const manejarRespuesta = async (response: Response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Ocurrió un error en la solicitud');
    }

    return data;
};

export const listarInmueblesDisponibilidad = async () => {
    const response = await fetch(`${API_URL}/disponibilidad/inmuebles`, {
        method: 'GET',
        headers: construirHeaders()
    });

    return manejarRespuesta(response);
};

export const listarBloqueosPorInmueble = async (inmuebleId: number) => {
    const response = await fetch(
        `${API_URL}/disponibilidad/inmuebles/${inmuebleId}/bloqueos`,
        {
            method: 'GET',
            headers: construirHeaders()
        }
    );

    return manejarRespuesta(response);
};

export const obtenerCalendarioDisponibilidad = async (
    inmuebleId: number,
    fechaInicio: string,
    fechaFin: string
) => {
    const response = await fetch(
        `${API_URL}/disponibilidad/inmuebles/${inmuebleId}/calendario?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
        {
            method: 'GET',
            headers: construirHeaders()
        }
    );

    return manejarRespuesta(response);
};

export const crearBloqueoDisponibilidad = async (
    formData: BloqueoFormData
) => {
    const response = await fetch(`${API_URL}/disponibilidad/bloqueos`, {
        method: 'POST',
        headers: construirHeaders(),
        body: JSON.stringify(formData)
    });

    return manejarRespuesta(response);
};

export const editarBloqueoDisponibilidad = async (
    bloqueoId: number,
    formData: EditarBloqueoFormData
) => {
    const response = await fetch(
        `${API_URL}/disponibilidad/bloqueos/${bloqueoId}`,
        {
            method: 'PUT',
            headers: construirHeaders(),
            body: JSON.stringify(formData)
        }
    );

    return manejarRespuesta(response);
};

export const eliminarBloqueoDisponibilidad = async (bloqueoId: number) => {
    const response = await fetch(
        `${API_URL}/disponibilidad/bloqueos/${bloqueoId}`,
        {
            method: 'DELETE',
            headers: construirHeaders()
        }
    );

    return manejarRespuesta(response);
};