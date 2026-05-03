const {
  buscarEdificioPorCodigo,
  registrarEdificio,
  listarEdificios,
  buscarEdificioPadrePorId,
  registrarPisoLocal,
  listarPisosLocalesPorEdificio,
  buscarUnidadPorUbicacion,
  buscarUnidadPorId
} = require('../models/edificio.model');

const limpiarTexto = (valor) => {
  if (valor === undefined || valor === null) {
    return '';
  }

  return String(valor).trim();
};

const convertirNumeroOpcional = (valor) => {
  if (valor === undefined || valor === null || valor === '') {
    return null;
  }

  return Number(valor);
};

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

    const codigoNormalizado = limpiarTexto(codigo).toUpperCase();
    const nombreLimpio = limpiarTexto(nombre);
    const direccionLimpia = limpiarTexto(direccion_linea1);
    const numeroLimpio = limpiarTexto(numero);
    const codigoPostalLimpio = limpiarTexto(codigo_postal);

    if (!codigoNormalizado || !nombreLimpio || !direccionLimpia || !numeroLimpio || !codigoPostalLimpio) {
      return res.status(400).json({
        mensaje: 'Código, nombre, dirección principal, número y código postal son obligatorios'
      });
    }

    if (codigoNormalizado.length > 30) {
      return res.status(400).json({
        mensaje: 'El código no debe superar los 30 caracteres'
      });
    }

    if (nombreLimpio.length > 150) {
      return res.status(400).json({
        mensaje: 'El nombre del edificio no debe superar los 150 caracteres'
      });
    }

    if (direccionLimpia.length > 255) {
      return res.status(400).json({
        mensaje: 'La dirección principal no debe superar los 255 caracteres'
      });
    }

    if (numeroLimpio.length > 30) {
      return res.status(400).json({
        mensaje: 'El número no debe superar los 30 caracteres'
      });
    }

    if (codigoPostalLimpio.length > 20) {
      return res.status(400).json({
        mensaje: 'El código postal no debe superar los 20 caracteres'
      });
    }

    const areaConvertida = convertirNumeroOpcional(area_m2);
    const latitudConvertida = convertirNumeroOpcional(latitud);
    const longitudConvertida = convertirNumeroOpcional(longitud);

    const erroresNumericos = [];

    if (areaConvertida !== null && (Number.isNaN(areaConvertida) || areaConvertida <= 0)) {
      erroresNumericos.push('El área en m² debe ser un número mayor a 0');
    }

    if (latitudConvertida !== null && (Number.isNaN(latitudConvertida) || latitudConvertida < -90 || latitudConvertida > 90)) {
      erroresNumericos.push('La latitud debe ser un número entre -90 y 90');
    }

    if (longitudConvertida !== null && (Number.isNaN(longitudConvertida) || longitudConvertida < -180 || longitudConvertida > 180)) {
      erroresNumericos.push('La longitud debe ser un número entre -180 y 180');
    }

    if (erroresNumericos.length > 0) {
      return res.status(400).json({
        mensaje: 'Existen datos numéricos inválidos',
        errores: erroresNumericos
      });
    }

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
      nombre: nombreLimpio,
      descripcion: limpiarTexto(descripcion) || null,
      direccion_linea1: direccionLimpia,
      direccion_linea2: limpiarTexto(direccion_linea2) || null,
      numero: numeroLimpio,
      distrito: limpiarTexto(distrito) || null,
      ciudad: limpiarTexto(ciudad) || null,
      provincia: limpiarTexto(provincia) || null,
      departamento: limpiarTexto(departamento) || null,
      codigo_postal: codigoPostalLimpio,
      pais: limpiarTexto(pais) || 'Perú',
      area_m2: areaConvertida,
      latitud: latitudConvertida,
      longitud: longitudConvertida
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

