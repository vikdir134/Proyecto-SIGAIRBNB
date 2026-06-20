import API_URL from './api';

export interface ReciboPendiente {
    recibo_id: number;
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

    inmueble_id: number;
    empresa_id: number;
    codigo_inmueble: string;
    nombre_inmueble: string;
    direccion_linea1?: string;
    distrito?: string;
    ciudad?: string;

    numero_recibo_base?: string;
    nombres_inquilino?: string;
    apellidos_inquilino?: string;
}

export interface Pago {
    pago_id: number;
    recibo_id: number;
    reserva_id: number;
    metodo_pago: string;
    proveedor_pasarela?: string | null;
    transaccion_externa?: string | null;
    referencia?: string | null;
    monto: number;
    moneda: string;
    estado_pago: string;
    fecha_pago: string;
    fecha_confirmacion?: string | null;
    observaciones?: string | null;

    periodo_anio?: number;
    periodo_mes?: number;
    estado_recibo?: string;

    inmueble_id?: number;
    empresa_id?: number;
    codigo_inmueble?: string;
    nombre_inmueble?: string;
}

export type MetodoPago = 'ONLINE' | 'TARJETA' | 'TRANSFERENCIA' | 'EFECTIVO';

const obtenerToken = () => {
    return localStorage.getItem('token');
};

const crearHeaders = () => {
    const token = obtenerToken();

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

export const obtenerMisRecibosPendientes = async (): Promise<ReciboPendiente[]> => {
    const response = await fetch(`${API_URL}/pagos/mis-recibos-pendientes`, {
        method: 'GET',
        headers: crearHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al obtener los recibos pendientes.');
    }

    return data.recibos || [];
};

export const obtenerDetalleReciboParaPago = async (
    recibo_id: number
): Promise<ReciboPendiente> => {
    const response = await fetch(`${API_URL}/pagos/recibos/${recibo_id}`, {
        method: 'GET',
        headers: crearHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al obtener el detalle del recibo.');
    }

    return data.recibo;
};

export const pagarReciboOnline = async (
    recibo_id: number,
    metodo_pago: MetodoPago = 'ONLINE'
): Promise<{
    pago: Pago;
    monto_pagado: number;
    mensaje: string;
}> => {
    const metodoNormalizado = metodo_pago.toUpperCase() as MetodoPago;

    const response = await fetch(`${API_URL}/pagos/recibos/${recibo_id}/pagar-online`, {
        method: 'POST',
        headers: crearHeaders(),
        body: JSON.stringify({
            metodo_pago: metodoNormalizado,
            proveedor_pasarela:
                metodoNormalizado === 'ONLINE' || metodoNormalizado === 'TARJETA'
                    ? 'SIMULADO'
                    : null,
            referencia: `PAGO-WEB-HU16-${metodoNormalizado}-${recibo_id}-${Date.now()}`
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al procesar el pago.');
    }

    return data;
};

export const obtenerMisPagos = async (): Promise<Pago[]> => {
    const response = await fetch(`${API_URL}/pagos/mis-pagos`, {
        method: 'GET',
        headers: crearHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al obtener el historial de pagos.');
    }

    return data.pagos || [];
};