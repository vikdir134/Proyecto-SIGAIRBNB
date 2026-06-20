import API_URL from './api';

const obtenerToken = () => {
    return localStorage.getItem('token');
};

const procesarRespuesta = async <T>(
    response: Response
): Promise<T> => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.mensaje ||
                'Ocurrió un error al procesar la solicitud'
        );
    }

    return data;
};

export interface CategoriaGasto {
    categoria_movimiento_id: number;
    nombre: string;
    naturaleza: string;
    descripcion: string | null;
    activo: boolean;
}

export interface CuentaMantenimiento {
    cuenta_bancaria_id: number;
    empresa_id: number;
    nombre_cuenta: string;
    numero_cuenta: string;
    moneda: string;
    tipo_cuenta: string;
    saldo_actual: number;
    banco: string;
    codigo_banco: string;
}

export interface InmuebleGasto {
    inmueble_id: number;
    codigo: string;
    nombre: string;
    tipo_inmueble: string;
    direccion_linea1: string;
    distrito: string | null;
    ciudad: string | null;
    estado_operativo: string;
}

export interface GastoMantenimiento {
    movimiento_bancario_id: number;
    fecha_movimiento: string;
    concepto: string;
    descripcion: string | null;
    importe: number;
    referencia_externa: string | null;
    observaciones: string | null;
    saldo_anterior: number;
    saldo_posterior: number;

    categoria_movimiento_id?: number;
    categoria?: string;

    cuenta_bancaria_id?: number;
    nombre_cuenta?: string;
    numero_cuenta?: string;
    moneda?: string;

    inmueble_id?: number | null;
    codigo_inmueble?: string | null;
    inmueble?: string | null;
    tipo_inmueble?: string | null;
}

export interface FormularioGastoResponse {
    mensaje: string;
    categorias: CategoriaGasto[];
    cuentas: CuentaMantenimiento[];
    inmuebles: InmuebleGasto[];
}

export interface ListarGastosResponse {
    mensaje: string;
    gastos: GastoMantenimiento[];
}

export interface RegistrarGastoForm {
    cuenta_bancaria_id: number;
    categoria_movimiento_id: number;
    inmueble_id?: number | null;
    fecha_movimiento: string;
    concepto: string;
    descripcion?: string;
    importe: number;
    referencia_externa?: string;
    observaciones?: string;
}

export interface RegistrarGastoResponse {
    mensaje: string;
    gasto: GastoMantenimiento;
}

export const obtenerDatosFormularioGasto =
    async (): Promise<FormularioGastoResponse> => {
        const response = await fetch(
            `${API_URL}/mantenimiento/formulario`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${obtenerToken()}`
                }
            }
        );

        return procesarRespuesta<FormularioGastoResponse>(
            response
        );
    };

export const listarGastosMantenimiento =
    async (): Promise<ListarGastosResponse> => {
        const response = await fetch(
            `${API_URL}/mantenimiento/gastos`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${obtenerToken()}`
                }
            }
        );

        return procesarRespuesta<ListarGastosResponse>(
            response
        );
    };

export const registrarGastoMantenimiento = async (
    form: RegistrarGastoForm
): Promise<RegistrarGastoResponse> => {
    const response = await fetch(
        `${API_URL}/mantenimiento/gastos`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify(form)
        }
    );

    return procesarRespuesta<RegistrarGastoResponse>(
        response
    );
};