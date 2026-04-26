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

module.exports = {
  buscarEdificioPorCodigo,
  registrarEdificio,
  listarEdificios
};