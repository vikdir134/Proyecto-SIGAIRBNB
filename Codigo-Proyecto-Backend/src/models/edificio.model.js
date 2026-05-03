const { getConnection, sql } = require('../config/db');

const buscarEdificioPorCodigo = async (codigo) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('codigo', sql.NVarChar(30), codigo)
    .query(`
      SELECT 
        inmueble_id,
        codigo,
        nombre,
        tipo_inmueble,
        activo
      FROM catalog.Inmueble
      WHERE codigo = @codigo
        AND deleted_at IS NULL;
    `);

  return result.recordset[0];
};

const registrarEdificio = async ({
  empresa_id,
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
}) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('codigo', sql.NVarChar(30), codigo)
    .input('nombre', sql.NVarChar(150), nombre)
    .input('descripcion', sql.NVarChar(1000), descripcion || null)
    .input('direccion_linea1', sql.NVarChar(255), direccion_linea1)
    .input('direccion_linea2', sql.NVarChar(255), direccion_linea2 || null)
    .input('numero', sql.NVarChar(30), numero || null)
    .input('distrito', sql.NVarChar(100), distrito || null)
    .input('ciudad', sql.NVarChar(100), ciudad || null)
    .input('provincia', sql.NVarChar(100), provincia || null)
    .input('departamento', sql.NVarChar(100), departamento || null)
    .input('codigo_postal', sql.NVarChar(20), codigo_postal || null)
    .input('pais', sql.NVarChar(100), pais || 'Perú')
    .input('area_m2', sql.Decimal(10, 2), area_m2 || null)
    .input('latitud', sql.Decimal(9, 6), latitud || null)
    .input('longitud', sql.Decimal(9, 6), longitud || null)
    .query(`
      INSERT INTO catalog.Inmueble (
        empresa_id,
        edificio_id,
        codigo,
        tipo_inmueble,
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
        planta,
        letra,
        area_m2,
        latitud,
        longitud,
        estado_operativo,
        es_publicable,
        activo
      )
      OUTPUT 
        INSERTED.inmueble_id,
        INSERTED.codigo,
        INSERTED.nombre,
        INSERTED.tipo_inmueble,
        INSERTED.direccion_linea1,
        INSERTED.numero,
        INSERTED.codigo_postal,
        INSERTED.ciudad,
        INSERTED.estado_operativo,
        INSERTED.created_at
      VALUES (
        @empresa_id,
        NULL,
        @codigo,
        'EDIFICIO',
        @nombre,
        @descripcion,
        @direccion_linea1,
        @direccion_linea2,
        @numero,
        @distrito,
        @ciudad,
        @provincia,
        @departamento,
        @codigo_postal,
        @pais,
        NULL,
        NULL,
        @area_m2,
        @latitud,
        @longitud,
        'DISPONIBLE',
        1,
        1
      );
    `);

  return result.recordset[0];
};

const listarEdificios = async (empresa_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .query(`
      SELECT
        inmueble_id,
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
        estado_operativo,
        activo,
        created_at
      FROM catalog.Inmueble
      WHERE empresa_id = @empresa_id
        AND tipo_inmueble = 'EDIFICIO'
        AND deleted_at IS NULL
      ORDER BY created_at DESC;
    `);

  return result.recordset;
};

const buscarEdificioPadrePorId = async (empresa_id, edificio_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('edificio_id', sql.Int, edificio_id)
    .query(`
      SELECT
        inmueble_id,
        empresa_id,
        codigo,
        nombre,
        tipo_inmueble,
        direccion_linea1,
        direccion_linea2,
        numero,
        distrito,
        ciudad,
        provincia,
        departamento,
        codigo_postal,
        pais,
        activo
      FROM catalog.Inmueble
      WHERE inmueble_id = @edificio_id
        AND empresa_id = @empresa_id
        AND tipo_inmueble = 'EDIFICIO'
        AND activo = 1
        AND deleted_at IS NULL;
    `);

  return result.recordset[0];
};

const registrarPisoLocal = async ({
  empresa_id,
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
}) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('edificio_id', sql.Int, edificio_id)
    .input('codigo', sql.NVarChar(30), codigo)
    .input('tipo_inmueble', sql.NVarChar(20), tipo_inmueble)
    .input('nombre', sql.NVarChar(150), nombre)
    .input('subtipo_unidad', sql.NVarChar(50), subtipo_unidad || null)
    .input('descripcion', sql.NVarChar(1000), descripcion || null)
    .input('planta', sql.NVarChar(20), planta)
    .input('letra', sql.NVarChar(20), letra)
    .input('area_m2', sql.Decimal(10, 2), area_m2 || null)
    .input('num_habitaciones', sql.Int, num_habitaciones || null)
    .input('num_banos', sql.Int, num_banos || null)
    .input('capacidad_personas', sql.Int, capacidad_personas || null)
    .input('renta_base_mensual', sql.Decimal(12, 2), renta_base_mensual || null)
    .input('moneda', sql.Char(3), moneda || 'PEN')
    .query(`
      INSERT INTO catalog.Inmueble (
        empresa_id,
        edificio_id,
        codigo,
        tipo_inmueble,
        nombre,
        subtipo_unidad,
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

        planta,
        letra,
        area_m2,
        num_habitaciones,
        num_banos,
        capacidad_personas,
        renta_base_mensual,
        moneda,

        estado_operativo,
        es_publicable,
        activo
      )
      OUTPUT
        INSERTED.inmueble_id,
        INSERTED.edificio_id,
        INSERTED.codigo,
        INSERTED.tipo_inmueble,
        INSERTED.nombre,
        INSERTED.subtipo_unidad,
        INSERTED.planta,
        INSERTED.letra,
        INSERTED.area_m2,
        INSERTED.renta_base_mensual,
        INSERTED.moneda,
        INSERTED.estado_operativo,
        INSERTED.created_at
      SELECT
        @empresa_id,
        e.inmueble_id,
        @codigo,
        @tipo_inmueble,
        @nombre,
        @subtipo_unidad,
        @descripcion,

        e.direccion_linea1,
        e.direccion_linea2,
        e.numero,
        e.distrito,
        e.ciudad,
        e.provincia,
        e.departamento,
        e.codigo_postal,
        e.pais,

        @planta,
        @letra,
        @area_m2,
        @num_habitaciones,
        @num_banos,
        @capacidad_personas,
        @renta_base_mensual,
        @moneda,

        'DISPONIBLE',
        1,
        1
      FROM catalog.Inmueble e
      WHERE e.inmueble_id = @edificio_id
        AND e.empresa_id = @empresa_id
        AND e.tipo_inmueble = 'EDIFICIO'
        AND e.activo = 1
        AND e.deleted_at IS NULL;
    `);

  return result.recordset[0];
};

