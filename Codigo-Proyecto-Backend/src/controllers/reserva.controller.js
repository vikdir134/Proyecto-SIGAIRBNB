const {
  obtenerPublicacionReservablePorId,
  buscarConflictosReserva,
  crearSolicitudReserva,
  listarSolicitudesPorInquilino,
  listarSolicitudesGestionEmpresa,
  obtenerSolicitudGestionPorId,
  buscarConflictosAprobacionReserva,
  aprobarSolicitudReservaPorId,
  rechazarSolicitudReservaPorId,
  listarEventosReservaGestion,
  obtenerSolicitudInquilinoPorId,
  listarEventosReservaInquilino
} = require('../models/reserva.model');

const limpiarTexto = (valor) => {
  if (valor === undefined || valor === null) return '';
  return String(valor).trim();
};

const validarFechaYYYYMMDD = (fecha) => {
  if (!fecha) return false;

  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoFecha.test(fecha)) {
    return false;
  }

  const fechaDate = new Date(`${fecha}T00:00:00`);

  return !Number.isNaN(fechaDate.getTime());
};

const solicitarReserva = async (req, res) => {
  try {
    const inquilinoId = req.usuario.usuario_id;

    const {
      publicacion_id,
      fecha_inicio,
      fecha_fin,
      observacion_inquilino
    } = req.body;

    const publicacionIdNumero = Number(publicacion_id);

    if (Number.isNaN(publicacionIdNumero) || publicacionIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'Debe seleccionar una publicación válida'
      });
    }

    if (!validarFechaYYYYMMDD(fecha_inicio) || !validarFechaYYYYMMDD(fecha_fin)) {
      return res.status(400).json({
        mensaje: 'Las fechas deben tener formato YYYY-MM-DD'
      });
    }

    if (fecha_fin <= fecha_inicio) {
      return res.status(400).json({
        mensaje: 'La fecha de fin debe ser mayor que la fecha de inicio'
      });
    }

    const observacionLimpia = limpiarTexto(observacion_inquilino);

    if (observacionLimpia.length > 500) {
      return res.status(400).json({
        mensaje: 'La observación no puede superar los 500 caracteres'
      });
    }

    const publicacion = await obtenerPublicacionReservablePorId(publicacionIdNumero);

    if (!publicacion) {
      return res.status(404).json({
        mensaje: 'La publicación no existe, no está disponible o no acepta reservas'
      });
    }

    if (
      publicacion.disponible_desde &&
      fecha_inicio < publicacion.disponible_desde.toISOString().slice(0, 10)
    ) {
      return res.status(400).json({
        mensaje: 'El inmueble aún no está disponible desde la fecha seleccionada',
        disponible_desde: publicacion.disponible_desde
      });
    }

    const conflictos = await buscarConflictosReserva({
      empresa_id: publicacion.empresa_id,
      inmueble_id: publicacion.inmueble_id,
      fecha_inicio,
      fecha_fin
    });

    if (conflictos.bloqueos.length > 0 || conflictos.reservas.length > 0) {
      return res.status(409).json({
        mensaje: 'No se puede solicitar la reserva porque el inmueble no está disponible en ese rango de fechas',
        bloqueos_solapados: conflictos.bloqueos,
        reservas_solapadas: conflictos.reservas
      });
    }

    const reservaCreada = await crearSolicitudReserva({
      inmueble_id: publicacion.inmueble_id,
      inquilino_id: inquilinoId,
      fecha_inicio,
      fecha_fin,
      renta_pactada_mensual: publicacion.precio_publicado_mensual,
      moneda: publicacion.moneda,
      observacion_inquilino: observacionLimpia || null
    });

    return res.status(201).json({
      mensaje: 'Solicitud de reserva enviada correctamente',
      publicacion: {
        publicacion_id: publicacion.publicacion_id,
        inmueble_id: publicacion.inmueble_id,
        titulo: publicacion.titulo,
        codigo_inmueble: publicacion.codigo_inmueble,
        nombre_inmueble: publicacion.nombre_inmueble,
        tipo_inmueble: publicacion.tipo_inmueble
      },
      reserva: reservaCreada
    });

  } catch (error) {
    console.error('Error al solicitar reserva:', error);

    return res.status(500).json({
      mensaje: 'Error interno al solicitar reserva',
      error: error.message
    });
  }
};

const obtenerMisSolicitudesReserva = async (req, res) => {
  try {
    const inquilinoId = req.usuario.usuario_id;

    const solicitudes = await listarSolicitudesPorInquilino(inquilinoId);

    return res.json({
      mensaje: 'Solicitudes de reserva obtenidas correctamente',
      total: solicitudes.length,
      solicitudes
    });

  } catch (error) {
    console.error('Error al obtener mis solicitudes de reserva:', error);

    return res.status(500).json({
      mensaje: 'Error interno al obtener mis solicitudes de reserva',
      error: error.message
    });
  }
};

