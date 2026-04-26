import { useState } from 'react';
import SidebarGestion from '../components/SidebarGestion';
import {
    registrarEdificio,
    type EdificioFormData
} from '../services/edificioService';

function GestionEdificio() {
    const [form, setForm] = useState<EdificioFormData>({
        codigo: '',
        nombre: '',
        descripcion: '',
        direccion_linea1: '',
        direccion_linea2: '',
        numero: '',
        distrito: '',
        ciudad: '',
        provincia: '',
        departamento: '',
        codigo_postal: '',
        pais: 'Perú',
        area_m2: '',
        latitud: '',
        longitud: ''
    });

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    const limpiarFormulario = () => {
        setForm({
            codigo: '',
            nombre: '',
            descripcion: '',
            direccion_linea1: '',
            direccion_linea2: '',
            numero: '',
            distrito: '',
            ciudad: '',
            provincia: '',
            departamento: '',
            codigo_postal: '',
            pais: 'Perú',
            area_m2: '',
            latitud: '',
            longitud: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setMensaje('');
        setError('');
        setCargando(true);

        try {
            const data = await registrarEdificio(form);
            setMensaje(data.mensaje || 'Edificio registrado correctamente');
            limpiarFormulario();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Error inesperado al registrar edificio');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Registrar Edificio</h1>
                    <p>
                        Registra un edificio completo con sus datos generales para agrupar unidades.
                    </p>
                </section>

                <section className="gestion-card">
                    <h2>Datos generales del edificio</h2>
                    <p>
                        Completa la dirección, código postal, número y datos principales del edificio.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="gestion-form-grid">
                            <div className="gestion-field">
                                <label htmlFor="codigo">Código del edificio</label>
                                <input
                                    type="text"
                                    id="codigo"
                                    name="codigo"
                                    placeholder="EDIF-001"
                                    value={form.codigo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="nombre">Nombre del edificio</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    placeholder="Edificio Miraflores Central"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="gestion-field gestion-field-full">
                                <label htmlFor="descripcion">Descripción</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    placeholder="Descripción general del edificio"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="direccion_linea1">Dirección principal</label>
                                <input
                                    type="text"
                                    id="direccion_linea1"
                                    name="direccion_linea1"
                                    placeholder="Av. José Larco"
                                    value={form.direccion_linea1}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="numero">Número</label>
                                <input
                                    type="text"
                                    id="numero"
                                    name="numero"
                                    placeholder="123"
                                    value={form.numero}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="codigo_postal">Código postal</label>
                                <input
                                    type="text"
                                    id="codigo_postal"
                                    name="codigo_postal"
                                    placeholder="15074"
                                    value={form.codigo_postal}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="direccion_linea2">Referencia</label>
                                <input
                                    type="text"
                                    id="direccion_linea2"
                                    name="direccion_linea2"
                                    placeholder="Cerca al parque Kennedy"
                                    value={form.direccion_linea2}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="distrito">Distrito</label>
                                <input
                                    type="text"
                                    id="distrito"
                                    name="distrito"
                                    placeholder="Miraflores"
                                    value={form.distrito}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="ciudad">Ciudad</label>
                                <input
                                    type="text"
                                    id="ciudad"
                                    name="ciudad"
                                    placeholder="Lima"
                                    value={form.ciudad}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="provincia">Provincia</label>
                                <input
                                    type="text"
                                    id="provincia"
                                    name="provincia"
                                    placeholder="Lima"
                                    value={form.provincia}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="departamento">Departamento</label>
                                <input
                                    type="text"
                                    id="departamento"
                                    name="departamento"
                                    placeholder="Lima"
                                    value={form.departamento}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="pais">País</label>
                                <input
                                    type="text"
                                    id="pais"
                                    name="pais"
                                    placeholder="Perú"
                                    value={form.pais}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="area_m2">Área total m²</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="area_m2"
                                    name="area_m2"
                                    placeholder="850.50"
                                    value={form.area_m2}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="latitud">Latitud</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    id="latitud"
                                    name="latitud"
                                    placeholder="-12.121234"
                                    value={form.latitud}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="gestion-field">
                                <label htmlFor="longitud">Longitud</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    id="longitud"
                                    name="longitud"
                                    placeholder="-77.030456"
                                    value={form.longitud}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {mensaje && <p className="success-message">{mensaje}</p>}
                        {error && <p className="error-message">{error}</p>}

                        <div className="gestion-actions">
                            <button
                                type="submit"
                                className="btn-save"
                                disabled={cargando}
                            >
                                {cargando ? 'Guardando...' : 'Guardar edificio'}
                            </button>

                            <button
                                type="button"
                                className="btn-reset"
                                onClick={limpiarFormulario}
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default GestionEdificio;