const validarNumero = (valor, nombreCampo, opciones = {}) => {
  const { obligatorio = false, minimo = 0 } = opciones;

  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) {
      return `${nombreCampo} es obligatorio`;
    }

    return null;
  }

  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return `${nombreCampo} debe ser un número válido`;
  }

  if (numero < minimo) {
    return `${nombreCampo} no puede ser menor que ${minimo}`;
  }

  return null;
};

const crearPisoLocal = async (req, res) => {
  try {
    const {
      edificio_id,
      codigo,
      tipo_inmueble,
      nombre,
      subtipo_unidad,
      descripcion,
      planta,
      letra,
      area_m2,
      num_habitaciones,
      num_banos,
      capacidad_personas,
      renta_base_mensual,
      moneda
    } = req.body;

    if (!edificio_id || !codigo || !tipo_inmueble || !nombre || !planta || !letra) {
      return res.status(400).json({
        mensaje: 'Edificio, código, tipo, nombre, planta y letra son obligatorios'
      });
    }

    const edificioIdNumero = Number(edificio_id);

    if (Number.isNaN(edificioIdNumero) || edificioIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El edificio seleccionado no es válido'
      });
    }

    const tipoNormalizado = tipo_inmueble.trim().toUpperCase();

    if (tipoNormalizado !== 'PISO' && tipoNormalizado !== 'LOCAL') {
      return res.status(400).json({
        mensaje: 'El tipo de inmueble solo puede ser PISO o LOCAL'
      });
    }

    if (codigo.length > 30) {
      return res.status(400).json({
        mensaje: 'El código no debe superar los 30 caracteres'
      });
    }

    const erroresNumericos = [
      validarNumero(area_m2, 'El área en m²', { minimo: 0.01 }),
      validarNumero(num_habitaciones, 'El número de habitaciones', { minimo: 0 }),
      validarNumero(num_banos, 'El número de baños', { minimo: 0 }),
      validarNumero(capacidad_personas, 'La capacidad de personas', { minimo: 0 }),
      validarNumero(renta_base_mensual, 'La renta base mensual', { minimo: 0 })
    ].filter(Boolean);

    if (erroresNumericos.length > 0) {
      return res.status(400).json({
        mensaje: 'Existen datos numéricos inválidos',
        errores: erroresNumericos
      });
    }

    const codigoNormalizado = codigo.trim().toUpperCase();

    const unidadExistente = await buscarEdificioPorCodigo(codigoNormalizado);

    if (unidadExistente) {
      return res.status(409).json({
        mensaje: 'Ya existe un inmueble con ese código'
      });
    }

    /*
      Por ahora usamos empresa_id = 1, igual que en Registrar Edificio.
      Luego se podrá obtener desde el token JWT.
    */
    const empresaId = 1;

    const edificioPadre = await buscarEdificioPadrePorId(empresaId, edificioIdNumero);

    if (!edificioPadre) {
      return res.status(404).json({
        mensaje: 'El edificio seleccionado no existe o no está activo'
      });
    }

    const plantaNormalizada = planta.trim();
    const letraNormalizada = letra.trim().toUpperCase();

    const unidadMismaUbicacion = await buscarUnidadPorUbicacion(
      empresaId,
      edificioIdNumero,
      plantaNormalizada,
      letraNormalizada
    );

    if (unidadMismaUbicacion) {
      return res.status(409).json({
        mensaje: 'Ya existe un piso/local registrado en esa planta y letra para este edificio',
        unidad_existente: {
          inmueble_id: unidadMismaUbicacion.inmueble_id,
          codigo: unidadMismaUbicacion.codigo,
          tipo_inmueble: unidadMismaUbicacion.tipo_inmueble,
          nombre: unidadMismaUbicacion.nombre,
          planta: unidadMismaUbicacion.planta,
          letra: unidadMismaUbicacion.letra
        }
      });
    }

    const unidadCreada = await registrarPisoLocal({
      empresa_id: empresaId,
      edificio_id: edificioIdNumero,
      codigo: codigoNormalizado,
      tipo_inmueble: tipoNormalizado,
      nombre: nombre.trim(),
      subtipo_unidad: subtipo_unidad ? subtipo_unidad.trim().toUpperCase() : null,
      descripcion,
      planta: plantaNormalizada,
      letra: letraNormalizada,
      area_m2: area_m2 !== undefined && area_m2 !== null && area_m2 !== '' ? Number(area_m2) : null,
      num_habitaciones: num_habitaciones !== undefined && num_habitaciones !== null && num_habitaciones !== '' ? Number(num_habitaciones) : null,
      num_banos: num_banos !== undefined && num_banos !== null && num_banos !== '' ? Number(num_banos) : null,
      capacidad_personas: capacidad_personas !== undefined && capacidad_personas !== null && capacidad_personas !== '' ? Number(capacidad_personas) : null,
      renta_base_mensual: renta_base_mensual !== undefined && renta_base_mensual !== null && renta_base_mensual !== '' ? Number(renta_base_mensual) : null,
      moneda: moneda ? moneda.trim().toUpperCase() : 'PEN'
    });

    return res.status(201).json({
      mensaje: `${tipoNormalizado} registrado correctamente`,
      edificio_padre: {
        inmueble_id: edificioPadre.inmueble_id,
        codigo: edificioPadre.codigo,
        nombre: edificioPadre.nombre
      },
      unidad: unidadCreada
    });

  } catch (error) {
    console.error('Error al registrar piso/local:', error);

    return res.status(500).json({
      mensaje: 'Error interno al registrar piso/local',
      error: error.message
    });
  }
};