const obtenerSolicitudesGestion = async (req, res) => {
  try {
    const usuarioPublicadorId = req.usuario.usuario_id;

    const { estado_reserva } = req.query;

    let estadoNormalizado = limpiarTexto(estado_reserva).toUpperCase();

    const estadosPermitidos = [
      'SOLICITADA',
      'APROBADA',
      'RECHAZADA',
      'CANCELADA',
      'ACTIVA',
      'FINALIZADA',
      'EXPIRADA'
    ];

    if (estadoNormalizado && !estadosPermitidos.includes(estadoNormalizado)) {
      return res.status(400).json({
        mensaje: 'El estado de reserva no es válido',
        estados_permitidos: estadosPermitidos
      });
    }

    const solicitudes = await listarSolicitudesGestionEmpresa(usuarioPublicadorId, {
      estado_reserva: estadoNormalizado || null
    });

    return res.json({
      mensaje: 'Solicitudes de reserva para gestión obtenidas correctamente',
      total: solicitudes.length,
      solicitudes
    });

  } catch (error) {
    console.error('Error al obtener solicitudes de reserva para gestión:', error);

    return res.status(500).json({
      mensaje: 'Error interno al obtener solicitudes de reserva para gestión',
      error: error.message
    });
  }
};

const aprobarSolicitudReserva = async (req, res) => {
  try {
    const usuarioPublicadorId = req.usuario.usuario_id;
    const gestorId = req.usuario.usuario_id;

    const { reserva_id } = req.params;
    const { observacion_gestor } = req.body;

    const reservaIdNumero = Number(reserva_id);

    if (Number.isNaN(reservaIdNumero) || reservaIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El ID de la reserva no es válido'
      });
    }

    const observacionLimpia = limpiarTexto(observacion_gestor);

    if (observacionLimpia.length > 500) {
      return res.status(400).json({
        mensaje: 'La observación del gestor no puede superar los 500 caracteres'
      });
    }

    const solicitud = await obtenerSolicitudGestionPorId(
      usuarioPublicadorId,
      reservaIdNumero
    );

    if (!solicitud) {
      return res.status(404).json({
        mensaje: 'La solicitud de reserva no existe o no pertenece a tus publicaciones'
      });
    }

    if (solicitud.inquilino_id === gestorId) {
        return res.status(403).json({
        mensaje: 'No puedes aprobar tu propia solicitud de reserva'
        });
    }

    if (solicitud.estado_reserva !== 'SOLICITADA') {
      return res.status(400).json({
        mensaje: 'Solo se pueden aprobar solicitudes en estado SOLICITADA',
        estado_actual: solicitud.estado_reserva
      });
    }

    const conflictos = await buscarConflictosAprobacionReserva({
      empresa_id: solicitud.empresa_id,
      inmueble_id: solicitud.inmueble_id,
      reserva_id: solicitud.reserva_id,
      fecha_inicio: solicitud.fecha_inicio,
      fecha_fin: solicitud.fecha_fin
    });

    if (conflictos.length > 0) {
      return res.status(409).json({
        mensaje: 'No se puede aprobar la solicitud porque existe otra reserva aprobada o activa en el mismo rango',
        reservas_conflictivas: conflictos
      });
    }

    const reservaAprobada = await aprobarSolicitudReservaPorId({
      usuario_publicador_id: usuarioPublicadorId,
      reserva_id: reservaIdNumero,
      gestor_id: gestorId,
      observacion_gestor: observacionLimpia || null
    });

    if (!reservaAprobada) {
      return res.status(400).json({
        mensaje: 'No se pudo aprobar la solicitud. Verifica que siga en estado SOLICITADA'
      });
    }

    return res.json({
      mensaje: 'Solicitud de reserva aprobada correctamente',
      reserva: reservaAprobada
    });

  } catch (error) {
    console.error('Error al aprobar solicitud de reserva:', error);

    return res.status(500).json({
      mensaje: 'Error interno al aprobar solicitud de reserva',
      error: error.message
    });
  }
};

