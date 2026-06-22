import type {
  AplicarIPCData,
  AplicarIPCResponse,
  HistorialTarifasResponse,
  InmueblesTarifaResponse,
  IPCRegistroResponse,
  IPCResponse,
  PrevisualizarIPCData,
  PrevisualizarIPCResponse,
  RegistrarIPCData
} from '../types/tarifa.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const obtenerToken = (): string | null => {
  return localStorage.getItem('token');
};

const getHeaders = (): HeadersInit => {
  const token = obtenerToken();

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
};

const manejarRespuesta = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.mensaje || 'Ocurrió un error en la solicitud.');
  }

  return data as T;
};

export const registrarIPC = async (
  data: RegistrarIPCData
): Promise<IPCRegistroResponse> => {
  const response = await fetch(`${API_URL}/tarifas/ipc`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  return manejarRespuesta<IPCRegistroResponse>(response);
};

export const listarIPC = async (): Promise<IPCResponse> => {
  const response = await fetch(`${API_URL}/tarifas/ipc`, {
    method: 'GET',
    headers: getHeaders()
  });

  return manejarRespuesta<IPCResponse>(response);
};

export const listarInmueblesConRenta = async (): Promise<InmueblesTarifaResponse> => {
  const response = await fetch(`${API_URL}/tarifas/inmuebles`, {
    method: 'GET',
    headers: getHeaders()
  });

  return manejarRespuesta<InmueblesTarifaResponse>(response);
};

export const previsualizarAplicacionIPC = async (
  data: PrevisualizarIPCData
): Promise<PrevisualizarIPCResponse> => {
  const response = await fetch(`${API_URL}/tarifas/previsualizar-ipc`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  return manejarRespuesta<PrevisualizarIPCResponse>(response);
};

export const aplicarIPC = async (
  data: AplicarIPCData
): Promise<AplicarIPCResponse> => {
  const response = await fetch(`${API_URL}/tarifas/aplicar-ipc`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  return manejarRespuesta<AplicarIPCResponse>(response);
};

export const listarHistorialTarifas = async (
  inmuebleId: number
): Promise<HistorialTarifasResponse> => {
  const response = await fetch(`${API_URL}/tarifas/inmueble/${inmuebleId}/historial`, {
    method: 'GET',
    headers: getHeaders()
  });

  return manejarRespuesta<HistorialTarifasResponse>(response);
};