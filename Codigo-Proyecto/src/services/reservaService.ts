import API_URL from './api';

export interface SolicitudReservaFormData {
    publicacion_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    observacion_inquilino?: string;
}

export interface SolicitudReserva {
    reserva_id: number;
    inmueble_id: number;
    inquilino_id: number;
    estado_reserva: string;

    fecha_solicitud: string;
    fecha_inicio: string;
    fecha_fin: string;

    renta_pactada_mensual: number;
    monto_total_estimado: number | null;
    deposito_garantia: number | null;
    moneda: string;

    observacion_inquilino: string | null;
    observacion_gestor: string | null;
    motivo_rechazo: string | null;
    fecha_decision: string | null;

    created_at: string;
    updated_at?: string;

    codigo_inmueble?: string;
    nombre_inmueble?: string;
    tipo_inmueble?: string;
    subtipo_unidad?: string | null;

    direccion_linea1?: string;
    numero?: string | null;
    distrito?: string | null;
    ciudad?: string | null;
    provincia?: string | null;
    departamento?: string | null;

    publicacion_id?: number;
    titulo_publicacion?: string;
    descripcion_corta?: string | null;
    precio_publicado_mensual?: number;
    foto_principal?: string | null;
}

export interface EventoReserva {
    reserva_evento_id: number;
    reserva_id: number;
    usuario_id: number | null;
    tipo_evento: string;
    descripcion: string | null;
    fecha_evento: string;

    correo_usuario?: string | null;
    nombres_usuario?: string | null;
    apellidos_usuario?: string | null;
}

export interface SolicitarReservaResponse {
    mensaje: string;
    publicacion: {
        publicacion_id: number;
        inmueble_id: number;
        titulo: string;
        codigo_inmueble: string;
        nombre_inmueble: string;
        tipo_inmueble: string;
    };
    reserva: SolicitudReserva;
}

export interface MisSolicitudesResponse {
    mensaje: string;
    total: number;
    solicitudes: SolicitudReserva[];
}

export interface DetalleMiSolicitudResponse {
    mensaje: string;
    solicitud: SolicitudReserva;
    total_eventos: number;
    eventos: EventoReserva[];
}

const obtenerHeaders = () => {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
    };
};

const manejarRespuesta = async <T>(response: Response): Promise<T> => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error en la solicitud');
    }

    return data;
};

export const solicitarReserva = async (
    data: SolicitudReservaFormData
): Promise<SolicitarReservaResponse> => {
    const response = await fetch(`${API_URL}/reservas/solicitudes`, {
        method: 'POST',
        headers: obtenerHeaders(),
        body: JSON.stringify(data)
    });

    return manejarRespuesta<SolicitarReservaResponse>(response);
};

export const listarMisSolicitudes = async (): Promise<MisSolicitudesResponse> => {
    const response = await fetch(`${API_URL}/reservas/mis-solicitudes`, {
        method: 'GET',
        headers: obtenerHeaders()
    });

    return manejarRespuesta<MisSolicitudesResponse>(response);
};

export const obtenerDetalleMiSolicitud = async (
    reservaId: number
): Promise<DetalleMiSolicitudResponse> => {
    const response = await fetch(`${API_URL}/reservas/mis-solicitudes/${reservaId}`, {
        method: 'GET',
        headers: obtenerHeaders()
    });

    return manejarRespuesta<DetalleMiSolicitudResponse>(response);
};

export interface SolicitudReservaGestion extends SolicitudReserva {
    gestionado_por_usuario_id: number | null;

    correo_inquilino: string;
    nombres_inquilino: string | null;
    apellidos_inquilino: string | null;
    telefono_inquilino: string | null;

    tipo_documento: string | null;
    numero_documento: string | null;

    ingreso_mensual_referencial: number | null;
    tiene_aval_bancario: boolean;
    tiene_contrato_trabajo: boolean;
    tiene_garante: boolean;
}

export interface SolicitudesGestionResponse {
    mensaje: string;
    total: number;
    solicitudes: SolicitudReservaGestion[];
}

export interface AprobarSolicitudResponse {
    mensaje: string;
    reserva: SolicitudReserva;
}

export interface RechazarSolicitudResponse {
    mensaje: string;
    reserva: SolicitudReserva;
}

export interface AprobarSolicitudData {
    observacion_gestor?: string;
}

export interface RechazarSolicitudData {
    motivo_rechazo: string;
    observacion_gestor?: string;
}

export const listarSolicitudesGestion = async (
    estadoReserva?: string
): Promise<SolicitudesGestionResponse> => {
    const query = estadoReserva
        ? `?estado_reserva=${encodeURIComponent(estadoReserva)}`
        : '';

    const response = await fetch(`${API_URL}/reservas/gestion/solicitudes${query}`, {
        method: 'GET',
        headers: obtenerHeaders()
    });

    return manejarRespuesta<SolicitudesGestionResponse>(response);
};

export const aprobarSolicitudReservaGestion = async (
    reservaId: number,
    data: AprobarSolicitudData
): Promise<AprobarSolicitudResponse> => {
    const response = await fetch(
        `${API_URL}/reservas/gestion/solicitudes/${reservaId}/aprobar`,
        {
            method: 'PATCH',
            headers: obtenerHeaders(),
            body: JSON.stringify(data)
        }
    );

    return manejarRespuesta<AprobarSolicitudResponse>(response);
};

export const rechazarSolicitudReservaGestion = async (
    reservaId: number,
    data: RechazarSolicitudData
): Promise<RechazarSolicitudResponse> => {
    const response = await fetch(
        `${API_URL}/reservas/gestion/solicitudes/${reservaId}/rechazar`,
        {
            method: 'PATCH',
            headers: obtenerHeaders(),
            body: JSON.stringify(data)
        }
    );

    return manejarRespuesta<RechazarSolicitudResponse>(response);
};

export interface EventosGestionReservaResponse {
    mensaje: string;
    reserva: {
        reserva_id: number;
        inmueble_id: number;
        inquilino_id: number;
        estado_reserva: string;
        fecha_inicio: string;
        fecha_fin: string;
        codigo_inmueble: string;
        nombre_inmueble: string;
        tipo_inmueble: string;
    };
    total: number;
    eventos: EventoReserva[];
}

export const obtenerEventosReservaGestion = async (
    reservaId: number
): Promise<EventosGestionReservaResponse> => {
    const response = await fetch(
        `${API_URL}/reservas/gestion/solicitudes/${reservaId}/eventos`,
        {
            method: 'GET',
            headers: obtenerHeaders()
        }
    );

    return manejarRespuesta<EventosGestionReservaResponse>(response);
};