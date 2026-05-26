import { useEffect, useState } from 'react';
import SidebarGestion from '../components/SidebarGestion';

import {
    listarInmueblesMantenimiento,
    darBajaInmueble,
    actualizarInmuebleMantenimiento,
    listarCatalogoCaracteristicas,
    obtenerCaracteristicasInmueble,
    actualizarCaracteristicasInmueble,
    type InmuebleMantenimiento,
    type CaracteristicaCatalogo,
    type CaracteristicaInmueble
} from '../services/edificioService';

function GestionMantenimiento() {
    const [inmuebles, setInmuebles] = useState<InmuebleMantenimiento[]>([]);
    const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState<InmuebleMantenimiento | null>(null);

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formEdicion, setFormEdicion] = useState<any>(null);
    const [catalogoCaracteristicas, setCatalogoCaracteristicas] = useState<CaracteristicaCatalogo[]>([]);
    const [caracteristicasForm, setCaracteristicasForm] = useState<CaracteristicaInmueble[]>([]);
    const [mostrarConfirmacionBaja, setMostrarConfirmacionBaja] = useState(false);

    const cargarInmuebles = async () => {
        try {
            setCargando(true);
            setError('');
            setMensaje('');

            const data = await listarInmueblesMantenimiento();
            setInmuebles(data.inmuebles || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar inmuebles');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarInmuebles();
    }, []);

    const seleccionarInmueble = (inmueble: InmuebleMantenimiento) => {
        setInmuebleSeleccionado(inmueble);
        setMensaje('');
        setError('');
    };

    const abrirEdicion = async () => {
        if (!inmuebleSeleccionado) return;

        setFormEdicion({
            nombre: inmuebleSeleccionado.nombre || '',
            descripcion: inmuebleSeleccionado.descripcion || '',
            direccion_linea1: inmuebleSeleccionado.direccion_linea1 || '',
            direccion_linea2: inmuebleSeleccionado.direccion_linea2 || '',
            numero: inmuebleSeleccionado.numero || '',
            distrito: inmuebleSeleccionado.distrito || '',
            ciudad: inmuebleSeleccionado.ciudad || '',
            provincia: inmuebleSeleccionado.provincia || '',
            departamento: inmuebleSeleccionado.departamento || '',
            codigo_postal: inmuebleSeleccionado.codigo_postal || '',
            pais: inmuebleSeleccionado.pais || 'Perú',
            subtipo_unidad: inmuebleSeleccionado.subtipo_unidad || '',
            planta: inmuebleSeleccionado.planta || '',
            letra: inmuebleSeleccionado.letra || '',
            area_m2: inmuebleSeleccionado.area_m2 || '',
            num_habitaciones: inmuebleSeleccionado.num_habitaciones || '',
            num_banos: inmuebleSeleccionado.num_banos || '',
            capacidad_personas: inmuebleSeleccionado.capacidad_personas || '',
            renta_base_mensual: inmuebleSeleccionado.renta_base_mensual || '',
            moneda: inmuebleSeleccionado.moneda || 'PEN',
            latitud: inmuebleSeleccionado.latitud || '',
            longitud: inmuebleSeleccionado.longitud || '',
            estado_operativo: inmuebleSeleccionado.estado_operativo || 'DISPONIBLE',
            es_publicable: inmuebleSeleccionado.es_publicable
        });

        try {
            setCargando(true);
            setError('');

            const catalogoData = await listarCatalogoCaracteristicas();
            const caracteristicasData = await obtenerCaracteristicasInmueble(inmuebleSeleccionado.inmueble_id);

            setCatalogoCaracteristicas(catalogoData.caracteristicas || []);
            setCaracteristicasForm(caracteristicasData.caracteristicas || []);

            setModoEdicion(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar características');
        } finally {
            setCargando(false);
        }
    };

    const guardarEdicion = async () => {
        if (!inmuebleSeleccionado || !formEdicion) return;

        try {
            setCargando(true);
            setError('');
            setMensaje('');

            await actualizarInmuebleMantenimiento(
                inmuebleSeleccionado.inmueble_id,
                formEdicion
            );

            await actualizarCaracteristicasInmueble(
                inmuebleSeleccionado.inmueble_id,
                caracteristicasForm
            );

            setMensaje('Inmueble actualizado correctamente');
            setModoEdicion(false);
            setFormEdicion(null);
            setInmuebleSeleccionado(null);

            await cargarInmuebles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar inmueble');
        } finally {
            setCargando(false);
        }
    };

    const cambiarCaracteristica = (
        caracteristica: CaracteristicaCatalogo,
        valor: string | number | boolean
    ) => {
        const existentes = caracteristicasForm.filter(
            (item) => item.caracteristica_id !== caracteristica.caracteristica_id
        );

        const nuevaCaracteristica: CaracteristicaInmueble = {
            caracteristica_id: caracteristica.caracteristica_id
        };

        if (caracteristica.tipo_dato === 'BOOLEAN') {
            nuevaCaracteristica.valor_boolean = Boolean(valor);
        }

        if (caracteristica.tipo_dato === 'TEXTO') {
            nuevaCaracteristica.valor_texto = String(valor);
        }

        if (caracteristica.tipo_dato === 'NUMERO') {
            nuevaCaracteristica.valor_numero = valor === '' ? null : Number(valor);
        }

        setCaracteristicasForm([...existentes, nuevaCaracteristica]);
    };

    const confirmarBaja = async () => {
        if (!inmuebleSeleccionado) return;

        try {
            setCargando(true);
            setError('');
            setMensaje('');

            await darBajaInmueble(inmuebleSeleccionado.inmueble_id);

            setMensaje('Inmueble dado de baja correctamente');
            setMostrarConfirmacionBaja(false);
            setInmuebleSeleccionado(null);

            await cargarInmuebles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al dar de baja inmueble');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Mantenimiento de Datos</h1>
                    <p>
                        Modifica o da de baja inmuebles registrados para mantener actualizada
                        la oferta disponible de la empresa.
                    </p>
                </section>

                {mensaje && <div className="alert-success">{mensaje}</div>}
                {error && <div className="alert-error">{error}</div>}

                <section className="mantenimiento-grid">
                    <div className="gestion-card">
                        <div className="section-title-row">
                            <div>
                                <h2>Inmuebles registrados</h2>
                                <p>Selecciona un edificio, piso o local para gestionarlo.</p>
                            </div>

                            <button
                                type="button"
                                className="btn-gestion-secondary"
                                onClick={cargarInmuebles}
                                disabled={cargando}
                            >
                                Actualizar
                            </button>
                        </div>

                        {cargando && <p>Cargando inmuebles...</p>}

                        {!cargando && inmuebles.length === 0 && (
                            <p>No hay inmuebles registrados.</p>
                        )}

                        <div className="mantenimiento-lista">
                            {inmuebles.map((inmueble) => (
                                <button
                                    key={inmueble.inmueble_id}
                                    type="button"
                                    className={
                                        inmuebleSeleccionado?.inmueble_id === inmueble.inmueble_id
                                            ? 'inmueble-item activo'
                                            : 'inmueble-item'
                                    }
                                    onClick={() => seleccionarInmueble(inmueble)}
                                >
                                    <div>
                                        <strong>{inmueble.codigo} - {inmueble.nombre}</strong>
                                        <span>
                                            {inmueble.tipo_inmueble}
                                            {inmueble.nombre_edificio
                                                ? ` · ${inmueble.nombre_edificio}`
                                                : ''}
                                        </span>
                                    </div>

                                    <span className={
                                        inmueble.estado_operativo === 'DISPONIBLE'
                                            ? 'estado-pill disponible'
                                            : 'estado-pill'
                                    }>
                                        {inmueble.estado_operativo}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="gestion-card">
                        <h2>Detalle del inmueble</h2>

                        {!inmuebleSeleccionado && (
                            <p>Selecciona un inmueble para ver sus datos.</p>
                        )}

                        {inmuebleSeleccionado && (
                            <div className="mantenimiento-detalle-inmueble">
                                <div className="mantenimiento-detalle-header">
                                    <div>
                                        <h3>{inmuebleSeleccionado.nombre}</h3>
                                        <p>{inmuebleSeleccionado.codigo}</p>
                                    </div>

                                    <span className="tipo-pill">
                                        {inmuebleSeleccionado.tipo_inmueble}
                                    </span>
                                </div>

                                <div className="mantenimiento-detalle-datos">
                                    <p><strong>Estado:</strong> {inmuebleSeleccionado.estado_operativo}</p>
                                    <p><strong>Dirección:</strong> {inmuebleSeleccionado.direccion_linea1 || '-'}</p>
                                    <p><strong>Número:</strong> {inmuebleSeleccionado.numero || '-'}</p>
                                    <p><strong>Distrito:</strong> {inmuebleSeleccionado.distrito || '-'}</p>
                                    <p><strong>Ciudad:</strong> {inmuebleSeleccionado.ciudad || '-'}</p>
                                    <p><strong>Área:</strong> {inmuebleSeleccionado.area_m2 || '-'} m²</p>

                                    {inmuebleSeleccionado.tipo_inmueble !== 'EDIFICIO' && (
                                        <>
                                            <p><strong>Edificio:</strong> {inmuebleSeleccionado.nombre_edificio || '-'}</p>
                                            <p><strong>Planta:</strong> {inmuebleSeleccionado.planta || '-'}</p>
                                            <p><strong>Letra:</strong> {inmuebleSeleccionado.letra || '-'}</p>
                                            <p><strong>Renta:</strong> {inmuebleSeleccionado.moneda || 'PEN'} {inmuebleSeleccionado.renta_base_mensual || '-'}</p>
                                        </>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn-gestion-primary"
                                        onClick={abrirEdicion}
                                    >
                                        Editar datos
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-danger"
                                        onClick={() => setMostrarConfirmacionBaja(true)}
                                        disabled={cargando}
                                    >
                                        Dar de baja
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                {modoEdicion && formEdicion && inmuebleSeleccionado && (
                    <div className="modal-overlay">
                        <div className="modal-card modal-card-wide">
                            <h2>Editar inmueble</h2>
                            <p>
                                Modificando: <strong>{inmuebleSeleccionado.codigo} - {inmuebleSeleccionado.nombre}</strong>
                            </p>

                            <div className="gestion-form-grid">
                                <div className="gestion-field">
                                    <label>Nombre</label>
                                    <input
                                        name="nombre"
                                        value={formEdicion.nombre}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })}
                                    />
                                </div>

                                <div className="gestion-field">
                                    <label>Estado operativo</label>
                                    <select
                                        value={formEdicion.estado_operativo}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, estado_operativo: e.target.value })}
                                    >
                                        <option value="DISPONIBLE">DISPONIBLE</option>
                                        <option value="RESERVADO">RESERVADO</option>
                                        <option value="OCUPADO">OCUPADO</option>
                                        <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                                        <option value="INACTIVO">INACTIVO</option>
                                    </select>
                                </div>

                                <div className="gestion-field">
                                    <label>Descripción</label>
                                    <textarea
                                        value={formEdicion.descripcion}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, descripcion: e.target.value })}
                                    />
                                </div>

                                <div className="gestion-field">
                                    <label>Área m²</label>
                                    <input
                                        value={formEdicion.area_m2}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, area_m2: e.target.value })}
                                    />
                                </div>

                                {inmuebleSeleccionado.tipo_inmueble === 'EDIFICIO' && (
                                    <>
                                        <div className="gestion-field">
                                            <label>Dirección principal</label>
                                            <input
                                                value={formEdicion.direccion_linea1}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, direccion_linea1: e.target.value })}
                                            />
                                        </div>

                                        <div className="gestion-field">
                                            <label>Número</label>
                                            <input
                                                value={formEdicion.numero}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, numero: e.target.value })}
                                            />
                                        </div>

                                        <div className="gestion-field">
                                            <label>Distrito</label>
                                            <input
                                                value={formEdicion.distrito}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, distrito: e.target.value })}
                                            />
                                        </div>

                                        <div className="gestion-field">
                                            <label>Código postal</label>
                                            <input
                                                value={formEdicion.codigo_postal}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, codigo_postal: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                {inmuebleSeleccionado.tipo_inmueble !== 'EDIFICIO' && (
                                    <>
                                        <div className="gestion-field">
                                            <label>Subtipo</label>
                                            <input
                                                value={formEdicion.subtipo_unidad}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, subtipo_unidad: e.target.value })}
                                            />
                                        </div>

                                        <div className="gestion-field">
                                            <label>Planta</label>
                                            <input
                                                value={formEdicion.planta}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, planta: e.target.value })}
                                            />
                                        </div>

                                        <div className="gestion-field">
                                            <label>Letra</label>
                                            <input
                                                value={formEdicion.letra}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, letra: e.target.value })}
                                            />
                                        </div>

                                        <div className="gestion-field">
                                            <label>Renta mensual</label>
                                            <input
                                                value={formEdicion.renta_base_mensual}
                                                onChange={(e) => setFormEdicion({ ...formEdicion, renta_base_mensual: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="caracteristicas-box">
                                <h3>Características del inmueble</h3>
                                <p>Actualiza las características visibles del inmueble.</p>

                                {catalogoCaracteristicas.length === 0 && (
                                    <p>No hay características registradas en el catálogo.</p>
                                )}

                                <div className="caracteristicas-grid">
                                    {catalogoCaracteristicas.map((caracteristica) => {
                                        const valorActual = caracteristicasForm.find(
                                            (item) => item.caracteristica_id === caracteristica.caracteristica_id
                                        );

                                        return (
                                            <div key={caracteristica.caracteristica_id} className="caracteristica-item">
                                                <label>{caracteristica.nombre}</label>

                                                {caracteristica.tipo_dato === 'BOOLEAN' && (
                                                    <select
                                                        value={valorActual?.valor_boolean ? 'true' : 'false'}
                                                        onChange={(e) =>
                                                            cambiarCaracteristica(
                                                                caracteristica,
                                                                e.target.value === 'true'
                                                            )
                                                        }
                                                    >
                                                        <option value="false">No</option>
                                                        <option value="true">Sí</option>
                                                    </select>
                                                )}

                                                {caracteristica.tipo_dato === 'TEXTO' && (
                                                    <input
                                                        value={valorActual?.valor_texto || ''}
                                                        onChange={(e) =>
                                                            cambiarCaracteristica(caracteristica, e.target.value)
                                                        }
                                                    />
                                                )}

                                                {caracteristica.tipo_dato === 'NUMERO' && (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={valorActual?.valor_numero ?? ''}
                                                        onChange={(e) =>
                                                            cambiarCaracteristica(caracteristica, e.target.value)
                                                        }
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="form-actions modal-actions">
                                <button
                                    type="button"
                                    className="btn-gestion-primary"
                                    onClick={guardarEdicion}
                                    disabled={cargando}
                                >
                                    Guardar cambios
                                </button>

                                <button
                                    type="button"
                                    className="btn-gestion-secondary"
                                    onClick={() => setModoEdicion(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {mostrarConfirmacionBaja && inmuebleSeleccionado && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <h2>Confirmar baja</h2>
                            <p>
                                ¿Seguro que deseas dar de baja este inmueble?
                            </p>

                            <div className="detalle-confirmacion">
                                <p><strong>Código:</strong> {inmuebleSeleccionado.codigo}</p>
                                <p><strong>Nombre:</strong> {inmuebleSeleccionado.nombre}</p>
                                <p><strong>Tipo:</strong> {inmuebleSeleccionado.tipo_inmueble}</p>
                            </div>

                            <div className="form-actions modal-actions">
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={confirmarBaja}
                                    disabled={cargando}
                                >
                                    Confirmar baja
                                </button>

                                <button
                                    type="button"
                                    className="btn-gestion-secondary"
                                    onClick={() => setMostrarConfirmacionBaja(false)}
                                    disabled={cargando}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default GestionMantenimiento;