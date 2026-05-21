import { useEffect, useState } from 'react';
import SidebarGestion from '../components/SidebarGestion';
import DetalleGestionReservaDialog from '../components/DetalleGestionReservaDialog';
import ConfirmDecisionReservaDialog from '../components/ConfirmDecisionReservaDialog';
import {
    listarSolicitudesGestion,
    aprobarSolicitudReservaGestion,
    rechazarSolicitudReservaGestion,
    type SolicitudReservaGestion
} from '../services/reservaService';

function GestionSolicitudesReserva() {
    const [solicitudes, setSolicitudes] = useState<SolicitudReservaGestion[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [procesandoId, setProcesandoId] = useState<number | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState('SOLICITADA');
    const [detalleAbierto, setDetalleAbierto] = useState(false);
    const [reservaDetalleId, setReservaDetalleId] = useState<number | null>(null);

    const [decisionAbierta, setDecisionAbierta] = useState(false);
    const [tipoDecision, setTipoDecision] = useState<'APROBAR' | 'RECHAZAR'>('APROBAR');
    const [solicitudDecision, setSolicitudDecision] = useState<SolicitudReservaGestion | null>(null);

    const cargarSolicitudes = async (
        limpiarMensaje = true,
        estadoActual = estadoFiltro
    ) => {
        try {
            setCargando(true);
            setError('');

            if (limpiarMensaje) {
                setMensaje('');
            }

            const estadoParaEnviar =
                estadoActual === 'TODAS' ? undefined : estadoActual;

            const response = await listarSolicitudesGestion(estadoParaEnviar);
            setSolicitudes(response.solicitudes || []);
        } catch (err) {
            const mensajeError =
                err instanceof Error
                    ? err.message
                    : 'Error al cargar las solicitudes de reserva.';

            setError(mensajeError);
        } finally {
            setCargando(false);
        }
    };

    const abrirDialogAprobar = (solicitud: SolicitudReservaGestion) => {
        setTipoDecision('APROBAR');
        setSolicitudDecision(solicitud);
        setDecisionAbierta(true);
    };

    const abrirDialogRechazar = (solicitud: SolicitudReservaGestion) => {
        setTipoDecision('RECHAZAR');
        setSolicitudDecision(solicitud);
        setDecisionAbierta(true);
    };

    const cerrarDialogDecision = () => {
        if (procesandoId !== null) return;

        setDecisionAbierta(false);
        setSolicitudDecision(null);
    };

    const confirmarDecisionReserva = async (data: {
        motivo_rechazo?: string;
        observacion_gestor?: string;
    }) => {
        if (!solicitudDecision) return;

        try {
            setProcesandoId(solicitudDecision.reserva_id);
            setError('');
            setMensaje('');

            if (tipoDecision === 'APROBAR') {
                const response = await aprobarSolicitudReservaGestion(
                    solicitudDecision.reserva_id,
                    {
                        observacion_gestor:
                            data.observacion_gestor ||
                            'Solicitud aprobada desde el panel de gestión.'
                    }
                );

                await cargarSolicitudes(false);
                setMensaje(response.mensaje || 'Solicitud aprobada correctamente.');
            }

            if (tipoDecision === 'RECHAZAR') {
                const response = await rechazarSolicitudReservaGestion(
                    solicitudDecision.reserva_id,
                    {
                        motivo_rechazo: data.motivo_rechazo || '',
                        observacion_gestor:
                            data.observacion_gestor ||
                            'Solicitud rechazada desde el panel de gestión.'
                    }
                );

                await cargarSolicitudes(false);
                setMensaje(response.mensaje || 'Solicitud rechazada correctamente.');
            }

            setDecisionAbierta(false);
            setSolicitudDecision(null);

        } catch (err) {
            const mensajeError =
                err instanceof Error
                    ? err.message
                    : 'Error al procesar la solicitud de reserva.';

            setError(mensajeError);
        } finally {
            setProcesandoId(null);
        }
    };

    useEffect(() => {
        cargarSolicitudes();
    }, [estadoFiltro]);

    const formatearFecha = (fecha?: string | null) => {
        if (!fecha) return 'No especificada';

        const fechaSolo = fecha.slice(0, 10);
        const [anio, mes, dia] = fechaSolo.split('-');

        if (!anio || !mes || !dia) {
            return 'No especificada';
        }

        return `${dia}/${mes}/${anio}`;
    };

    const obtenerUrlFoto = (foto?: string | null) => {
        if (!foto) return '/images/local-jesus-maria.jpg';

        if (foto.startsWith('http')) {
            return foto;
        }

        return foto;
    };

    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <div>
                        <p className="gestion-section-label">
                            Gestión de solicitudes
                        </p>

                        <h1>Solicitudes de reserva</h1>

                        <p>
                            Revisa las solicitudes enviadas por los prospectos a los inmuebles que publicaste.
                            Puedes aprobarlas o rechazarlas según la evaluación correspondiente.
                        </p>
                    </div>
            
                    <button
                        type="button"
                        className="gestion-refresh-btn"
                        onClick={() => cargarSolicitudes()}
                        disabled={cargando}
                    >
                        {cargando ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </section>

                <section className="gestion-filter-card">
                    <div>
                        <label htmlFor="estadoFiltro">Filtrar por estado</label>
                        <select
                            id="estadoFiltro"
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                            disabled={cargando}
                        >
                            <option value="SOLICITADA">Pendientes</option>
                            <option value="APROBADA">Aprobadas</option>
                            <option value="RECHAZADA">Rechazadas</option>
                            <option value="CANCELADA">Canceladas</option>
                            <option value="TODAS">Todas</option>
                        </select>
                    </div>

                    <p>
                        Mostrando solicitudes:{' '}
                        <strong>
                            {estadoFiltro === 'TODAS' ? 'Todas' : estadoFiltro}
                        </strong>
                    </p>
                </section>

                {error && (
                    <div className="gestion-alert gestion-alert-error">
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className="gestion-alert gestion-alert-success">
                        {mensaje}
                    </div>
                )}

                {cargando && (
                    <div className="gestion-card gestion-empty-card">
                        Cargando solicitudes pendientes...
                    </div>
                )}

                {!cargando && solicitudes.length === 0 && !error && (
                    <div className="gestion-card gestion-empty-card">
                        <h2>No hay solicitudes pendientes</h2>
                        <p>
                            Cuando un inquilino solicite reservar uno de tus inmuebles publicados,
                            aparecerá en esta sección.
                        </p>
                    </div>
                )}

                {!cargando && solicitudes.length > 0 && (
                    <section className="gestion-solicitudes-list">
                        {solicitudes.map((solicitud) => (
                            <article
                                key={solicitud.reserva_id}
                                className="gestion-solicitud-card"
                            >
                                <div className="gestion-solicitud-img">
                                    <img
                                        src={obtenerUrlFoto(solicitud.foto_principal)}
                                        alt={solicitud.titulo_publicacion || 'Inmueble solicitado'}
                                    />
                                </div>

                                <div className="gestion-solicitud-content">
                                    <div className="gestion-solicitud-top">
                                        <div>
                                            <span className={`gestion-solicitud-status estado-${solicitud.estado_reserva.toLowerCase()}`}>
                                                {solicitud.estado_reserva === 'SOLICITADA'
                                                    ? 'Pendiente'
                                                    : solicitud.estado_reserva === 'APROBADA'
                                                        ? 'Aprobada'
                                                        : solicitud.estado_reserva === 'RECHAZADA'
                                                            ? 'Rechazada'
                                                            : solicitud.estado_reserva}
                                            </span>

                                            <h2>
                                                {solicitud.titulo_publicacion ||
                                                    solicitud.nombre_inmueble}
                                            </h2>

                                            <p>
                                                {solicitud.distrito}, {solicitud.ciudad},{' '}
                                                {solicitud.departamento}
                                            </p>
                                        </div>

                                        <div className="gestion-solicitud-price">
                                            <strong>
                                                {solicitud.moneda}{' '}
                                                {solicitud.renta_pactada_mensual}
                                            </strong>
                                            <span>/ mes</span>
                                        </div>
                                    </div>

                                    <div className="gestion-solicitud-grid">
                                        <p>
                                            <strong>Inmueble:</strong>{' '}
                                            {solicitud.nombre_inmueble}
                                        </p>

                                        <p>
                                            <strong>Tipo:</strong>{' '}
                                            {solicitud.tipo_inmueble}
                                        </p>

                                        <p>
                                            <strong>Inicio:</strong>{' '}
                                            {formatearFecha(solicitud.fecha_inicio)}
                                        </p>

                                        <p>
                                            <strong>Fin:</strong>{' '}
                                            {formatearFecha(solicitud.fecha_fin)}
                                        </p>
                                    </div>

                                    <div className="gestion-prospecto-box">
                                        <h3>Datos del prospecto</h3>

                                        <div className="gestion-solicitud-grid">
                                            <p>
                                                <strong>Nombre:</strong>{' '}
                                                {solicitud.nombres_inquilino || 'No registrado'}{' '}
                                                {solicitud.apellidos_inquilino || ''}
                                            </p>

                                            <p>
                                                <strong>Correo:</strong>{' '}
                                                {solicitud.correo_inquilino}
                                            </p>

                                            <p>
                                                <strong>Teléfono:</strong>{' '}
                                                {solicitud.telefono_inquilino ||
                                                    'No registrado'}
                                            </p>

                                            <p>
                                                <strong>Documento:</strong>{' '}
                                                {solicitud.tipo_documento || 'No registrado'}{' '}
                                                {solicitud.numero_documento || ''}
                                            </p>

                                            <p>
                                                <strong>Ingreso referencial:</strong>{' '}
                                                {solicitud.ingreso_mensual_referencial
                                                    ? `PEN ${solicitud.ingreso_mensual_referencial}`
                                                    : 'No registrado'}
                                            </p>

                                            <p>
                                                <strong>Garantías:</strong>{' '}
                                                {solicitud.tiene_aval_bancario ||
                                                solicitud.tiene_contrato_trabajo ||
                                                solicitud.tiene_garante
                                                    ? 'Cuenta con información de respaldo'
                                                    : 'Sin información de respaldo'}
                                            </p>
                                        </div>
                                    </div>

                                    {solicitud.observacion_inquilino && (
                                        <div className="gestion-solicitud-note">
                                            <strong>Observación del inquilino:</strong>
                                            <p>{solicitud.observacion_inquilino}</p>
                                        </div>
                                    )}

                                    {solicitud.estado_reserva === 'APROBADA' && solicitud.observacion_gestor && (
                                        <div className="gestion-solicitud-note gestion-solicitud-note-success">
                                            <strong>Observación del gestor:</strong>
                                            <p>{solicitud.observacion_gestor}</p>
                                        </div>
                                    )}

                                    {solicitud.estado_reserva === 'RECHAZADA' && (
                                        <div className="gestion-solicitud-note gestion-solicitud-note-error">
                                            <strong>Motivo del rechazo:</strong>
                                            <p>
                                                {solicitud.motivo_rechazo ||
                                                    'No se registró un motivo específico.'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="gestion-solicitud-actions">
                                        <button
                                            type="button"
                                            className="gestion-btn-secondary"
                                            onClick={() => {
                                                setReservaDetalleId(solicitud.reserva_id);
                                                setDetalleAbierto(true);
                                            }}
                                        >
                                            Ver historial
                                        </button>

                                        {solicitud.estado_reserva === 'SOLICITADA' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="gestion-btn-secondary"
                                                    onClick={() => abrirDialogRechazar(solicitud)}
                                                    disabled={procesandoId === solicitud.reserva_id}
                                                >
                                                    {procesandoId === solicitud.reserva_id
                                                        ? 'Rechazando...'
                                                        : 'Rechazar'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="gestion-btn-primary"
                                                    onClick={() => abrirDialogAprobar(solicitud)}
                                                    disabled={procesandoId === solicitud.reserva_id}
                                                >
                                                    {procesandoId === solicitud.reserva_id
                                                        ? 'Aprobando...'
                                                        : 'Aprobar'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
            <DetalleGestionReservaDialog
                abierto={detalleAbierto}
                reservaId={reservaDetalleId}
                onCerrar={() => {
                    setDetalleAbierto(false);
                    setReservaDetalleId(null);
                }}
            />
           <ConfirmDecisionReservaDialog
                abierto={decisionAbierta}
                tipo={tipoDecision}
                solicitud={solicitudDecision}
                cargando={procesandoId !== null}
                onCerrar={cerrarDialogDecision}
                onConfirmar={confirmarDecisionReserva}
            /> 

        </div>
    );
}

export default GestionSolicitudesReserva;