const listarPisosLocalesPorEdificio = async (empresa_id, edificio_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('edificio_id', sql.Int, edificio_id)
    .query(`
      SELECT
        unidad.inmueble_id,
        unidad.edificio_id,
        edificio.codigo AS codigo_edificio,
        edificio.nombre AS nombre_edificio,

        unidad.codigo,
        unidad.tipo_inmueble,
        unidad.nombre,
        unidad.subtipo_unidad,
        unidad.descripcion,
        unidad.planta,
        unidad.letra,
        unidad.area_m2,
        unidad.num_habitaciones,
        unidad.num_banos,
        unidad.capacidad_personas,
        unidad.renta_base_mensual,
        unidad.moneda,
        unidad.estado_operativo,
        unidad.es_publicable,
        unidad.activo,
        unidad.created_at
      FROM catalog.Inmueble unidad
      INNER JOIN catalog.Inmueble edificio
        ON edificio.inmueble_id = unidad.edificio_id
      WHERE unidad.empresa_id = @empresa_id
        AND unidad.edificio_id = @edificio_id
        AND unidad.tipo_inmueble IN ('PISO', 'LOCAL')
        AND unidad.deleted_at IS NULL
        AND edificio.tipo_inmueble = 'EDIFICIO'
        AND edificio.deleted_at IS NULL
      ORDER BY 
        unidad.tipo_inmueble,
        unidad.planta,
        unidad.letra,
        unidad.created_at DESC;
    `);

  return result.recordset;
};

const buscarUnidadPorUbicacion = async (empresa_id, edificio_id, planta, letra) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('edificio_id', sql.Int, edificio_id)
    .input('planta', sql.NVarChar(20), planta)
    .input('letra', sql.NVarChar(20), letra)
    .query(`
      SELECT
        inmueble_id,
        edificio_id,
        codigo,
        tipo_inmueble,
        nombre,
        planta,
        letra,
        activo
      FROM catalog.Inmueble
      WHERE empresa_id = @empresa_id
        AND edificio_id = @edificio_id
        AND planta = @planta
        AND letra = @letra
        AND tipo_inmueble IN ('PISO', 'LOCAL')
        AND deleted_at IS NULL;
    `);

  return result.recordset[0];
};

const buscarUnidadPorId = async (empresa_id, unidad_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('unidad_id', sql.Int, unidad_id)
    .query(`
      SELECT
        unidad.inmueble_id,
        unidad.empresa_id,
        unidad.edificio_id,

        edificio.codigo AS codigo_edificio,
        edificio.nombre AS nombre_edificio,

        unidad.codigo,
        unidad.tipo_inmueble,
        unidad.nombre,
        unidad.subtipo_unidad,
        unidad.descripcion,

        unidad.direccion_linea1,
        unidad.direccion_linea2,
        unidad.numero,
        unidad.distrito,
        unidad.ciudad,
        unidad.provincia,
        unidad.departamento,
        unidad.codigo_postal,
        unidad.pais,

        unidad.planta,
        unidad.letra,
        unidad.area_m2,
        unidad.num_habitaciones,
        unidad.num_banos,
        unidad.capacidad_personas,
        unidad.renta_base_mensual,
        unidad.moneda,

        unidad.latitud,
        unidad.longitud,
        unidad.estado_operativo,
        unidad.es_publicable,
        unidad.activo,
        unidad.created_at,
        unidad.updated_at
      FROM catalog.Inmueble unidad
      INNER JOIN catalog.Inmueble edificio
        ON edificio.inmueble_id = unidad.edificio_id
      WHERE unidad.inmueble_id = @unidad_id
        AND unidad.empresa_id = @empresa_id
        AND unidad.tipo_inmueble IN ('PISO', 'LOCAL')
        AND unidad.deleted_at IS NULL
        AND edificio.tipo_inmueble = 'EDIFICIO'
        AND edificio.deleted_at IS NULL;
    `);

  return result.recordset[0];
};

module.exports = {
  buscarEdificioPorCodigo,
  registrarEdificio,
  listarEdificios,
  buscarEdificioPadrePorId,
  registrarPisoLocal,
  listarPisosLocalesPorEdificio,
  buscarUnidadPorUbicacion,
  buscarUnidadPorId
};