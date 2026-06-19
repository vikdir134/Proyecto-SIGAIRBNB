import { useEffect, useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import {
    listarMisSolicitudes,
    type SolicitudReserva
} from '../services/reservaService';
import DetalleSolicitudReservaDialog from '../components/DetalleSolicitudReservaDialog';
import CancelarReservaDialog from '../components/CancelarReservaDialog';
import API_URL from '../services/api';

function MisSolicitudesReserva() {
    const [solicitudes, setSolicitudes] = useState<SolicitudReserva[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [detalleAbierto, setDetalleAbierto] = useState(false);
    const [reservaSeleccionadaId, setReservaSeleccionadaId] = useState<number | null>(null);
   const [reservaSeleccionadaCancelar, setReservaSeleccionadaCancelar] = useState<any>(null);
    const [cancelandoReserva, setCancelandoReserva] = useState(false);
    const [mensajeCancelacion, setMensajeCancelacion] = useState('');
    const [errorCancelacion, setErrorCancelacion] = useState('');

    const puedeCancelarReserva = (estado: string) => {
    return ['SOLICITADA', 'APROBADA'].includes(estado);
};

const abrirDialogCancelarReserva = (reserva: any) => {
    setReservaSeleccionadaCancelar(reserva);
    setMensajeCancelacion('');
    setErrorCancelacion('');
};

const cerrarDialogCancelarReserva = () => {
    if (cancelandoReserva) return;

    setReservaSeleccionadaCancelar(null);
};

const confirmarCancelacionReserva = async (motivo: string) => {
    if (!reservaSeleccionadaCancelar) return;

    const token = localStorage.getItem('token');

    if (!token) {
        setErrorCancelacion('Tu sesión ha expirado. Inicia sesión nuevamente.');
        return;
    }

    try {
        setCancelandoReserva(true);
        setMensajeCancelacion('');
        setErrorCancelacion('');

        const response = await fetch(
            `${API_URL}/reservas/${reservaSeleccionadaCancelar.reserva_id}/cancelar`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    motivo: motivo || 'Cancelación realizada por el inquilino'
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setErrorCancelacion(data.mensaje || 'No se pudo cancelar la reserva');
            return;
        }

        setMensajeCancelacion('Reserva cancelada correctamente. El anfitrión fue notificado.');

        setSolicitudes((prev: any[]) =>
    prev.map((reserva) =>
        reserva.reserva_id === reservaSeleccionadaCancelar.reserva_id
            ? {
                ...reserva,
                estado_reserva: 'CANCELADA'
            }
            : reserva
    )
);

        setReservaSeleccionadaCancelar(null);
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        setErrorCancelacion('Error al conectar con el servidor');
    } finally {
        setCancelandoReserva(false);
    }
};

    const cargarSolicitudes = async () => {
        try {
            setCargando(true);
            setError('');

            const response = await listarMisSolicitudes();
            setSolicitudes(response.solicitudes || []);
        } catch (err) {
            const mensajeError =
                err instanceof Error
                    ? err.message
                    : 'Error al cargar tus solicitudes de reserva.';

            setError(mensajeError);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const formatearFecha = (fecha?: string | null) => {
        if (!fecha) return 'No especificada';

        const fechaSolo = fecha.slice(0, 10);
        const [anio, mes, dia] = fechaSolo.split('-');

        if (!anio || !mes || !dia) {
            return 'No especificada';
        }

        return `${dia}/${mes}/${anio}`;
    };

    const obtenerClaseEstado = (estado: string) => {
        switch (estado) {
            case 'SOLICITADA':
                return 'estado-solicitada';
            case 'APROBADA':
                return 'estado-aprobada';
            case 'RECHAZADA':
                return 'estado-rechazada';
            case 'CANCELADA':
                return 'estado-cancelada';
            default:
                return 'estado-default';
        }
    };

    const obtenerTextoEstado = (estado: string) => {
        switch (estado) {
            case 'SOLICITADA':
                return 'Pendiente de revisión';
            case 'APROBADA':
                return 'Aprobada';
            case 'RECHAZADA':
                return 'Rechazada';
            case 'CANCELADA':
                return 'Cancelada';
            default:
                return estado;
        }
    };

    const obtenerUrlFoto = (foto?: string | null) => {
        if (!foto) return '/images/local-jesus-maria.jpg';

        if (foto.startsWith('http')) {
            return foto;
        }

        return foto;
    };

    return (
        <>
            <PublicHeader />

            <main className="mis-solicitudes-page">
                <section className="mis-solicitudes-header">
                    <div>
                        <p className="mis-solicitudes-subtitle">
                            Reservas
                        </p>
                        <h1>Mis solicitudes de reserva</h1>
                        <p>
                            Revisa el estado de las solicitudes que enviaste para ocupar un inmueble.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="mis-solicitudes-refresh"
                        onClick={cargarSolicitudes}
                        disabled={cargando}
                    >
                        {cargando ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </section>

                {error && (
                    <div className="reserva-alert reserva-alert-error">
                        {error}
                    </div>
                )}

                {mensajeCancelacion && (
                    <div className="reserva-alert reserva-alert-success">
                        {mensajeCancelacion}
                    </div>
                )}

                {errorCancelacion && (
                    <div className="reserva-alert reserva-alert-error">
                        {errorCancelacion}
                    </div>
                )}

                {cargando && (
                    <div className="mis-solicitudes-empty">
                        Cargando tus solicitudes...
                    </div>
                )}

                {!cargando && solicitudes.length === 0 && !error && (
                    <div className="mis-solicitudes-empty">
                        <h2>Aún no tienes solicitudes</h2>
                        <p>
                            Cuando solicites una reserva, aparecerá en esta sección.
                        </p>
                    </div>
                )}

                {!cargando && solicitudes.length > 0 && (
                    <section className="mis-solicitudes-grid">
                        {solicitudes.map((solicitud) => (
                            <article
                                key={solicitud.reserva_id}
                                className="solicitud-card"
                            >
                                <div className="solicitud-card-img">
                                    <img
                                        src={obtenerUrlFoto(solicitud.foto_principal)}
                                        alt={solicitud.titulo_publicacion || 'Inmueble solicitado'}
                                    />
                                </div>

                                <div className="solicitud-card-body">
                                    <div className="solicitud-card-top">
                                        <div>
                                            <h2>
                                                {solicitud.titulo_publicacion || solicitud.nombre_inmueble}
                                            </h2>
                                            <p>
                                                {solicitud.distrito}, {solicitud.ciudad}, {solicitud.departamento}
                                            </p>
                                        </div>

                                        <span className={`solicitud-estado ${obtenerClaseEstado(solicitud.estado_reserva)}`}>
                                            {obtenerTextoEstado(solicitud.estado_reserva)}
                                        </span>
                                    </div>

                                    <div className="solicitud-card-info">
                                        <p>
                                            <strong>Tipo:</strong> {solicitud.tipo_inmueble}
                                        </p>

                                        <p>
                                            <strong>Fecha de inicio:</strong> {formatearFecha(solicitud.fecha_inicio)}
                                        </p>

                                        <p>
                                            <strong>Fecha de fin:</strong> {formatearFecha(solicitud.fecha_fin)}
                                        </p>

                                        <p>
                                            <strong>Renta mensual:</strong>{' '}
                                            {solicitud.moneda} {solicitud.renta_pactada_mensual}
                                        </p>
                                    </div>

                                    {solicitud.observacion_inquilino && (
                                        <div className="solicitud-card-note">
                                            <strong>Tu observación:</strong>
                                            <p>{solicitud.observacion_inquilino}</p>
                                        </div>
                                    )}

                                    {solicitud.estado_reserva === 'APROBADA' && solicitud.observacion_gestor && (
                                        <div className="solicitud-card-note solicitud-card-note-success">
                                            <strong>Respuesta del gestor:</strong>
                                            <p>{solicitud.observacion_gestor}</p>
                                        </div>
                                    )}

                                    {solicitud.estado_reserva === 'RECHAZADA' && (
                                        <div className="solicitud-card-note solicitud-card-note-error">
                                            <strong>Motivo del rechazo:</strong>
                                            <p>{solicitud.motivo_rechazo || 'No se registró un motivo específico.'}</p>
                                        </div>
                                    )}

                                    <div className="solicitud-card-actions">
                                        <button
                                            type="button"
                                            className="solicitud-detalle-btn"
                                            onClick={() => {
                                                setReservaSeleccionadaId(solicitud.reserva_id);
                                                setDetalleAbierto(true);
                                            }}
                                        >
                                            Ver detalle
                                        </button>

                                        {puedeCancelarReserva(solicitud.estado_reserva) && (
                                            <button
                                                type="button"
                                                className="btn-cancelar-reserva"
                                                onClick={() => abrirDialogCancelarReserva(solicitud)}
                                            >
                                                Cancelar reserva
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </article>
                        ))}
                    </section>
                )}
            </main>

            <DetalleSolicitudReservaDialog
                abierto={detalleAbierto}
                reservaId={reservaSeleccionadaId}
                onCerrar={() => {
                    setDetalleAbierto(false);
                    setReservaSeleccionadaId(null);
                }}
            />

            <CancelarReservaDialog
                abierto={!!reservaSeleccionadaCancelar}
                cargando={cancelandoReserva}
                titulo="Cancelar reserva"
                descripcion="Al cancelar esta reserva, el anfitrión recibirá una notificación en su campanita."
                onConfirmar={confirmarCancelacionReserva}
                onCerrar={cerrarDialogCancelarReserva}
            />
        </>
    );
}

export default MisSolicitudesReserva;