const rechazarSolicitudReserva = async (req, res) => {
  try {
    const usuarioPublicadorId = req.usuario.usuario_id;
    const gestorId = req.usuario.usuario_id;

    const { reserva_id } = req.params;
    const { motivo_rechazo, observacion_gestor } = req.body;

    const reservaIdNumero = Number(reserva_id);

    if (Number.isNaN(reservaIdNumero) || reservaIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El ID de la reserva no es válido'
      });
    }

    const motivoLimpio = limpiarTexto(motivo_rechazo);
    const observacionLimpia = limpiarTexto(observacion_gestor);

    if (!motivoLimpio) {
      return res.status(400).json({
        mensaje: 'Debe ingresar el motivo del rechazo'
      });
    }

    if (motivoLimpio.length > 300) {
      return res.status(400).json({
        mensaje: 'El motivo de rechazo no puede superar los 300 caracteres'
      });
    }

    if (observacionLimpia.length > 500) {
      return res.status(400).json({
        mensaje: 'La observación del gestor no puede superar los 500 caracteres'
      });
    }

    const solicitud = await obtenerSolicitudGestionPorId(
      usuarioPublicadorId,
      reservaIdNumero
    );

    if (!solicitud) {
      return res.status(404).json({
        mensaje: 'La solicitud de reserva no existe o no pertenece a tus publicaciones'
      });
    }

    if (solicitud.inquilino_id === gestorId) {
      return res.status(403).json({
        mensaje: 'No puedes rechazar tu propia solicitud de reserva'
      });
    }

    if (solicitud.estado_reserva !== 'SOLICITADA') {
      return res.status(400).json({
        mensaje: 'Solo se pueden rechazar solicitudes en estado SOLICITADA',
        estado_actual: solicitud.estado_reserva
      });
    }

    const reservaRechazada = await rechazarSolicitudReservaPorId({
      usuario_publicador_id: usuarioPublicadorId,
      reserva_id: reservaIdNumero,
      gestor_id: gestorId,
      motivo_rechazo: motivoLimpio,
      observacion_gestor: observacionLimpia || null
    });

    if (!reservaRechazada) {
      return res.status(400).json({
        mensaje: 'No se pudo rechazar la solicitud. Verifica que siga en estado SOLICITADA'
      });
    }

    return res.json({
      mensaje: 'Solicitud de reserva rechazada correctamente',
      reserva: reservaRechazada
    });

  } catch (error) {
    console.error('Error al rechazar solicitud de reserva:', error);

    return res.status(500).json({
      mensaje: 'Error interno al rechazar solicitud de reserva',
      error: error.message
    });
  }
};

const obtenerEventosReservaGestion = async (req, res) => {
  try {
    const usuarioPublicadorId = req.usuario.usuario_id;
    const { reserva_id } = req.params;

    const reservaIdNumero = Number(reserva_id);

    if (Number.isNaN(reservaIdNumero) || reservaIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El ID de la reserva no es válido'
      });
    }

    const solicitud = await obtenerSolicitudGestionPorId(
      usuarioPublicadorId,
      reservaIdNumero
    );

    if (!solicitud) {
      return res.status(404).json({
        mensaje: 'La solicitud de reserva no existe o no pertenece a tus publicaciones'
      });
    }

    const eventos = await listarEventosReservaGestion(
      usuarioPublicadorId,
      reservaIdNumero
    );

    return res.json({
      mensaje: 'Historial de eventos de la reserva obtenido correctamente',
      reserva: {
        reserva_id: solicitud.reserva_id,
        inmueble_id: solicitud.inmueble_id,
        inquilino_id: solicitud.inquilino_id,
        estado_reserva: solicitud.estado_reserva,
        fecha_inicio: solicitud.fecha_inicio,
        fecha_fin: solicitud.fecha_fin,
        codigo_inmueble: solicitud.codigo_inmueble,
        nombre_inmueble: solicitud.nombre_inmueble,
        tipo_inmueble: solicitud.tipo_inmueble
      },
      total: eventos.length,
      eventos
    });

  } catch (error) {
    console.error('Error al obtener eventos de reserva:', error);

    return res.status(500).json({
      mensaje: 'Error interno al obtener eventos de reserva',
      error: error.message
    });
  }
};

const obtenerDetalleMiSolicitudReserva = async (req, res) => {
  try {
    const inquilinoId = req.usuario.usuario_id;
    const { reserva_id } = req.params;

    const reservaIdNumero = Number(reserva_id);

    if (Number.isNaN(reservaIdNumero) || reservaIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El ID de la reserva no es válido'
      });
    }

    const solicitud = await obtenerSolicitudInquilinoPorId(
      inquilinoId,
      reservaIdNumero
    );

    if (!solicitud) {
      return res.status(404).json({
        mensaje: 'La solicitud de reserva no existe o no pertenece a tu usuario'
      });
    }

    const eventos = await listarEventosReservaInquilino(
      inquilinoId,
      reservaIdNumero
    );

    return res.json({
      mensaje: 'Detalle de solicitud de reserva obtenido correctamente',
      solicitud,
      total_eventos: eventos.length,
      eventos
    });

  } catch (error) {
    console.error('Error al obtener detalle de mi solicitud:', error);

    return res.status(500).json({
      mensaje: 'Error interno al obtener detalle de mi solicitud',
      error: error.message
    });
  }
};

module.exports = {
  solicitarReserva,
  obtenerMisSolicitudesReserva,
  obtenerSolicitudesGestion,
  aprobarSolicitudReserva,
  rechazarSolicitudReserva,
  obtenerEventosReservaGestion,
  obtenerDetalleMiSolicitudReserva
};