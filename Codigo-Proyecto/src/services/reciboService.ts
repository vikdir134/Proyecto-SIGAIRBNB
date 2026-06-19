import API_URL from './api';

const obtenerToken = () => {
    return localStorage.getItem('token');
};

const procesarRespuesta = async <T>(
    response: Response
): Promise<T> => {
    const contentType = response.headers.get('content-type');

    if (
        contentType &&
        contentType.includes('application/json')
    ) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.mensaje ||
                    'Ocurrió un error al procesar la solicitud'
            );
        }

        return data;
    }

    if (!response.ok) {
        throw new Error(
            'Ocurrió un error al procesar la solicitud'
        );
    }

    return {} as T;
};

export interface ReciboReserva {
    recibo_id: number;
    cuenta_cobro_inmueble_id: number;
    reserva_id: number;
    periodo_anio: number;
    periodo_mes: number;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado_recibo: string;
    subtotal: number;
    igv_total: number;
    total: number;
    saldo_pendiente: number;
    pdf_url?: string | null;
    observaciones?: string | null;
    created_at?: string;
    numero_recibo_base?: string;
    moneda?: string;
    codigo_inmueble?: string;
    nombre_inmueble?: string;
    tipo_inmueble?: string;
    serie_empresa?: string;
correlativo_empresa?: number;
}

export interface ReciboDetalle {
    recibo_detalle_id: number;
    recibo_id: number;
    concepto_cobro_id: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    importe: number;
    orden_impresion: number;
    codigo_concepto: string;
    nombre_concepto: string;
    aplica_igv: boolean;
}

export interface ConceptoPreviewRecibo {
    concepto_cobro_id: number;
    codigo: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    importe: number;
    aplica_igv: boolean;
    orden_impresion: number;
    igv: number;
    total_linea: number;
    obligatorio: boolean;
    editable: boolean;
}

export interface VistaPreviaRecibo {
    reserva: unknown;
    conceptos: ConceptoPreviewRecibo[];
    subtotal: number;
    igv_total: number;
    total: number;
    dias_reserva: number;
    fecha_vencimiento: string;
}

interface PreviewReciboResponse extends VistaPreviaRecibo {
    mensaje: string;
}

interface GenerarReciboResponse {
    mensaje: string;
    recibo: ReciboReserva;
    detalles: ReciboDetalle[];
    notificacion?: unknown;
    advertencia_notificacion?: string | null;
}

interface ListarRecibosReservaResponse {
    mensaje: string;
    recibos: ReciboReserva[];
}

interface ObtenerDetalleReciboResponse {
    mensaje: string;
    recibo: ReciboReserva;
    detalles: ReciboDetalle[];
}

export const previsualizarReciboReservaGestion = async (
    reservaId: number
): Promise<PreviewReciboResponse> => {
    const response = await fetch(
        `${API_URL}/recibos/reservas/${reservaId}/preview`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    return procesarRespuesta<PreviewReciboResponse>(
        response
    );
};

export const verReciboPdf = async (
    reciboId: number
): Promise<void> => {
    const response = await fetch(
        `${API_URL}/recibos/${reciboId}/pdf?modo=ver`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    if (!response.ok) {
        let mensaje =
            'No se pudo abrir la boleta digital';

        try {
            const data = await response.json();
            mensaje = data.mensaje || mensaje;
        } catch {
            // No hacer nada
        }

        throw new Error(mensaje);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    window.open(url, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 1000);
};

export const generarReciboReservaGestion = async (
    reservaId: number,
    observaciones?: string
): Promise<GenerarReciboResponse> => {
    const response = await fetch(
        `${API_URL}/recibos/reservas/${reservaId}/generar`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify({
                observaciones:
                    observaciones ||
                    'Boleta digital emitida desde la gestión de reservas.'
            })
        }
    );

    return procesarRespuesta<GenerarReciboResponse>(
        response
    );
};

export const listarRecibosReserva = async (
    reservaId: number
): Promise<ListarRecibosReservaResponse> => {
    const response = await fetch(
        `${API_URL}/recibos/reservas/${reservaId}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    return procesarRespuesta<ListarRecibosReservaResponse>(
        response
    );
};

export const obtenerDetalleRecibo = async (
    reciboId: number
): Promise<ObtenerDetalleReciboResponse> => {
    const response = await fetch(
        `${API_URL}/recibos/${reciboId}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    return procesarRespuesta<ObtenerDetalleReciboResponse>(
        response
    );
};

export const descargarReciboPdf = async (
    reciboId: number
): Promise<void> => {
    const response = await fetch(
        `${API_URL}/recibos/${reciboId}/pdf`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    if (!response.ok) {
        let mensaje =
            'No se pudo descargar la boleta digital';

        try {
            const data = await response.json();
            mensaje = data.mensaje || mensaje;
        } catch {
            // No hacer nada si no viene JSON
        }

        throw new Error(mensaje);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `boleta-digital-${String(
        reciboId
    ).padStart(6, '0')}.pdf`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    window.URL.revokeObjectURL(url);
};

export const obtenerNumeroVisualRecibo = (
    recibo: Pick<
        ReciboReserva,
        'recibo_id' | 'serie_empresa' | 'correlativo_empresa'
    >
): string => {
    if (
        recibo.serie_empresa &&
        recibo.correlativo_empresa
    ) {
        return `${recibo.serie_empresa}-${String(
            recibo.correlativo_empresa
        ).padStart(6, '0')}`;
    }

    return `B-${String(recibo.recibo_id).padStart(6, '0')}`;
};