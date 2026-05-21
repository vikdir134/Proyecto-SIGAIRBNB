import { useEffect, useState } from 'react';
import {
    obtenerEventosReservaGestion,
    type EventoReserva
} from '../services/reservaService';

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
    const [eventos, setEventos] = useState<EventoReserva[]>([]);
    const [reserva, setReserva] = useState<any>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

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

    const textoEvento = (tipo: string) => {
        switch (tipo) {
            case 'SOLICITUD':
                return 'Solicitud enviada';
            case 'APROBACION':
                return 'Solicitud aprobada';
            case 'RECHAZO':
                return 'Solicitud rechazada';
            default:
                return tipo;
        }
    };

    useEffect(() => {
        const cargarEventos = async () => {
            if (!abierto || !reservaId) return;

            try {
                setCargando(true);
                setError('');

                const response = await obtenerEventosReservaGestion(reservaId);

                setReserva(response.reserva);
                setEventos(response.eventos || []);
            } catch (err) {
                const mensajeError =
                    err instanceof Error
                        ? err.message
                        : 'Error al cargar el historial de la reserva.';

                setError(mensajeError);
            } finally {
                setCargando(false);
            }
        };

        cargarEventos();
    }, [abierto, reservaId]);

    const cerrar = () => {
        setReserva(null);
        setEventos([]);
        setError('');
        onCerrar();
    };

    if (!abierto) return null;

    return (
        <div className="detalle-solicitud-overlay">
            <div className="detalle-solicitud-dialog">
                <div className="detalle-solicitud-header">
                    <div>
                        <p className="detalle-solicitud-subtitle">
                            Historial de gestión
                        </p>
                        <h2>
                            Reserva #{reserva?.reserva_id || reservaId}
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
                    <div className="gestion-card gestion-empty-card">
                        Cargando historial...
                    </div>
                )}

                {error && (
                    <div className="gestion-alert gestion-alert-error">
                        {error}
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
                        </div>
                    </section>
                )}

                {!cargando && (
                    <section className="detalle-solicitud-card">
                        <h3>Eventos registrados</h3>

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
                                                {textoEvento(evento.tipo_evento)}
                                            </strong>

                                            <p>
                                                {evento.descripcion ||
                                                    'Evento registrado.'}
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
                )}
            </div>
        </div>
    );
}

export default DetalleGestionReservaDialog;