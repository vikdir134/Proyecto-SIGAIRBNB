import API_URL from './api';

export interface PublicacionListado {
    publicacion_id: number;
    inmueble_id: number;
    titulo: string;
    descripcion_corta: string | null;
    precio_publicado_mensual: number;
    moneda: string;
    disponible_desde: string | null;
    es_destacado: boolean;
    acepta_reservas: boolean;
    fecha_publicacion: string | null;

    codigo_inmueble: string;
    tipo_inmueble: 'EDIFICIO' | 'PISO' | 'LOCAL';
    nombre_inmueble: string;
    subtipo_unidad: string | null;

    direccion_linea1: string;
    numero: string | null;
    distrito: string | null;
    ciudad: string | null;
    provincia: string | null;
    departamento: string | null;

    area_m2: number | null;
    num_habitaciones: number | null;
    num_banos: number | null;
    capacidad_personas: number | null;
    estado_operativo: string;

    foto_principal: string | null;
}

export interface FotoPublicacion {
    inmueble_foto_id: number;
    publicacion_id: number;
    url_foto: string;
    nombre_archivo: string | null;
    orden_visual: number;
    es_principal: boolean;
    created_at: string;
}

export interface PublicacionDetalle extends PublicacionListado {
    descripcion_larga: string | null;
    condiciones_arrendamiento: string | null;
    estado_publicacion: string;

    descripcion_inmueble: string | null;
    direccion_linea2: string | null;
    codigo_postal: string | null;
    pais: string;
    planta: string | null;
    letra: string | null;
    renta_base_mensual: number | null;
    moneda_inmueble: string;
    es_publicable: boolean;
    activo: boolean;
}

export interface FiltrosPublicacion {
    ubicacion?: string;
    tipo_inmueble?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    precio_min?: string;
    precio_max?: string;
    capacidad_personas?: string;
}

const construirQueryParams = (filtros: FiltrosPublicacion) => {
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
            params.append(clave, String(valor).trim());
        }
    });

    const queryString = params.toString();

    return queryString ? `?${queryString}` : '';
};

const manejarRespuesta = async (response: Response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Ocurrió un error en la solicitud');
    }

    return data;
};

export const listarPublicaciones = async (
    filtros: FiltrosPublicacion = {}
) => {
    const queryParams = construirQueryParams(filtros);

    const response = await fetch(`${API_URL}/publicaciones${queryParams}`, {
        method: 'GET'
    });

    return manejarRespuesta(response);
};

export const obtenerDetallePublicacion = async (publicacionId: number) => {
    const response = await fetch(`${API_URL}/publicaciones/${publicacionId}`, {
        method: 'GET'
    });

    return manejarRespuesta(response);
};