import {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    aprobarSolicitudExtensionGestion,
    obtenerEventosReservaGestion,
    rechazarSolicitudExtensionGestion,
    type EventoReserva,
    type SolicitudExtensionGestion
} from '../services/reservaService';

import ConfirmDialog from './ConfirmDialog';

interface DetalleGestionReservaDialogProps {
    abierto: boolean;
    reservaId: number | null;
    onCerrar: () => void;
}

function DetalleGestionReservaDialog({
    abierto,
    reservaId,
    onCerrar
}: DetalleGestionReservaDialogProps) {
    const [eventos, setEventos] =
        useState<EventoReserva[]>([]);

    const [reserva, setReserva] =
        useState<any>(null);

    const [
        extensionPendiente,
        setExtensionPendiente
    ] = useState<SolicitudExtensionGestion | null>(
        null
    );

    const [
        comentarioDecision,
        setComentarioDecision
    ] = useState('');

    const [cargando, setCargando] =
        useState(false);

    const [
        procesandoExtension,
        setProcesandoExtension
    ] = useState(false);

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [accionConfirmacion, setAccionConfirmacion] =
    useState<'aprobar' | 'rechazar' | null>(null);

    const formatearFecha = (
        fecha?: string | null
    ) => {
        if (!fecha) return 'No especificada';

        const fechaTexto = String(fecha).slice(0, 10);
        const partes = fechaTexto.split('-');

        if (partes.length !== 3) {
            return 'No especificada';
        }

        const [anio, mes, dia] = partes;

        return `${dia}/${mes}/${anio}`;
    };

    const formatearFechaHora = (
        fecha?: string | null
    ) => {
        if (!fecha) return 'No especificada';

        const fechaDate = new Date(fecha);

        if (Number.isNaN(fechaDate.getTime())) {
            return 'No especificada';
        }

        return fechaDate.toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const textoEvento = (
        tipo: string,
        descripcion?: string | null
    ) => {
        if (
            tipo === 'NOTA' &&
            descripcion
                ?.toLowerCase()
                .includes('evaluación de vetting')
        ) {
            return 'Evaluación de vetting';
        }

        switch (tipo) {
            case 'SOLICITUD':
                return 'Solicitud enviada';

            case 'APROBACION':
                return 'Solicitud aprobada';

            case 'RECHAZO':
                return 'Solicitud rechazada';

            case 'CANCELACION':
                return 'Solicitud cancelada';

            case 'CHECKIN':
                return 'Check-in';

            case 'CHECKOUT':
                return 'Check-out';

            case 'EXTENSION':
                return 'Extensión de reserva';

            case 'NOTA':
                return 'Nota de gestión';

            default:
                return tipo;
        }
    };

    const cargarDetalle = useCallback(async () => {
        if (!abierto || !reservaId) return;

        try {
            setCargando(true);
            setError('');

            const response =
                await obtenerEventosReservaGestion(
                    reservaId
                );

            setReserva(response.reserva);
            setEventos(response.eventos || []);

            setExtensionPendiente(
                response
                    .solicitud_extension_pendiente ||
                    null
            );
        } catch (err) {
            const mensajeError =
                err instanceof Error
                    ? err.message
                    : 'Error al cargar el historial de la reserva.';

            setError(mensajeError);
        } finally {
            setCargando(false);
        }
    }, [abierto, reservaId]);

    useEffect(() => {
        void cargarDetalle();
    }, [cargarDetalle]);

    const solicitarConfirmacionAprobacion = () => {
        if (!extensionPendiente) return;

        setError('');
        setMensaje('');
        setAccionConfirmacion('aprobar');
    };

    const solicitarConfirmacionRechazo = () => {
        if (!extensionPendiente) return;

        if (!comentarioDecision.trim()) {
            setError(
                'Debes ingresar el motivo del rechazo.'
            );
            return;
        }

        setError('');
        setMensaje('');
        setAccionConfirmacion('rechazar');
    };

    const aprobarExtension = async () => {
        if (!extensionPendiente) return;

    
        try {
            setProcesandoExtension(true);
            setError('');
            setMensaje('');

            const response =
                await aprobarSolicitudExtensionGestion(
                    extensionPendiente
                        .solicitud_extension_id,
                    comentarioDecision
                );

            setMensaje(response.mensaje);
            setComentarioDecision('');
            setAccionConfirmacion(null);

            await cargarDetalle();
        } catch (err) {
            const mensajeError =
                err instanceof Error
                    ? err.message
                    : 'No se pudo aprobar la extensión.';

            setError(mensajeError);
            setAccionConfirmacion(null);
        } finally {
            setProcesandoExtension(false);
        }
    };

    const rechazarExtension = async () => {
        if (!extensionPendiente) return;

        const comentarioLimpio =
            comentarioDecision.trim();

        if (!comentarioLimpio) {
            setError(
                'Debes ingresar el motivo del rechazo.'
            );
            setAccionConfirmacion(null);
            return;
        }

        try {
            setProcesandoExtension(true);
            setError('');
            setMensaje('');

            const response =
                await rechazarSolicitudExtensionGestion(
                    extensionPendiente.solicitud_extension_id,
                    comentarioLimpio
                );

            setMensaje(response.mensaje);
            setComentarioDecision('');
            setAccionConfirmacion(null);

            await cargarDetalle();
        } catch (err) {
            const mensajeError =
                err instanceof Error
                    ? err.message
                    : 'No se pudo rechazar la extensión.';

            setError(mensajeError);
            setAccionConfirmacion(null);
        } finally {
            setProcesandoExtension(false);
        }
    };

    const cerrar = () => {
        if (procesandoExtension) return;

        setReserva(null);
        setEventos([]);
        setExtensionPendiente(null);
        setComentarioDecision('');
        setAccionConfirmacion(null);
        setError('');
        setMensaje('');

        onCerrar();
    };

    if (!abierto) return null;

    return (
        <>
        <div className="detalle-solicitud-overlay">
            <div className="detalle-solicitud-dialog">
                <div className="detalle-solicitud-header">
                    <div>
                        <p className="detalle-solicitud-subtitle">
                            Historial de gestión
                        </p>

                        <h2>
                            Reserva #
                            {reserva?.reserva_id ||
                                reservaId}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="detalle-solicitud-close"
                        onClick={cerrar}
                        disabled={procesandoExtension}
                    >
                        ×
                    </button>
                </div>

                {cargando && (
                    <div className="gestion-card gestion-empty-card">
                        Cargando historial...
                    </div>
                )}

                {error && (
                    <div className="gestion-alert gestion-alert-error">
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className="extension-alert extension-alert-success">
                        {mensaje}
                    </div>
                )}

                {!cargando && reserva && (
                    <section className="detalle-solicitud-card">
                        <h3>Resumen de la reserva</h3>

                        <div className="detalle-solicitud-grid">
                            <p>
                                <strong>Inmueble:</strong>{' '}
                                {reserva.nombre_inmueble}
                            </p>

                            <p>
                                <strong>Tipo:</strong>{' '}
                                {reserva.tipo_inmueble}
                            </p>

                            <p>
                                <strong>Estado:</strong>{' '}
                                {reserva.estado_reserva}
                            </p>

                            <p>
                                <strong>Código:</strong>{' '}
                                {reserva.codigo_inmueble}
                            </p>

                            <p>
                                <strong>Fecha inicial:</strong>{' '}
                                {formatearFecha(
                                    reserva.fecha_inicio
                                )}
                            </p>

                            <p>
                                <strong>Fecha final:</strong>{' '}
                                {formatearFecha(
                                    reserva.fecha_fin
                                )}
                            </p>
                        </div>
                    </section>
                )}

                {!cargando && extensionPendiente && (
                    <section className="detalle-solicitud-card gestion-extension-card">
                        <div className="gestion-extension-header">
                            <div>
                                <p className="detalle-solicitud-subtitle">
                                    Acción pendiente
                                </p>

                                <h3>
                                    Solicitud de extensión
                                </h3>
                            </div>

                            <span className="gestion-extension-badge">
                                PENDIENTE
                            </span>
                        </div>

                        <div className="detalle-solicitud-grid">
                            <p>
                                <strong>
                                    Fecha final actual:
                                </strong>{' '}
                                {formatearFecha(
                                    extensionPendiente
                                        .fecha_fin_actual
                                )}
                            </p>

                            <p>
                                <strong>
                                    Nueva fecha solicitada:
                                </strong>{' '}
                                {formatearFecha(
                                    extensionPendiente
                                        .nueva_fecha_fin
                                )}
                            </p>

                            <p>
                                <strong>
                                    Fecha de solicitud:
                                </strong>{' '}
                                {formatearFechaHora(
                                    extensionPendiente
                                        .fecha_solicitud
                                )}
                            </p>

                            <p>
                                <strong>
                                    Solicitante:
                                </strong>{' '}
                                {extensionPendiente
                                    .nombres_inquilino ||
                                    'Inquilino'}{' '}
                                {extensionPendiente
                                    .apellidos_inquilino ||
                                    ''}
                            </p>
                        </div>

                        <div className="gestion-extension-motivo">
                            <strong>
                                Motivo de la extensión
                            </strong>

                            <p>
                                {extensionPendiente.motivo ||
                                    'El inquilino no indicó un motivo.'}
                            </p>
                        </div>

                        <div className="extension-form-group">
                            <label htmlFor="comentario_extension">
                                Comentario de decisión
                            </label>

                            <textarea
                                id="comentario_extension"
                                rows={3}
                                maxLength={500}
                                value={comentarioDecision}
                                onChange={(event) =>
                                    setComentarioDecision(
                                        event.target.value
                                    )
                                }
                                placeholder="Escribe un comentario. Es obligatorio para rechazar."
                                disabled={
                                    procesandoExtension
                                }
                            />

                            <small className="extension-character-count">
                                {comentarioDecision.length}
                                /500
                            </small>
                        </div>

                        <div className="gestion-extension-actions">
                            <button
                                type="button"
                                className="gestion-extension-reject"
                                onClick={solicitarConfirmacionRechazo}
                                disabled={procesandoExtension}
                            >
                                Rechazar extensión
                            </button>

                            <button
                                type="button"
                                className="extension-button-primary"
                                onClick={solicitarConfirmacionAprobacion}
                                disabled={procesandoExtension}
                            >
                                Aprobar extensión
                            </button>
                        </div>
                    </section>
                )}

                {!cargando && !extensionPendiente && reserva && (
                    <div className="extension-alert extension-alert-success">
                        No existen solicitudes de extensión
                        pendientes para esta reserva.
                    </div>
                )}

                {!cargando && (
                    <section className="detalle-solicitud-card">
                        <h3>Eventos registrados</h3>

                        {eventos.length === 0 ? (
                            <p>
                                No hay eventos registrados.
                            </p>
                        ) : (
                            <div className="detalle-solicitud-timeline">
                                {eventos.map((evento) => (
                                    <div
                                        key={
                                            evento.reserva_evento_id
                                        }
                                        className={`detalle-solicitud-evento evento-${evento.tipo_evento.toLowerCase()}`}
                                    >
                                        <div className="detalle-solicitud-dot" />

                                        <div>
                                            <strong>
                                                {textoEvento(
                                                    evento.tipo_evento,
                                                    evento.descripcion
                                                )}
                                            </strong>

                                            <p>
                                                {evento.descripcion ||
                                                    'Evento registrado.'}
                                            </p>

                                            <small>
                                                {formatearFechaHora(
                                                    evento.fecha_evento
                                                )}
                                            </small>

                                            {(evento.nombres_usuario ||
                                                evento.correo_usuario) && (
                                                <small>
                                                    Registrado por:{' '}
                                                    {evento.nombres_usuario ||
                                                        'Usuario'}{' '}
                                                    {evento.apellidos_usuario ||
                                                        ''}
                                                    {evento.correo_usuario
                                                        ? ` (${evento.correo_usuario})`
                                                        : ''}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>

        <ConfirmDialog
            abierto={accionConfirmacion !== null}
            titulo={
                accionConfirmacion === 'aprobar'
                    ? 'Aprobar extensión'
                    : 'Rechazar extensión'
            }
            descripcion={
                accionConfirmacion === 'aprobar'
                    ? `¿Confirmas que deseas extender la reserva hasta el ${
                        extensionPendiente
                            ? formatearFecha(
                                extensionPendiente.nueva_fecha_fin
                            )
                            : ''
                    }?`
                    : '¿Confirmas que deseas rechazar esta solicitud de extensión?'
            }
            textoConfirmar={
                accionConfirmacion === 'aprobar'
                    ? 'Aprobar extensión'
                    : 'Rechazar extensión'
            }
            textoCancelar="Cancelar"
            tipo={
                accionConfirmacion === 'aprobar'
                    ? 'success'
                    : 'danger'
            }
            cargando={procesandoExtension}
            onConfirmar={
                accionConfirmacion === 'aprobar'
                    ? aprobarExtension
                    : rechazarExtension
            }
            onCerrar={() => {
                if (!procesandoExtension) {
                    setAccionConfirmacion(null);
                }
            }}
        />
    </>
    );
}

export default DetalleGestionReservaDialog;