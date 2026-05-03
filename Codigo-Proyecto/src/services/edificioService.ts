import API_URL from './api';

export type EdificioFormData = {
    codigo: string;
    nombre: string;
    descripcion: string;
    direccion_linea1: string;
    direccion_linea2: string;
    numero: string;
    distrito: string;
    ciudad: string;
    provincia: string;
    departamento: string;
    codigo_postal: string;
    pais: string;
    area_m2: string;
    latitud: string;
    longitud: string;
};

export type EdificioListado = {
    inmueble_id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    direccion_linea1: string;
    direccion_linea2?: string;
    numero?: string;
    distrito?: string;
    ciudad?: string;
    provincia?: string;
    departamento?: string;
    codigo_postal?: string;
    pais?: string;
    area_m2?: number;
    estado_operativo: string;
    activo: boolean;
    created_at: string;
};

export type UnidadFormData = {
    edificio_id: string;
    codigo: string;
    tipo_inmueble: string;
    nombre: string;
    subtipo_unidad: string;
    descripcion: string;
    planta: string;
    letra: string;
    area_m2: string;
    num_habitaciones: string;
    num_banos: string;
    capacidad_personas: string;
    renta_base_mensual: string;
    moneda: string;
};

export type UnidadListado = {
    inmueble_id: number;
    edificio_id: number;
    codigo_edificio: string;
    nombre_edificio: string;

    codigo: string;
    tipo_inmueble: string;
    nombre: string;
    subtipo_unidad?: string;
    descripcion?: string;
    planta: string;
    letra: string;

    area_m2?: number;
    num_habitaciones?: number;
    num_banos?: number;
    capacidad_personas?: number;
    renta_base_mensual?: number;
    moneda: string;

    estado_operativo: string;
    es_publicable: boolean;
    activo: boolean;
    created_at: string;
};

const obtenerToken = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No hay sesión activa. Inicia sesión nuevamente.');
    }

    return token;
};

export const registrarEdificio = async (formData: EdificioFormData) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al registrar edificio');
    }

    return data;
};

export const listarEdificios = async () => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al listar edificios');
    }

    return data;
};

export const registrarUnidad = async (formData: UnidadFormData) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/unidades`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al registrar piso/local');
    }

    return data;
};

export const listarUnidadesPorEdificio = async (edificioId: number | string) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/${edificioId}/unidades`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al listar pisos/locales');
    }

    return data;
};

export const obtenerUnidadPorId = async (unidadId: number | string) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/unidades/${unidadId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al obtener piso/local');
    }

    return data;
};