import API_URL from './api';

export interface SecretarioAsignado {
    empresa_secretario_id: number;
    empresa_id: number;
    secretario_usuario_id: number;
    asignado_por_usuario_id: number;
    activo: boolean;
    fecha_asignacion: string;
    fecha_revocacion: string | null;
    updated_at: string;
    correo_secretario: string;
    nombres: string | null;
    apellidos: string | null;
    correo_asignador?: string;
    razon_social?: string;
    nombre_comercial?: string;
}

interface EliminarSecretarioResponse {
    mensaje: string;
    asignacion: SecretarioAsignado;
}

interface ListaSecretariosResponse {
    mensaje: string;
    cantidad: number;
    secretarios: SecretarioAsignado[];
}

interface AsignarSecretarioResponse {
    mensaje: string;
    asignacion: SecretarioAsignado;
}

interface RevocarSecretarioResponse {
    mensaje: string;
    asignacion: SecretarioAsignado;
    rol_secretario_removido: boolean;
}

interface ReactivarSecretarioResponse {
    mensaje: string;
    asignacion: SecretarioAsignado;
}

const obtenerToken = (): string => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error(
            'No se encontró una sesión activa. Inicia sesión nuevamente.'
        );
    }

    return token;
};

const procesarRespuesta = async <T>(
    response: Response
): Promise<T> => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.mensaje ||
            'Ocurrió un error al procesar la solicitud'
        );
    }

    return data as T;
};

export const obtenerSecretariosEmpresa =
    async (): Promise<ListaSecretariosResponse> => {
        const response = await fetch(
            `${API_URL}/secretarios/asignaciones`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${obtenerToken()}`
                }
            }
        );

        return procesarRespuesta<ListaSecretariosResponse>(
            response
        );
    };

export const asignarSecretarioEmpresa = async (
    correo: string
): Promise<AsignarSecretarioResponse> => {
    const response = await fetch(
        `${API_URL}/secretarios/asignaciones`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify({
                correo: correo.trim().toLowerCase()
            })
        }
    );

    return procesarRespuesta<AsignarSecretarioResponse>(
        response
    );
};

export const revocarSecretarioEmpresa = async (
    empresaSecretarioId: number
): Promise<RevocarSecretarioResponse> => {
    const response = await fetch(
        `${API_URL}/secretarios/asignaciones/${empresaSecretarioId}/revocar`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    return procesarRespuesta<RevocarSecretarioResponse>(
        response
    );
};

export const eliminarSecretarioRevocado = async (
    empresaSecretarioId: number
): Promise<EliminarSecretarioResponse> => {
    const response = await fetch(
        `${API_URL}/secretarios/asignaciones/${empresaSecretarioId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    return procesarRespuesta<EliminarSecretarioResponse>(
        response
    );
};

export const reactivarSecretarioEmpresa = async (
    empresaSecretarioId: number
): Promise<ReactivarSecretarioResponse> => {
    const response = await fetch(
        `${API_URL}/secretarios/asignaciones/${empresaSecretarioId}/reactivar`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${obtenerToken()}`
            }
        }
    );

    return procesarRespuesta<ReactivarSecretarioResponse>(
        response
    );
};