const obtenerUnidadesPorEdificio = async (req, res) => {
  try {
    const { edificio_id } = req.params;

    const edificioIdNumero = Number(edificio_id);

    if (Number.isNaN(edificioIdNumero) || edificioIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El ID del edificio no es válido'
      });
    }

    /*
      Por ahora usamos empresa_id = 1, igual que en las demás rutas.
      Más adelante se podrá obtener desde el token JWT.
    */
    const empresaId = 1;

    const edificioPadre = await buscarEdificioPadrePorId(empresaId, edificioIdNumero);

    if (!edificioPadre) {
      return res.status(404).json({
        mensaje: 'El edificio no existe o no está activo'
      });
    }

    const unidades = await listarPisosLocalesPorEdificio(empresaId, edificioIdNumero);

    return res.json({
      mensaje: 'Pisos/locales obtenidos correctamente',
      edificio: {
        inmueble_id: edificioPadre.inmueble_id,
        codigo: edificioPadre.codigo,
        nombre: edificioPadre.nombre
      },
      total: unidades.length,
      unidades
    });

  } catch (error) {
    console.error('Error al listar pisos/locales:', error);

    return res.status(500).json({
      mensaje: 'Error interno al listar pisos/locales',
      error: error.message
    });
  }
};

const obtenerUnidadPorId = async (req, res) => {
  try {
    const { unidad_id } = req.params;

    const unidadIdNumero = Number(unidad_id);

    if (Number.isNaN(unidadIdNumero) || unidadIdNumero <= 0) {
      return res.status(400).json({
        mensaje: 'El ID del piso/local no es válido'
      });
    }

    /*
      Por ahora usamos empresa_id = 1.
      Luego se podrá obtener desde el token JWT.
    */
    const empresaId = 1;

    const unidad = await buscarUnidadPorId(empresaId, unidadIdNumero);

    if (!unidad) {
      return res.status(404).json({
        mensaje: 'El piso/local no existe o no pertenece a la empresa'
      });
    }

    return res.json({
      mensaje: 'Piso/local obtenido correctamente',
      unidad
    });

  } catch (error) {
    console.error('Error al obtener piso/local:', error);

    return res.status(500).json({
      mensaje: 'Error interno al obtener piso/local',
      error: error.message
    });
  }
};

module.exports = {
  crearEdificio,
  obtenerEdificios,
  crearPisoLocal,
  obtenerUnidadesPorEdificio,
  obtenerUnidadPorId
};