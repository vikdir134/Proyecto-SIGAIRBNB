const { getConnection, sql } = require('../config/db');

const listarPublicaciones = async (filtros = {}) => {
  const pool = await getConnection();

  const {
    ubicacion,
    tipo_inmueble,
    fecha_inicio,
    fecha_fin,
    precio_min,
    precio_max,
    capacidad_personas
  } = filtros;

  const request = pool.request();

  const condiciones = [
    "p.estado_publicacion = 'PUBLICADO'",
    "p.acepta_reservas = 1",
    "i.activo = 1",
    "i.es_publicable = 1",
    "i.estado_operativo = 'DISPONIBLE'",
    "i.deleted_at IS NULL"
  ];

  if (ubicacion) {
    request.input('ubicacion', sql.NVarChar(100), `%${ubicacion}%`);

    condiciones.push(`
      (
        i.distrito LIKE @ubicacion
        OR i.ciudad LIKE @ubicacion
        OR i.provincia LIKE @ubicacion
        OR i.departamento LIKE @ubicacion
        OR i.direccion_linea1 LIKE @ubicacion
        OR i.nombre LIKE @ubicacion
      )
    `);
  }

  if (tipo_inmueble) {
    request.input('tipo_inmueble', sql.NVarChar(20), tipo_inmueble);
    condiciones.push('i.tipo_inmueble = @tipo_inmueble');
  }

  if (precio_min !== undefined && precio_min !== null && precio_min !== '') {
    request.input('precio_min', sql.Decimal(12, 2), Number(precio_min));
    condiciones.push('p.precio_publicado_mensual >= @precio_min');
  }

  if (precio_max !== undefined && precio_max !== null && precio_max !== '') {
    request.input('precio_max', sql.Decimal(12, 2), Number(precio_max));
    condiciones.push('p.precio_publicado_mensual <= @precio_max');
  }

  if (
    capacidad_personas !== undefined &&
    capacidad_personas !== null &&
    capacidad_personas !== ''
  ) {
    request.input('capacidad_personas', sql.Int, Number(capacidad_personas));
    condiciones.push(`
      (
        i.capacidad_personas IS NULL
        OR i.capacidad_personas >= @capacidad_personas
      )
    `);
  }

  if (fecha_inicio && fecha_fin) {
    request.input('fecha_inicio', sql.Date, fecha_inicio);
    request.input('fecha_fin', sql.Date, fecha_fin);

    condiciones.push(`
      NOT EXISTS (
        SELECT 1
        FROM catalog.BloqueoDisponibilidad b
        WHERE b.inmueble_id = i.inmueble_id
          AND b.activo = 1
          AND @fecha_inicio <= b.fecha_fin
          AND @fecha_fin >= b.fecha_inicio
      )
    `);

    condiciones.push(`
      NOT EXISTS (
        SELECT 1
        FROM booking.Reserva r
        WHERE r.inmueble_id = i.inmueble_id
          AND r.estado_reserva IN ('APROBADA', 'ACTIVA')
          AND @fecha_inicio <= r.fecha_fin
          AND @fecha_fin >= r.fecha_inicio
      )
    `);
  }

  const result = await request.query(`
    SELECT
      p.publicacion_id,
      p.inmueble_id,
      p.titulo,
      p.descripcion_corta,
      p.precio_publicado_mensual,
      p.moneda,
      p.disponible_desde,
      p.es_destacado,
      p.acepta_reservas,
      p.fecha_publicacion,

      i.codigo AS codigo_inmueble,
      i.tipo_inmueble,
      i.nombre AS nombre_inmueble,
      i.subtipo_unidad,
      i.direccion_linea1,
      i.numero,
      i.distrito,
      i.ciudad,
      i.provincia,
      i.departamento,
      i.area_m2,
      i.num_habitaciones,
      i.num_banos,
      i.capacidad_personas,
      i.estado_operativo,

      foto.url_foto AS foto_principal
    FROM catalog.Publicacion p
    INNER JOIN catalog.Inmueble i
      ON i.inmueble_id = p.inmueble_id
    OUTER APPLY (
      SELECT TOP 1
        f.url_foto
      FROM catalog.InmuebleFoto f
      WHERE f.publicacion_id = p.publicacion_id
      ORDER BY
        CASE WHEN f.es_principal = 1 THEN 0 ELSE 1 END,
        f.orden_visual ASC
    ) foto
    WHERE ${condiciones.join(' AND ')}
    ORDER BY
      p.es_destacado DESC,
      p.fecha_publicacion DESC,
      p.created_at DESC;
  `);

  return result.recordset;
};

const obtenerPublicacionPorId = async (publicacion_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('publicacion_id', sql.Int, publicacion_id)
    .query(`
      SELECT
        p.publicacion_id,
        p.inmueble_id,
        p.titulo,
        p.descripcion_corta,
        p.descripcion_larga,
        p.precio_publicado_mensual,
        p.moneda,
        p.condiciones_arrendamiento,
        p.disponible_desde,
        p.estado_publicacion,
        p.es_destacado,
        p.acepta_reservas,
        p.fecha_publicacion,

        i.codigo AS codigo_inmueble,
        i.tipo_inmueble,
        i.nombre AS nombre_inmueble,
        i.subtipo_unidad,
        i.descripcion AS descripcion_inmueble,
        i.direccion_linea1,
        i.direccion_linea2,
        i.numero,
        i.distrito,
        i.ciudad,
        i.provincia,
        i.departamento,
        i.codigo_postal,
        i.pais,
        i.planta,
        i.letra,
        i.area_m2,
        i.num_habitaciones,
        i.num_banos,
        i.capacidad_personas,
        i.renta_base_mensual,
        i.moneda AS moneda_inmueble,
        i.estado_operativo,
        i.es_publicable,
        i.activo
      FROM catalog.Publicacion p
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = p.inmueble_id
      WHERE p.publicacion_id = @publicacion_id
        AND p.estado_publicacion = 'PUBLICADO'
        AND p.acepta_reservas = 1
        AND i.activo = 1
        AND i.es_publicable = 1
        AND i.estado_operativo = 'DISPONIBLE'
        AND i.deleted_at IS NULL;
    `);

  return result.recordset[0];
};

const obtenerFotosPublicacion = async (publicacion_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('publicacion_id', sql.Int, publicacion_id)
    .query(`
      SELECT
        inmueble_foto_id,
        publicacion_id,
        url_foto,
        nombre_archivo,
        orden_visual,
        es_principal,
        created_at
      FROM catalog.InmuebleFoto
      WHERE publicacion_id = @publicacion_id
      ORDER BY
        CASE WHEN es_principal = 1 THEN 0 ELSE 1 END,
        orden_visual ASC;
    `);

  return result.recordset;
};

module.exports = {
  listarPublicaciones,
  obtenerPublicacionPorId,
  obtenerFotosPublicacion
};