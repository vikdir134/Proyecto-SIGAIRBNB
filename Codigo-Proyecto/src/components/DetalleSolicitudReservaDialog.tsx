import { useCallback, useEffect, useState } from 'react';
import {
    obtenerDetalleMiSolicitud,
    type SolicitudReserva,
    type EventoReserva,
    type SolicitudExtension
} from '../services/reservaService';
import SolicitudExtensionDialog from './SolicitudExtensionDialog';


interface DetalleSolicitudReservaDialogProps {
    abierto: boolean;
    reservaId: number | null;
    onCerrar: () => void;
}

function DetalleSolicitudReservaDialog({
    abierto,
    reservaId,
    onCerrar
}: DetalleSolicitudReservaDialogProps) {
    const [solicitud, setSolicitud] = useState<SolicitudReserva | null>(null);
    const [eventos, setEventos] = useState<EventoReserva[]>([]);
    const [extensionPendiente, setExtensionPendiente] =
    useState<SolicitudExtension | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [mostrarSolicitudExtension, setMostrarSolicitudExtension] = useState(false);

    const formatearFecha = (fecha?: string | null) => {
        if (!fecha) return 'No especificada';

        const fechaSolo = fecha.slice(0, 10);
        const [anio, mes, dia] = fechaSolo.split('-');

        if (!anio || !mes || !dia) return 'No especificada';

        return `${dia}/${mes}/${anio}`;
    };

    const formatearFechaHora = (fecha?: string | null) => {
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

    const obtenerTextoEstado = (estado?: string) => {
        switch (estado) {
            case 'SOLICITADA':
                return 'Pendiente de revisión';
            case 'APROBADA':
                return 'Aprobada';
            case 'ACTIVA':
                return 'Estadía activa';
            case 'FINALIZADA':
                return 'Finalizada';
            case 'RECHAZADA':
                return 'Rechazada';
            case 'CANCELADA':
                return 'Cancelada';
            case 'EXPIRADA':
                return 'Expirada';
            default:
                return estado || 'No especificado';
            }
        };

    const obtenerTextoEvento = (tipo: string) => {
        switch (tipo) {
            case 'SOLICITUD':
                return 'Solicitud enviada';
            case 'APROBACION':
                return 'Solicitud aprobada';
            case 'RECHAZO':
                return 'Solicitud rechazada';
            case 'CHECKIN':
                return 'Check-in confirmado';
            case 'CHECKOUT':
                return 'Check-out confirmado';
            case 'EXTENSION':
                return 'Extensión solicitada';
            case 'CANCELACION':
                return 'Solicitud cancelada';
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
                await obtenerDetalleMiSolicitud(reservaId);

            setSolicitud(response.solicitud);
            setEventos(response.eventos || []);
            setExtensionPendiente(
                response.solicitud_extension_pendiente || null
            );
        } catch (err) {
            const mensajeError =
                err instanceof Error
                    ? err.message
                    : 'Error al cargar el detalle de la solicitud.';

            setError(mensajeError);
        } finally {
            setCargando(false);
        }
    }, [abierto, reservaId]);

    useEffect(() => {
        void cargarDetalle();
    }, [cargarDetalle]);

    const cerrar = () => {
        setSolicitud(null);
        setEventos([]);
        setExtensionPendiente(null);
        setMostrarSolicitudExtension(false)
        setError('');
        onCerrar();
    };

    if (!abierto) {
        return null;
    }

    const puedeSolicitarExtension =
    solicitud !== null &&
    ['APROBADA', 'ACTIVA'].includes(
        solicitud.estado_reserva
    ) &&
    !extensionPendiente;

    return (
        <div className="detalle-solicitud-overlay">
            <div className="detalle-solicitud-dialog">
                <div className="detalle-solicitud-header">
                    <div>
                        <p className="detalle-solicitud-subtitle">
                            Detalle de solicitud
                        </p>
                        <h2>
                            {solicitud?.titulo_publicacion || 'Solicitud de reserva'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="detalle-solicitud-close"
                        onClick={cerrar}
                    >
                        ×
                    </button>
                </div>

                {cargando && (
                    <div className="mis-solicitudes-empty">
                        Cargando detalle...
                    </div>
                )}

                {error && (
                    <div className="reserva-alert reserva-alert-error">
                        {error}
                    </div>
                )}

                {!cargando && solicitud && (
                    <>
                        <div className="detalle-solicitud-status-row">
                            <span className={`solicitud-estado estado-${solicitud.estado_reserva.toLowerCase()}`}>
                                {obtenerTextoEstado(solicitud.estado_reserva)}
                            </span>

                            <span className="detalle-solicitud-code">
                                Reserva #{solicitud.reserva_id}
                            </span>
                        </div>

                        <section className="detalle-solicitud-card">
                            <h3>Información del inmueble</h3>

                            <div className="detalle-solicitud-grid">
                                <p>
                                    <strong>Inmueble:</strong>{' '}
                                    {solicitud.nombre_inmueble}
                                </p>

                                <p>
                                    <strong>Tipo:</strong>{' '}
                                    {solicitud.tipo_inmueble}
                                </p>

                                <p>
                                    <strong>Ubicación:</strong>{' '}
                                    {solicitud.distrito}, {solicitud.ciudad}
                                </p>

                                <p>
                                    <strong>Renta mensual:</strong>{' '}
                                    {solicitud.moneda} {solicitud.renta_pactada_mensual}
                                </p>
                            </div>
                        </section>

                        <section className="detalle-solicitud-card">
                            <h3>Fechas solicitadas</h3>

                            <div className="detalle-solicitud-grid">
                                <p>
                                    <strong>Inicio:</strong>{' '}
                                    {formatearFecha(solicitud.fecha_inicio)}
                                </p>

                                <p>
                                    <strong>Fin:</strong>{' '}
                                    {formatearFecha(solicitud.fecha_fin)}
                                </p>

                                <p>
                                    <strong>Fecha de solicitud:</strong>{' '}
                                    {formatearFechaHora(solicitud.fecha_solicitud)}
                                </p>

                                <p>
                                    <strong>Fecha de decisión:</strong>{' '}
                                    {formatearFechaHora(solicitud.fecha_decision)}
                                </p>
                            </div>
                        </section>

                        {solicitud.observacion_inquilino && (
                            <section className="detalle-solicitud-card">
                                <h3>Tu observación</h3>
                                <p>{solicitud.observacion_inquilino}</p>
                            </section>
                        )}

                        {solicitud.observacion_gestor && (
                            <section className="detalle-solicitud-card">
                                <h3>Respuesta del gestor</h3>
                                <p>{solicitud.observacion_gestor}</p>
                            </section>
                        )}

                        {solicitud.estado_reserva === 'RECHAZADA' && (
                            <section className="detalle-solicitud-card detalle-solicitud-error">
                                <h3>Motivo del rechazo</h3>
                                <p>
                                    {solicitud.motivo_rechazo ||
                                        'No se registró un motivo específico.'}
                                </p>
                            </section>
                        )}

                        {/* HU13 - Acciones de extensión */}
                        {puedeSolicitarExtension && (
                            <div className="extension-dialog-actions">
                                <button
                                    type="button"
                                    className="extension-button-primary"
                                    onClick={() =>
                                        setMostrarSolicitudExtension(true)
                                    }
                                >
                                    Solicitar extensión
                                </button>
                            </div>
                        )}

                        {/* HU13 - Aviso de solicitud pendiente */}
                        {extensionPendiente && (
                            <div className="extension-alert extension-alert-warning">
                                Tienes una solicitud de extensión pendiente hasta el{' '}
                                <strong>
                                    {formatearFecha(
                                        extensionPendiente.nueva_fecha_fin
                                    )}
                                </strong>
                                .
                            </div>
                        )}

                        <section className="detalle-solicitud-card">
                            <h3>Historial</h3>

                            {eventos.length === 0 ? (
                                <p>No hay eventos registrados.</p>
                            ) : (
                                <div className="detalle-solicitud-timeline">
                                    {eventos.map((evento) => (
                                        <div
                                            key={evento.reserva_evento_id}
                                            className="detalle-solicitud-evento"
                                        >
                                            <div className="detalle-solicitud-dot" />

                                            <div>
                                                <strong>
                                                    {obtenerTextoEvento(evento.tipo_evento)}
                                                </strong>

                                                <p>
                                                    {evento.descripcion ||
                                                        'Evento registrado en la solicitud.'}
                                                </p>

                                                <small>
                                                    {formatearFechaHora(evento.fecha_evento)}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>     
                )}
                <SolicitudExtensionDialog
                    abierto={mostrarSolicitudExtension}
                    solicitud={solicitud}
                    extensionPendiente={extensionPendiente}
                    onCerrar={() =>
                        setMostrarSolicitudExtension(false)
                    }
                    onRegistrada={async () => {
                        await cargarDetalle();
                    }}
                />
            </div>
        </div>
    );
}
export default DetalleSolicitudReservaDialog;