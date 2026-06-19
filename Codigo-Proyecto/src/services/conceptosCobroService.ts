import API_URL from './api';

export interface ConceptoCobro {
    concepto_cobro_id: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    tipo_concepto: string;
    categoria: string;
    metodo_calculo: string;
    aplica_en: string;
    aplica_desde_dias: number;
    aplica_igv: boolean;
    monto_default: number;
    orden_impresion: number;
    es_obligatorio: boolean;
    prorrateable: boolean;
    permite_pago_online: boolean;
    es_sistema: boolean;
    editable: boolean;
    activo: boolean;
}

export interface ConceptoCobroForm {
    codigo?: string;
    nombre: string;
    descripcion?: string;
    tipo_concepto: string;
    categoria: string;
    metodo_calculo: string;
    aplica_en: string;
    aplica_desde_dias: number;
    monto_default: number;
    orden_impresion: number;
    es_obligatorio: boolean;
    aplica_igv: boolean;
    prorrateable: boolean;
    permite_pago_online: boolean;
}

const obtenerToken = () => {
    return localStorage.getItem('token');
};

export const listarConceptosCobro = async (): Promise<ConceptoCobro[]> => {
    const response = await fetch(`${API_URL}/conceptos-cobro`, {
        headers: {
            Authorization: `Bearer ${obtenerToken()}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al listar conceptos de cobro');
    }

    return data.conceptos;
};

export const crearConceptoCobro = async (form: ConceptoCobroForm) => {
    const response = await fetch(`${API_URL}/conceptos-cobro`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(form)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al crear concepto de cobro');
    }

    return data.concepto;
};

export const actualizarConceptoCobro = async (
    conceptoCobroId: number,
    form: ConceptoCobroForm
) => {
    const response = await fetch(`${API_URL}/conceptos-cobro/${conceptoCobroId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(form)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar concepto de cobro');
    }

    return data.concepto;
};

export const cambiarEstadoConceptoCobro = async (
    conceptoCobroId: number,
    activo: boolean
) => {
    const response = await fetch(`${API_URL}/conceptos-cobro/${conceptoCobroId}/estado`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify({ activo })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || 'Error al cambiar estado del concepto');
    }

    return data.concepto;
};