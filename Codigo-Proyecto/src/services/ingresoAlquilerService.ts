const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const obtenerToken = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    ''
  );
};

const crearHeaders = () => {
  const token = obtenerToken();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export interface CategoriaIngreso {
  categoria_movimiento_id: number;
  nombre: string;
  naturaleza: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface CuentaIngreso {
  cuenta_bancaria_id: number;
  empresa_id: number;
  nombre_cuenta: string;
  numero_cuenta: string;
  moneda: string;
  tipo_cuenta: string;
  saldo_actual: number;
  banco: string;
  codigo_banco?: string;
}

export interface ReciboPendienteIngreso {
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
  observaciones?: string | null;

  inquilino_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  moneda: string;

  inmueble_id: number;
  empresa_id: number;
  codigo_inmueble: string;
  nombre_inmueble: string;
  tipo_inmueble: string;
  direccion_linea1?: string;
  distrito?: string;
  ciudad?: string;

  nombres_inquilino?: string;
  apellidos_inquilino?: string;
  numero_documento?: string;
  telefono_inquilino?: string;
  correo_inquilino?: string;
}

export interface IngresoAlquiler {
  pago_id?: number;
  movimiento_bancario_id?: number;

  recibo_id?: number;
  reserva_id?: number;
  usuario_pagador_id?: number;
  inquilino_id?: number;

  metodo_pago?: string;
  referencia?: string | null;
  referencia_externa?: string | null;

  importe: number;
  monto?: number;
  moneda: string;

  estado_pago?: string;
  fecha_pago?: string;
  fecha_confirmacion?: string | null;

  fecha_movimiento?: string;
  concepto?: string;
  descripcion?: string | null;
  observaciones?: string | null;

  saldo_anterior?: number;
  saldo_posterior?: number;

  estado_recibo?: string;
  total_recibo?: number;
  saldo_pendiente?: number;

  inmueble_id?: number;
  codigo_inmueble?: string;
  inmueble?: string;
  tipo_inmueble?: string;

  nombres_inquilino?: string;
  apellidos_inquilino?: string;

  tiene_movimiento_tesoreria?: boolean | number;
}

export interface DatosFormularioIngreso {
  categorias: CategoriaIngreso[];
  cuentas: CuentaIngreso[];
  recibos_pendientes: ReciboPendienteIngreso[];
}

export interface RegistrarIngresoPayload {
  cuenta_bancaria_id: number;
  categoria_movimiento_id: number;
  recibo_id: number;
  importe: number;
  metodo_pago: 'ONLINE' | 'TARJETA' | 'TRANSFERENCIA' | 'EFECTIVO';
  fecha_movimiento?: string;
  concepto?: string;
  descripcion?: string;
  referencia_externa?: string;
  observaciones?: string;
}

const manejarRespuesta = async (response: Response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.mensaje ||
        data?.errores?.join(', ') ||
        'Ocurrió un error en la solicitud.'
    );
  }

  return data;
};

export const obtenerDatosFormularioIngreso = async (): Promise<DatosFormularioIngreso> => {
  const response = await fetch(`${API_URL}/ingresos-alquiler/formulario`, {
    method: 'GET',
    headers: crearHeaders()
  });

  const data = await manejarRespuesta(response);

  return {
    categorias: data.categorias || [],
    cuentas: data.cuentas || [],
    recibos_pendientes: data.recibos_pendientes || []
  };
};

export const listarRecibosPendientesIngreso = async (): Promise<ReciboPendienteIngreso[]> => {
  const response = await fetch(`${API_URL}/ingresos-alquiler/recibos-pendientes`, {
    method: 'GET',
    headers: crearHeaders()
  });

  const data = await manejarRespuesta(response);

  return data.recibos || [];
};

export const listarIngresosAlquiler = async (): Promise<IngresoAlquiler[]> => {
  const response = await fetch(`${API_URL}/ingresos-alquiler/ingresos`, {
    method: 'GET',
    headers: crearHeaders()
  });

  const data = await manejarRespuesta(response);

  return data.ingresos || [];
};

export const registrarIngresoAlquiler = async (
  payload: RegistrarIngresoPayload
) => {
  const response = await fetch(`${API_URL}/ingresos-alquiler/ingresos`, {
    method: 'POST',
    headers: crearHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await manejarRespuesta(response);

  return data.ingreso;
};