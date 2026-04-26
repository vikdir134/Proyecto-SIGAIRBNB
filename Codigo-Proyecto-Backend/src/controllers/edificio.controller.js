const {
  buscarEdificioPorCodigo,
  registrarEdificio,
  listarEdificios
} = require('../models/edificio.model');

const crearEdificio = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      descripcion,
      direccion_linea1,
      direccion_linea2,
      numero,
      distrito,
      ciudad,
      provincia,
      departamento,
      codigo_postal,
      pais,
      area_m2,
      latitud,
      longitud
    } = req.body;

    if (!codigo || !nombre || !direccion_linea1) {
      return res.status(400).json({
        mensaje: 'Código, nombre y dirección principal son obligatorios'
      });
    }

    if (codigo.length > 30) {
      return res.status(400).json({
        mensaje: 'El código no debe superar los 30 caracteres'
      });
    }

    const codigoNormalizado = codigo.trim().toUpperCase();

    const edificioExistente = await buscarEdificioPorCodigo(codigoNormalizado);

    if (edificioExistente) {
      return res.status(409).json({
        mensaje: 'Ya existe un edificio con ese código'
      });
    }

    /*
      Por ahora usamos empresa_id = 1 porque en el Sprint 1
      todos los usuarios se registran asociados a la empresa demo.
      Más adelante podemos tomar empresa_id desde el token o desde BD.
    */
    const edificioCreado = await registrarEdificio({
      empresa_id: 1,
      codigo: codigoNormalizado,
      nombre: nombre.trim(),
      descripcion,
      direccion_linea1: direccion_linea1.trim(),
      direccion_linea2,
      numero,
      distrito,
      ciudad,
      provincia,
      departamento,
      codigo_postal,
      pais,
      area_m2: area_m2 ? Number(area_m2) : null,
      latitud: latitud ? Number(latitud) : null,
      longitud: longitud ? Number(longitud) : null
    });

    return res.status(201).json({
      mensaje: 'Edificio registrado correctamente',
      edificio: edificioCreado
    });

  } catch (error) {
    console.error('Error al registrar edificio:', error);

    return res.status(500).json({
      mensaje: 'Error interno al registrar edificio',
      error: error.message
    });
  }
};

const obtenerEdificios = async (req, res) => {
  try {
    const edificios = await listarEdificios(1);

    return res.json({
      mensaje: 'Edificios obtenidos correctamente',
      total: edificios.length,
      edificios
    });

  } catch (error) {
    console.error('Error al listar edificios:', error);

    return res.status(500).json({
      mensaje: 'Error interno al listar edificios',
      error: error.message
    });
  }
};

module.exports = {
  crearEdificio,
  obtenerEdificios
};