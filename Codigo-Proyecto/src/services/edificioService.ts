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

export interface InmuebleMantenimiento {
    inmueble_id: number;
    empresa_id: number;
    edificio_id: number | null;
    codigo_edificio?: string | null;
    nombre_edificio?: string | null;

    codigo: string;
    tipo_inmueble: 'EDIFICIO' | 'PISO' | 'LOCAL';
    nombre: string;
    subtipo_unidad?: string | null;
    descripcion?: string | null;

    direccion_linea1?: string | null;
    direccion_linea2?: string | null;
    numero?: string | null;
    distrito?: string | null;
    ciudad?: string | null;
    provincia?: string | null;
    departamento?: string | null;
    codigo_postal?: string | null;
    pais?: string | null;

    planta?: string | null;
    letra?: string | null;
    area_m2?: number | null;
    num_habitaciones?: number | null;
    num_banos?: number | null;
    capacidad_personas?: number | null;
    renta_base_mensual?: number | null;
    moneda?: string | null;

    latitud?: number | null;
    longitud?: number | null;
    estado_operativo: string;
    es_publicable: boolean;
    activo: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CaracteristicaCatalogo {
    caracteristica_id: number;
    nombre: string;
    tipo_dato: 'BOOLEAN' | 'TEXTO' | 'NUMERO';
    descripcion?: string | null;
    activo: boolean;
}

export interface CaracteristicaInmueble {
    inmueble_caracteristica_id?: number;
    inmueble_id?: number;
    caracteristica_id: number;
    nombre?: string;
    tipo_dato?: 'BOOLEAN' | 'TEXTO' | 'NUMERO';
    descripcion?: string | null;
    valor_texto?: string | null;
    valor_numero?: number | null;
    valor_boolean?: boolean | null;
}

export interface ActualizarInmuebleData {
    nombre: string;
    descripcion?: string;
    direccion_linea1?: string;
    direccion_linea2?: string;
    numero?: string;
    distrito?: string;
    ciudad?: string;
    provincia?: string;
    departamento?: string;
    codigo_postal?: string;
    pais?: string;
    subtipo_unidad?: string;
    planta?: string;
    letra?: string;
    area_m2?: string | number | null;
    num_habitaciones?: string | number | null;
    num_banos?: string | number | null;
    capacidad_personas?: string | number | null;
    renta_base_mensual?: string | number | null;
    moneda?: string;
    latitud?: string | number | null;
    longitud?: string | number | null;
    estado_operativo: string;
    es_publicable: boolean;
}

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

export const listarInmueblesMantenimiento = async () => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/mantenimiento/inmuebles`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al listar inmuebles para mantenimiento');
    }

    return data;
};

export const obtenerInmuebleMantenimientoPorId = async (inmuebleId: number | string) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/mantenimiento/inmuebles/${inmuebleId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al obtener inmueble');
    }

    return data;
};

export const actualizarInmuebleMantenimiento = async (
    inmuebleId: number | string,
    formData: ActualizarInmuebleData
) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/mantenimiento/inmuebles/${inmuebleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar inmueble');
    }

    return data;
};

export const darBajaInmueble = async (inmuebleId: number | string) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/mantenimiento/inmuebles/${inmuebleId}/baja`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al dar de baja inmueble');
    }

    return data;
};

export const listarCatalogoCaracteristicas = async () => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/mantenimiento/caracteristicas`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al listar características');
    }

    return data;
};

export const obtenerCaracteristicasInmueble = async (inmuebleId: number | string) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/mantenimiento/inmuebles/${inmuebleId}/caracteristicas`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al obtener características del inmueble');
    }

    return data;
};

export const actualizarCaracteristicasInmueble = async (
    inmuebleId: number | string,
    caracteristicas: CaracteristicaInmueble[]
) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/edificios/mantenimiento/inmuebles/${inmuebleId}/caracteristicas`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ caracteristicas })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar características');
    }

    return data;
};