const {
  listarPublicaciones,
  obtenerPublicacionPorId,
  obtenerFotosPublicacion
} = require('../models/publicacion.model');

const limpiarTexto = (valor) => {
  if (valor === undefined || valor === null) return '';
  return String(valor).trim();
};

const validarFecha = (fecha) => {
  if (!fecha) return true;

  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoFecha.test(fecha)) {
    return false;
  }

  const fechaDate = new Date(`${fecha}T00:00:00`);

  return !Number.isNaN(fechaDate.getTime());
};

const listarPublicacionesPublicas = async (req, res) => {
  try {
    const {
      ubicacion,
      tipo_inmueble,
      fecha_inicio,
      fecha_fin,
      precio_min,
      precio_max,
      capacidad_personas
    } = req.query;

    const tipoNormalizado = limpiarTexto(tipo_inmueble).toUpperCase();

    if (
      tipoNormalizado &&
      !['EDIFICIO', 'PISO', 'LOCAL'].includes(tipoNormalizado)
    ) {
      return res.status(400).json({
        mensaje: 'El tipo de inmueble no es válido'
      });
    }

    if (!validarFecha(fecha_inicio) || !validarFecha(fecha_fin)) {
      return res.status(400).json({
        mensaje: 'Las fechas deben tener formato YYYY-MM-DD'
      });
    }

    if ((fecha_inicio && !fecha_fin) || (!fecha_inicio && fecha_fin)) {
      return res.status(400).json({
        mensaje: 'Para filtrar por disponibilidad debe enviar fecha_inicio y fecha_fin'
      });
    }

    if (fecha_inicio && fecha_fin && fecha_fin < fecha_inicio) {
      return res.status(400).json({
        mensaje: 'La fecha de fin no puede ser menor que la fecha de inicio'
      });
    }

    if (
      precio_min !== undefined &&
      precio_min !== '' &&
      (Number.isNaN(Number(precio_min)) || Number(precio_min) < 0)
    ) {
      return res.status(400).json({
        mensaje: 'El precio mínimo no es válido'
      });
    }

    if (
      precio_max !== undefined &&
      precio_max !== '' &&
      (Number.isNaN(Number(precio_max)) || Number(precio_max) < 0)
    ) {
      return res.status(400).json({
        mensaje: 'El precio máximo no es válido'
      });
    }

    if (
      precio_min !== undefined &&
      precio_min !== '' &&
      precio_max !== undefined &&
      precio_max !== '' &&
      Number(precio_max) < Number(precio_min)
    ) {
      return res.status(400).json({
        mensaje: 'El precio máximo no puede ser menor que el precio mínimo'
      });
    }

    if (
      capacidad_personas !== undefined &&
      capacidad_personas !== '' &&
      (
        Number.isNaN(Number(capacidad_personas)) ||
        Number(capacidad_personas) < 0
      )
    ) {
      return res.status(400).json({
        mensaje: 'La capacidad de personas no es válida'
      });
    }

    const publicaciones = await listarPublicaciones({
      ubicacion: limpiarTexto(ubicacion) || null,
      tipo_inmueble: tipoNormalizado || null,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      precio_min,
      precio_max,
      capacidad_personas
    });

    return res.json({
      mensaje: 'Publicaciones obtenidas correctamente',
      total: publicaciones.length,
      publicaciones
    });

  } catch (error) {
    console.error('Error al listar publicaciones:', error);

    return res.status(500).json({
      mensaje: 'Error interno al listar publicaciones',
      error: error.message
    });
  }
};

const obtenerDetallePublicacion = async (req, res) => {
  try {
    const { publicacion_id } = req.params;

    const publicacionIdNumero = Number(publicacion_id);

    if (Number.isNaN(publicacionIdNumero) || publicacionIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El ID de la publicación no es válido'
      });
    }

    const publicacion = await obtenerPublicacionPorId(publicacionIdNumero);

    if (!publicacion) {
      return res.status(404).json({
        mensaje: 'La publicación no existe o no se encuentra disponible'
      });
    }

    const fotos = await obtenerFotosPublicacion(publicacionIdNumero);

    return res.json({
      mensaje: 'Detalle de publicación obtenido correctamente',
      publicacion,
      fotos
    });

  } catch (error) {
    console.error('Error al obtener detalle de publicación:', error);

    return res.status(500).json({
      mensaje: 'Error interno al obtener detalle de publicación',
      error: error.message
    });
  }
};

module.exports = {
  listarPublicacionesPublicas,
  obtenerDetallePublicacion
};