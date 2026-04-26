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

export const registrarEdificio = async (formData: EdificioFormData) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No hay sesión activa. Inicia sesión nuevamente.');
    }

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