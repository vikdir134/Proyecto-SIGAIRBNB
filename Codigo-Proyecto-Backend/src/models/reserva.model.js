const { getConnection, sql } = require('../config/db');

const obtenerPublicacionReservablePorId = async (publicacion_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('publicacion_id', sql.Int, publicacion_id)
    .query(`
      SELECT
        p.publicacion_id,
        p.inmueble_id,
        p.titulo,
        p.precio_publicado_mensual,
        p.moneda,
        p.disponible_desde,
        p.estado_publicacion,
        p.acepta_reservas,

        i.empresa_id,
        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble,
        i.tipo_inmueble,
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
        AND i.deleted_at IS NULL
        AND i.es_publicable = 1
        AND i.estado_operativo = 'DISPONIBLE';
    `);

  return result.recordset[0];
};

const buscarConflictosReserva = async ({
  empresa_id,
  inmueble_id,
  fecha_inicio,
  fecha_fin
}) => {
  const pool = await getConnection();

  const bloqueosResult = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('inmueble_id', sql.Int, inmueble_id)
    .input('fecha_inicio', sql.Date, fecha_inicio)
    .input('fecha_fin', sql.Date, fecha_fin)
    .query(`
      SELECT
        b.bloqueo_disponibilidad_id,
        b.inmueble_id,
        b.fecha_inicio,
        b.fecha_fin,
        b.motivo,
        b.origen
      FROM catalog.BloqueoDisponibilidad b
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = b.inmueble_id
      WHERE b.inmueble_id = @inmueble_id
        AND i.empresa_id = @empresa_id
        AND b.activo = 1
        AND i.activo = 1
        AND i.deleted_at IS NULL
        AND (
          @fecha_inicio <= b.fecha_fin
          AND @fecha_fin >= b.fecha_inicio
        );
    `);

  const reservasResult = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('inmueble_id', sql.Int, inmueble_id)
    .input('fecha_inicio', sql.Date, fecha_inicio)
    .input('fecha_fin', sql.Date, fecha_fin)
    .query(`
      SELECT
        r.reserva_id,
        r.inmueble_id,
        r.inquilino_id,
        r.estado_reserva,
        r.fecha_inicio,
        r.fecha_fin,
        r.observacion_inquilino
      FROM booking.Reserva r
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      WHERE r.inmueble_id = @inmueble_id
        AND i.empresa_id = @empresa_id
        AND i.activo = 1
        AND i.deleted_at IS NULL
        AND r.estado_reserva IN ('SOLICITADA', 'APROBADA', 'ACTIVA')
        AND (
          @fecha_inicio <= r.fecha_fin
          AND @fecha_fin >= r.fecha_inicio
        );
    `);

  return {
    bloqueos: bloqueosResult.recordset,
    reservas: reservasResult.recordset
  };
};

const crearSolicitudReserva = async ({
  inmueble_id,
  inquilino_id,
  fecha_inicio,
  fecha_fin,
  renta_pactada_mensual,
  moneda,
  observacion_inquilino
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestReserva = new sql.Request(transaction);

    const reservaResult = await requestReserva
      .input('inmueble_id', sql.Int, inmueble_id)
      .input('inquilino_id', sql.Int, inquilino_id)
      .input('fecha_inicio', sql.Date, fecha_inicio)
      .input('fecha_fin', sql.Date, fecha_fin)
      .input('renta_pactada_mensual', sql.Decimal(12, 2), renta_pactada_mensual)
      .input('moneda', sql.Char(3), moneda || 'PEN')
      .input('observacion_inquilino', sql.NVarChar(500), observacion_inquilino || null)
      .query(`
        INSERT INTO booking.Reserva (
          inmueble_id,
          inquilino_id,
          estado_reserva,
          fecha_inicio,
          fecha_fin,
          renta_pactada_mensual,
          moneda,
          observacion_inquilino
        )
        OUTPUT
          INSERTED.reserva_id,
          INSERTED.inmueble_id,
          INSERTED.inquilino_id,
          INSERTED.estado_reserva,
          INSERTED.fecha_solicitud,
          INSERTED.fecha_inicio,
          INSERTED.fecha_fin,
          INSERTED.renta_pactada_mensual,
          INSERTED.moneda,
          INSERTED.observacion_inquilino,
          INSERTED.created_at
        VALUES (
          @inmueble_id,
          @inquilino_id,
          'SOLICITADA',
          @fecha_inicio,
          @fecha_fin,
          @renta_pactada_mensual,
          @moneda,
          @observacion_inquilino
        );
      `);

    const reservaCreada = reservaResult.recordset[0];

    const requestEvento = new sql.Request(transaction);

    await requestEvento
      .input('reserva_id', sql.Int, reservaCreada.reserva_id)
      .input('usuario_id', sql.Int, inquilino_id)
      .input('tipo_evento', sql.NVarChar(30), 'SOLICITUD')
      .input('descripcion', sql.NVarChar(500), 'El inquilino envió una solicitud de reserva.')
      .query(`
        INSERT INTO booking.ReservaEvento (
          reserva_id,
          usuario_id,
          tipo_evento,
          descripcion
        )
        VALUES (
          @reserva_id,
          @usuario_id,
          @tipo_evento,
          @descripcion
        );
      `);

    await transaction.commit();

    return reservaCreada;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const listarSolicitudesPorInquilino = async (inquilino_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('inquilino_id', sql.Int, inquilino_id)
    .query(`
      SELECT
        r.reserva_id,
        r.inmueble_id,
        r.inquilino_id,
        r.estado_reserva,
        r.fecha_solicitud,
        r.fecha_inicio,
        r.fecha_fin,
        r.renta_pactada_mensual,
        r.monto_total_estimado,
        r.deposito_garantia,
        r.moneda,
        r.observacion_inquilino,
        r.observacion_gestor,
        r.motivo_rechazo,
        r.fecha_decision,
        r.created_at,

        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble,
        i.tipo_inmueble,
        i.subtipo_unidad,
        i.direccion_linea1,
        i.numero,
        i.distrito,
        i.ciudad,
        i.provincia,
        i.departamento,

        p.publicacion_id,
        p.titulo AS titulo_publicacion,
        p.descripcion_corta,
        p.precio_publicado_mensual,

        foto.url_foto AS foto_principal
      FROM booking.Reserva r
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      LEFT JOIN catalog.Publicacion p
        ON p.inmueble_id = i.inmueble_id
      OUTER APPLY (
        SELECT TOP 1
          f.url_foto
        FROM catalog.InmuebleFoto f
        WHERE f.publicacion_id = p.publicacion_id
        ORDER BY
          CASE WHEN f.es_principal = 1 THEN 0 ELSE 1 END,
          f.orden_visual ASC
      ) foto
      WHERE r.inquilino_id = @inquilino_id
      ORDER BY r.fecha_solicitud DESC;
    `);

  return result.recordset;
};

const listarSolicitudesGestionEmpresa = async (usuario_publicador_id, filtros = {}) => {
  const pool = await getConnection();

  const { estado_reserva } = filtros;

  const request = pool.request()
    .input('usuario_publicador_id', sql.Int, usuario_publicador_id);

  const condiciones = [
    `(
      p.publicado_por_usuario_id = @usuario_publicador_id

      OR EXISTS (
        SELECT 1
        FROM core.EmpresaSecretario es
        WHERE es.empresa_id = i.empresa_id
          AND es.secretario_usuario_id = @usuario_publicador_id
          AND es.activo = 1
      )
    )`,
    'i.activo = 1',
    'i.deleted_at IS NULL'
  ];

  if (estado_reserva) {
    request.input('estado_reserva', sql.NVarChar(20), estado_reserva);
    condiciones.push('r.estado_reserva = @estado_reserva');
  }

  const result = await request.query(`
    SELECT
      r.reserva_id,
      r.inmueble_id,
      r.inquilino_id,
      r.estado_reserva,
      r.fecha_solicitud,
      r.fecha_inicio,
      r.fecha_fin,
      r.renta_pactada_mensual,
      r.monto_total_estimado,
      r.deposito_garantia,
      r.moneda,
      r.observacion_inquilino,
      r.observacion_gestor,
      r.motivo_rechazo,
      r.fecha_decision,
      r.gestionado_por_usuario_id,

      r.fecha_checkin,
      r.fecha_checkout,
      r.checkin_confirmado_por,
      r.checkout_confirmado_por,

      r.created_at,
      r.updated_at,

      i.codigo AS codigo_inmueble,
      i.nombre AS nombre_inmueble,
      i.tipo_inmueble,
      i.subtipo_unidad,
      i.direccion_linea1,
      i.numero,
      i.distrito,
      i.ciudad,
      i.provincia,
      i.departamento,

      p.publicacion_id,
      p.titulo AS titulo_publicacion,
      p.precio_publicado_mensual,
      p.publicado_por_usuario_id,

      u.correo AS correo_inquilino,
      pu.nombres AS nombres_inquilino,
      pu.apellidos AS apellidos_inquilino,
      pu.telefono AS telefono_inquilino,
      pu.tipo_documento,
      pu.numero_documento,
      pu.ingreso_mensual_referencial,
      pu.tiene_aval_bancario,
      pu.tiene_contrato_trabajo,
      pu.tiene_garante,

      evalUltima.evaluacion_inquilino_id,
      evalUltima.resultado AS resultado_evaluacion,
      evalUltima.score_riesgo,
      evalUltima.fecha_evaluacion,
      evalUltima.observaciones AS observaciones_evaluacion,

      foto.url_foto AS foto_principal
    FROM booking.Reserva r
    INNER JOIN catalog.Inmueble i
      ON i.inmueble_id = r.inmueble_id
    INNER JOIN catalog.Publicacion p
      ON p.inmueble_id = i.inmueble_id
    INNER JOIN auth.Usuario u
      ON u.usuario_id = r.inquilino_id
    LEFT JOIN core.PerfilUsuario pu
      ON pu.usuario_id = r.inquilino_id
    OUTER APPLY (
      SELECT TOP 1
        f.url_foto
      FROM catalog.InmuebleFoto f
      WHERE f.publicacion_id = p.publicacion_id
      ORDER BY
        CASE WHEN f.es_principal = 1 THEN 0 ELSE 1 END,
        f.orden_visual ASC
    ) foto
    OUTER APPLY (
      SELECT TOP 1
        ei.evaluacion_inquilino_id,
        ei.resultado,
        ei.score_riesgo,
        ei.fecha_evaluacion,
        ei.observaciones
      FROM booking.EvaluacionInquilino ei
      WHERE ei.reserva_id = r.reserva_id
      ORDER BY ei.fecha_evaluacion DESC
    ) evalUltima
    WHERE ${condiciones.join(' AND ')}
    ORDER BY
      CASE 
        WHEN r.estado_reserva = 'SOLICITADA' THEN 1
        WHEN r.estado_reserva = 'APROBADA' THEN 2
        WHEN r.estado_reserva = 'ACTIVA' THEN 3
        WHEN r.estado_reserva = 'RECHAZADA' THEN 4
        WHEN r.estado_reserva = 'CANCELADA' THEN 5
        ELSE 6
      END,
      r.fecha_solicitud DESC;
  `);

  return result.recordset;
};

const obtenerSolicitudGestionPorId = async (usuario_publicador_id, reserva_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT
        r.reserva_id,
        r.inmueble_id,
        r.inquilino_id,
        r.estado_reserva,
        r.fecha_solicitud,
        r.fecha_inicio,
        r.fecha_fin,
        r.renta_pactada_mensual,
        r.moneda,
        r.observacion_inquilino,
        r.observacion_gestor,
        r.motivo_rechazo,
        r.fecha_decision,
        r.gestionado_por_usuario_id,

        r.fecha_checkin,
        r.fecha_checkout,
        r.checkin_confirmado_por,
        r.checkout_confirmado_por,
        r.updated_at,

        i.empresa_id,
        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble,
        i.tipo_inmueble,

        p.publicacion_id,
        p.publicado_por_usuario_id
      FROM booking.Reserva r
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      INNER JOIN catalog.Publicacion p
        ON p.inmueble_id = i.inmueble_id
      WHERE r.reserva_id = @reserva_id
        AND (
          p.publicado_por_usuario_id = @usuario_publicador_id

          OR EXISTS (
            SELECT 1
            FROM core.EmpresaSecretario es
            WHERE es.empresa_id = i.empresa_id
              AND es.secretario_usuario_id = @usuario_publicador_id
              AND es.activo = 1
          )
        )
        AND i.activo = 1
        AND i.deleted_at IS NULL;
    `);

  return result.recordset[0];
};

const buscarConflictosAprobacionReserva = async ({
  empresa_id,
  inmueble_id,
  reserva_id,
  fecha_inicio,
  fecha_fin
}) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('empresa_id', sql.Int, empresa_id)
    .input('inmueble_id', sql.Int, inmueble_id)
    .input('reserva_id', sql.Int, reserva_id)
    .input('fecha_inicio', sql.Date, fecha_inicio)
    .input('fecha_fin', sql.Date, fecha_fin)
    .query(`
      SELECT
        r.reserva_id,
        r.inmueble_id,
        r.estado_reserva,
        r.fecha_inicio,
        r.fecha_fin
      FROM booking.Reserva r
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      WHERE r.inmueble_id = @inmueble_id
        AND r.reserva_id <> @reserva_id
        AND i.empresa_id = @empresa_id
        AND i.activo = 1
        AND i.deleted_at IS NULL
        AND r.estado_reserva IN ('APROBADA', 'ACTIVA')
        AND (
          @fecha_inicio <= r.fecha_fin
          AND @fecha_fin >= r.fecha_inicio
        );
    `);

  return result.recordset;
};

const aprobarSolicitudReservaPorId = async ({
  usuario_publicador_id,
  empresa_id,
  reserva_id,
  gestor_id,
  observacion_gestor
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestActualizar = new sql.Request(transaction);

    const reservaResult = await requestActualizar
      .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
      .input('reserva_id', sql.Int, reserva_id)
      .input('gestor_id', sql.Int, gestor_id)
      .input('observacion_gestor', sql.NVarChar(500), observacion_gestor || null)
      .query(`
        UPDATE r
        SET
          r.estado_reserva = 'APROBADA',
          r.observacion_gestor = @observacion_gestor,
          r.fecha_decision = SYSDATETIME(),
          r.gestionado_por_usuario_id = @gestor_id,
          r.updated_at = SYSDATETIME()
        OUTPUT
          INSERTED.reserva_id,
          INSERTED.inmueble_id,
          INSERTED.inquilino_id,
          INSERTED.estado_reserva,
          INSERTED.fecha_solicitud,
          INSERTED.fecha_inicio,
          INSERTED.fecha_fin,
          INSERTED.renta_pactada_mensual,
          INSERTED.moneda,
          INSERTED.observacion_inquilino,
          INSERTED.observacion_gestor,
          INSERTED.fecha_decision,
          INSERTED.gestionado_por_usuario_id,
          INSERTED.updated_at
        FROM booking.Reserva r
        INNER JOIN catalog.Inmueble i
          ON i.inmueble_id = r.inmueble_id
        INNER JOIN catalog.Publicacion p
          ON p.inmueble_id = i.inmueble_id
        WHERE r.reserva_id = @reserva_id
          AND p.publicado_por_usuario_id = @usuario_publicador_id
          AND r.estado_reserva = 'SOLICITADA'
          AND i.activo = 1
          AND i.deleted_at IS NULL;
              `);

    const reservaAprobada = reservaResult.recordset[0];

    if (!reservaAprobada) {
      await transaction.rollback();
      return null;
    }

    const requestEvento = new sql.Request(transaction);

    await requestEvento
      .input('reserva_id', sql.Int, reservaAprobada.reserva_id)
      .input('usuario_id', sql.Int, gestor_id)
      .input('tipo_evento', sql.NVarChar(30), 'APROBACION')
      .input('descripcion', sql.NVarChar(500), 'El gestor aprobó la solicitud de reserva.')
      .query(`
        INSERT INTO booking.ReservaEvento (
          reserva_id,
          usuario_id,
          tipo_evento,
          descripcion
        )
        VALUES (
          @reserva_id,
          @usuario_id,
          @tipo_evento,
          @descripcion
        );
      `);

    await transaction.commit();

    return reservaAprobada;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const rechazarSolicitudReservaPorId = async ({
  usuario_publicador_id,
  empresa_id,
  reserva_id,
  gestor_id,
  motivo_rechazo,
  observacion_gestor
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestActualizar = new sql.Request(transaction);

    const reservaResult = await requestActualizar
      .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
      .input('reserva_id', sql.Int, reserva_id)
      .input('gestor_id', sql.Int, gestor_id)
      .input('motivo_rechazo', sql.NVarChar(300), motivo_rechazo)
      .input('observacion_gestor', sql.NVarChar(500), observacion_gestor || null)
      .query(`
        UPDATE r
        SET
          r.estado_reserva = 'RECHAZADA',
          r.motivo_rechazo = @motivo_rechazo,
          r.observacion_gestor = @observacion_gestor,
          r.fecha_decision = SYSDATETIME(),
          r.gestionado_por_usuario_id = @gestor_id,
          r.updated_at = SYSDATETIME()
        OUTPUT
          INSERTED.reserva_id,
          INSERTED.inmueble_id,
          INSERTED.inquilino_id,
          INSERTED.estado_reserva,
          INSERTED.fecha_solicitud,
          INSERTED.fecha_inicio,
          INSERTED.fecha_fin,
          INSERTED.renta_pactada_mensual,
          INSERTED.moneda,
          INSERTED.observacion_inquilino,
          INSERTED.observacion_gestor,
          INSERTED.motivo_rechazo,
          INSERTED.fecha_decision,
          INSERTED.gestionado_por_usuario_id,
          INSERTED.updated_at
        FROM booking.Reserva r
          INNER JOIN catalog.Inmueble i
            ON i.inmueble_id = r.inmueble_id
          INNER JOIN catalog.Publicacion p
            ON p.inmueble_id = i.inmueble_id
          WHERE r.reserva_id = @reserva_id
            AND p.publicado_por_usuario_id = @usuario_publicador_id
            AND r.estado_reserva = 'SOLICITADA'
            AND i.activo = 1
            AND i.deleted_at IS NULL;
      `);

    const reservaRechazada = reservaResult.recordset[0];

    if (!reservaRechazada) {
      await transaction.rollback();
      return null;
    }

    const requestEvento = new sql.Request(transaction);

    await requestEvento
      .input('reserva_id', sql.Int, reservaRechazada.reserva_id)
      .input('usuario_id', sql.Int, gestor_id)
      .input('tipo_evento', sql.NVarChar(30), 'RECHAZO')
      .input('descripcion', sql.NVarChar(500), 'El gestor rechazó la solicitud de reserva.')
      .query(`
        INSERT INTO booking.ReservaEvento (
          reserva_id,
          usuario_id,
          tipo_evento,
          descripcion
        )
        VALUES (
          @reserva_id,
          @usuario_id,
          @tipo_evento,
          @descripcion
        );
      `);

    await transaction.commit();

    return reservaRechazada;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const listarEventosReservaGestion = async (usuario_publicador_id, reserva_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT
        e.reserva_evento_id,
        e.reserva_id,
        e.usuario_id,
        e.tipo_evento,
        e.descripcion,
        e.fecha_evento,

        u.correo AS correo_usuario,
        pu.nombres AS nombres_usuario,
        pu.apellidos AS apellidos_usuario
      FROM booking.ReservaEvento e
      INNER JOIN booking.Reserva r
        ON r.reserva_id = e.reserva_id
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      INNER JOIN catalog.Publicacion p
        ON p.inmueble_id = i.inmueble_id
      LEFT JOIN auth.Usuario u
        ON u.usuario_id = e.usuario_id
      LEFT JOIN core.PerfilUsuario pu
        ON pu.usuario_id = e.usuario_id
      WHERE e.reserva_id = @reserva_id
        AND (
          p.publicado_por_usuario_id = @usuario_publicador_id

          OR EXISTS (
            SELECT 1
            FROM core.EmpresaSecretario es
            WHERE es.empresa_id = i.empresa_id
              AND es.secretario_usuario_id = @usuario_publicador_id
              AND es.activo = 1
          )
        )
        AND i.activo = 1
        AND i.deleted_at IS NULL
      ORDER BY e.fecha_evento ASC;
    `);

  return result.recordset;
};

const obtenerSolicitudInquilinoPorId = async (inquilino_id, reserva_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('inquilino_id', sql.Int, inquilino_id)
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT
        r.reserva_id,
        r.inmueble_id,
        r.inquilino_id,
        r.estado_reserva,
        r.fecha_solicitud,
        r.fecha_inicio,
        r.fecha_fin,
        r.renta_pactada_mensual,
        r.monto_total_estimado,
        r.deposito_garantia,
        r.moneda,
        r.observacion_inquilino,
        r.observacion_gestor,
        r.motivo_rechazo,
        r.fecha_decision,
        r.created_at,
        r.updated_at,

        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble,
        i.tipo_inmueble,
        i.subtipo_unidad,
        i.direccion_linea1,
        i.numero,
        i.distrito,
        i.ciudad,
        i.provincia,
        i.departamento,

        p.publicacion_id,
        p.titulo AS titulo_publicacion,
        p.descripcion_corta,
        p.precio_publicado_mensual,

        foto.url_foto AS foto_principal
      FROM booking.Reserva r
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      LEFT JOIN catalog.Publicacion p
        ON p.inmueble_id = i.inmueble_id
      OUTER APPLY (
        SELECT TOP 1
          f.url_foto
        FROM catalog.InmuebleFoto f
        WHERE f.publicacion_id = p.publicacion_id
        ORDER BY
          CASE WHEN f.es_principal = 1 THEN 0 ELSE 1 END,
          f.orden_visual ASC
      ) foto
      WHERE r.reserva_id = @reserva_id
        AND r.inquilino_id = @inquilino_id;
    `);

  return result.recordset[0];
};

const listarEventosReservaInquilino = async (inquilino_id, reserva_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('inquilino_id', sql.Int, inquilino_id)
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT
        e.reserva_evento_id,
        e.reserva_id,
        e.usuario_id,
        e.tipo_evento,
        e.descripcion,
        e.fecha_evento,

        u.correo AS correo_usuario,
        pu.nombres AS nombres_usuario,
        pu.apellidos AS apellidos_usuario
      FROM booking.ReservaEvento e
      INNER JOIN booking.Reserva r
        ON r.reserva_id = e.reserva_id
      LEFT JOIN auth.Usuario u
        ON u.usuario_id = e.usuario_id
      LEFT JOIN core.PerfilUsuario pu
        ON pu.usuario_id = e.usuario_id
      WHERE e.reserva_id = @reserva_id
        AND r.inquilino_id = @inquilino_id
      ORDER BY e.fecha_evento ASC;
    `);

  return result.recordset;
};

const obtenerVettingInquilinoReservaGestion = async (usuario_publicador_id, reserva_id) => {
  const pool = await getConnection();

  const detalleResult = await pool.request()
    .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT
        r.reserva_id,
        r.inmueble_id,
        r.inquilino_id,
        r.estado_reserva,
        r.fecha_solicitud,
        r.fecha_inicio,
        r.fecha_fin,
        r.renta_pactada_mensual,
        r.monto_total_estimado,
        r.deposito_garantia,
        r.moneda,
        r.observacion_inquilino,
        r.observacion_gestor,
        r.motivo_rechazo,
        r.fecha_decision,

        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble,
        i.tipo_inmueble,
        i.subtipo_unidad,
        i.direccion_linea1,
        i.numero,
        i.distrito,
        i.ciudad,
        i.provincia,
        i.departamento,

        p.publicacion_id,
        p.titulo AS titulo_publicacion,
        p.precio_publicado_mensual,
        p.publicado_por_usuario_id,

        u.usuario_id AS usuario_inquilino_id,
        u.correo AS correo_inquilino,
        u.estado AS estado_usuario_inquilino,
        u.email_verificado,

        pu.perfil_usuario_id,
        pu.nombres AS nombres_inquilino,
        pu.apellidos AS apellidos_inquilino,
        pu.tipo_documento,
        pu.numero_documento,
        pu.telefono,
        pu.fecha_nacimiento,
        pu.sexo,
        pu.foto_url,
        pu.biografia,
        pu.direccion AS direccion_inquilino,
        pu.distrito AS distrito_inquilino,
        pu.ciudad AS ciudad_inquilino,
        pu.pais AS pais_inquilino,

        pu.ingreso_mensual_referencial,
        pu.tiene_aval_bancario,
        pu.tiene_contrato_trabajo,
        pu.tiene_garante,
        pu.nombre_garante,
        pu.contacto_garante
      FROM booking.Reserva r
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      INNER JOIN catalog.Publicacion p
        ON p.inmueble_id = i.inmueble_id
      INNER JOIN auth.Usuario u
        ON u.usuario_id = r.inquilino_id
      LEFT JOIN core.PerfilUsuario pu
        ON pu.usuario_id = r.inquilino_id
      WHERE r.reserva_id = @reserva_id
        AND p.publicado_por_usuario_id = @usuario_publicador_id
        AND i.activo = 1
        AND i.deleted_at IS NULL;
    `);

  const solicitud = detalleResult.recordset[0];

  if (!solicitud) {
    return null;
  }

  const resumenHistorialResult = await pool.request()
    .input('inquilino_id', sql.Int, solicitud.inquilino_id)
    .query(`
      SELECT
        COUNT(*) AS total_solicitudes,
        SUM(CASE WHEN estado_reserva = 'SOLICITADA' THEN 1 ELSE 0 END) AS total_solicitadas,
        SUM(CASE WHEN estado_reserva = 'APROBADA' THEN 1 ELSE 0 END) AS total_aprobadas,
        SUM(CASE WHEN estado_reserva = 'RECHAZADA' THEN 1 ELSE 0 END) AS total_rechazadas,
        SUM(CASE WHEN estado_reserva = 'CANCELADA' THEN 1 ELSE 0 END) AS total_canceladas,
        SUM(CASE WHEN estado_reserva = 'ACTIVA' THEN 1 ELSE 0 END) AS total_activas,
        SUM(CASE WHEN estado_reserva = 'FINALIZADA' THEN 1 ELSE 0 END) AS total_finalizadas,
        MAX(fecha_solicitud) AS ultima_solicitud
      FROM booking.Reserva
      WHERE inquilino_id = @inquilino_id;
    `);

  const historialReservasResult = await pool.request()
    .input('inquilino_id', sql.Int, solicitud.inquilino_id)
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT TOP 10
        r.reserva_id,
        r.estado_reserva,
        r.fecha_solicitud,
        r.fecha_inicio,
        r.fecha_fin,
        r.renta_pactada_mensual,
        r.moneda,

        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble,
        i.tipo_inmueble,

        p.publicacion_id,
        p.titulo AS titulo_publicacion
      FROM booking.Reserva r
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      LEFT JOIN catalog.Publicacion p
        ON p.inmueble_id = i.inmueble_id
      WHERE r.inquilino_id = @inquilino_id
        AND r.reserva_id <> @reserva_id
      ORDER BY r.fecha_solicitud DESC;
    `);

  const evaluacionResult = await pool.request()
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT TOP 1
        ei.evaluacion_inquilino_id,
        ei.reserva_id,
        ei.evaluado_por_usuario_id,
        ei.score_riesgo,
        ei.historial_reservas,
        ei.observaciones,
        ei.resultado,
        ei.fecha_evaluacion,

        u.correo AS correo_evaluador,
        pu.nombres AS nombres_evaluador,
        pu.apellidos AS apellidos_evaluador
      FROM booking.EvaluacionInquilino ei
      LEFT JOIN auth.Usuario u
        ON u.usuario_id = ei.evaluado_por_usuario_id
      LEFT JOIN core.PerfilUsuario pu
        ON pu.usuario_id = ei.evaluado_por_usuario_id
      WHERE ei.reserva_id = @reserva_id
      ORDER BY ei.fecha_evaluacion DESC;
    `);

  return {
    solicitud,
    resumen_historial: resumenHistorialResult.recordset[0],
    historial_reservas: historialReservasResult.recordset,
    evaluacion_inquilino: evaluacionResult.recordset[0] || null
  };
};

const registrarEvaluacionInquilinoReservaGestion = async ({
  reserva_id,
  evaluado_por_usuario_id,
  score_riesgo,
  historial_reservas,
  observaciones,
  resultado
}) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('reserva_id', sql.Int, reserva_id)
    .input('evaluado_por_usuario_id', sql.Int, evaluado_por_usuario_id)
    .input('score_riesgo', sql.Int, score_riesgo)
    .input('historial_reservas', sql.Int, historial_reservas)
    .input('observaciones', sql.NVarChar(500), observaciones || null)
    .input('resultado', sql.NVarChar(20), resultado)
    .query(`
      INSERT INTO booking.EvaluacionInquilino (
        reserva_id,
        evaluado_por_usuario_id,
        score_riesgo,
        historial_reservas,
        observaciones,
        resultado
      )
      OUTPUT
        INSERTED.evaluacion_inquilino_id,
        INSERTED.reserva_id,
        INSERTED.evaluado_por_usuario_id,
        INSERTED.score_riesgo,
        INSERTED.historial_reservas,
        INSERTED.observaciones,
        INSERTED.resultado,
        INSERTED.fecha_evaluacion
      VALUES (
        @reserva_id,
        @evaluado_por_usuario_id,
        @score_riesgo,
        @historial_reservas,
        @observaciones,
        @resultado
      );
    `);

  return result.recordset[0];
};

const obtenerUltimaEvaluacionInquilinoPorReserva = async (reserva_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT TOP 1
        evaluacion_inquilino_id,
        reserva_id,
        evaluado_por_usuario_id,
        score_riesgo,
        historial_reservas,
        observaciones,
        resultado,
        fecha_evaluacion
      FROM booking.EvaluacionInquilino
      WHERE reserva_id = @reserva_id
      ORDER BY fecha_evaluacion DESC;
    `);

  return result.recordset[0] || null;
};

const registrarEventoReservaSimple = async ({
  reserva_id,
  usuario_id,
  tipo_evento,
  descripcion
}) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('reserva_id', sql.Int, reserva_id)
    .input('usuario_id', sql.Int, usuario_id)
    .input('tipo_evento', sql.NVarChar(30), tipo_evento)
    .input('descripcion', sql.NVarChar(500), descripcion)
    .query(`
      INSERT INTO booking.ReservaEvento (
        reserva_id,
        usuario_id,
        tipo_evento,
        descripcion
      )
      OUTPUT
        INSERTED.reserva_evento_id,
        INSERTED.reserva_id,
        INSERTED.usuario_id,
        INSERTED.tipo_evento,
        INSERTED.descripcion,
        INSERTED.fecha_evento
      VALUES (
        @reserva_id,
        @usuario_id,
        @tipo_evento,
        @descripcion
      );
    `);

  return result.recordset[0];
};

const listarEvaluacionesInquilinoReservaGestion = async (
  usuario_publicador_id,
  reserva_id
) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
    .input('reserva_id', sql.Int, reserva_id)
    .query(`
      SELECT
        ei.evaluacion_inquilino_id,
        ei.reserva_id,
        ei.evaluado_por_usuario_id,
        ei.score_riesgo,
        ei.historial_reservas,
        ei.observaciones,
        ei.resultado,
        ei.fecha_evaluacion,

        u.correo AS correo_evaluador,
        pu.nombres AS nombres_evaluador,
        pu.apellidos AS apellidos_evaluador
      FROM booking.EvaluacionInquilino ei
      INNER JOIN booking.Reserva r
        ON r.reserva_id = ei.reserva_id
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = r.inmueble_id
      INNER JOIN catalog.Publicacion p
        ON p.inmueble_id = i.inmueble_id
      LEFT JOIN auth.Usuario u
        ON u.usuario_id = ei.evaluado_por_usuario_id
      LEFT JOIN core.PerfilUsuario pu
        ON pu.usuario_id = ei.evaluado_por_usuario_id
      WHERE ei.reserva_id = @reserva_id
        AND p.publicado_por_usuario_id = @usuario_publicador_id
        AND i.activo = 1
        AND i.deleted_at IS NULL
      ORDER BY ei.fecha_evaluacion DESC;
    `);

  return result.recordset;
};

const registrarEvaluacionConEventoReservaGestion = async ({
  reserva_id,
  evaluado_por_usuario_id,
  score_riesgo,
  historial_reservas,
  observaciones,
  resultado,
  descripcion_evento
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestEvaluacion = new sql.Request(transaction);

    const evaluacionResult = await requestEvaluacion
      .input('reserva_id', sql.Int, reserva_id)
      .input('evaluado_por_usuario_id', sql.Int, evaluado_por_usuario_id)
      .input('score_riesgo', sql.Int, score_riesgo)
      .input('historial_reservas', sql.Int, historial_reservas)
      .input('observaciones', sql.NVarChar(500), observaciones || null)
      .input('resultado', sql.NVarChar(20), resultado)
      .query(`
        INSERT INTO booking.EvaluacionInquilino (
          reserva_id,
          evaluado_por_usuario_id,
          score_riesgo,
          historial_reservas,
          observaciones,
          resultado
        )
        OUTPUT
          INSERTED.evaluacion_inquilino_id,
          INSERTED.reserva_id,
          INSERTED.evaluado_por_usuario_id,
          INSERTED.score_riesgo,
          INSERTED.historial_reservas,
          INSERTED.observaciones,
          INSERTED.resultado,
          INSERTED.fecha_evaluacion
        VALUES (
          @reserva_id,
          @evaluado_por_usuario_id,
          @score_riesgo,
          @historial_reservas,
          @observaciones,
          @resultado
        );
      `);

    const evaluacion = evaluacionResult.recordset[0];

    const requestEvento = new sql.Request(transaction);

    const eventoResult = await requestEvento
      .input('reserva_id', sql.Int, reserva_id)
      .input('usuario_id', sql.Int, evaluado_por_usuario_id)
      .input('tipo_evento', sql.NVarChar(30), 'NOTA')
      .input('descripcion', sql.NVarChar(500), descripcion_evento)
      .query(`
        INSERT INTO booking.ReservaEvento (
          reserva_id,
          usuario_id,
          tipo_evento,
          descripcion
        )
        OUTPUT
          INSERTED.reserva_evento_id,
          INSERTED.reserva_id,
          INSERTED.usuario_id,
          INSERTED.tipo_evento,
          INSERTED.descripcion,
          INSERTED.fecha_evento
        VALUES (
          @reserva_id,
          @usuario_id,
          @tipo_evento,
          @descripcion
        );
      `);

    const evento = eventoResult.recordset[0];

    await transaction.commit();

    return {
      evaluacion,
      evento
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const confirmarCheckinReservaGestion = async ({
  usuario_publicador_id,
  reserva_id,
  gestor_id
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestActualizarReserva = new sql.Request(transaction);

    const reservaResult = await requestActualizarReserva
      .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
      .input('reserva_id', sql.Int, reserva_id)
      .input('gestor_id', sql.Int, gestor_id)
      .query(`
        UPDATE r
        SET
          r.estado_reserva = 'ACTIVA',
          r.fecha_checkin = SYSDATETIME(),
          r.checkin_confirmado_por = @gestor_id,
          r.updated_at = SYSDATETIME()
        OUTPUT
          INSERTED.reserva_id,
          INSERTED.inmueble_id,
          INSERTED.inquilino_id,
          INSERTED.estado_reserva,
          INSERTED.fecha_solicitud,
          INSERTED.fecha_inicio,
          INSERTED.fecha_fin,
          INSERTED.renta_pactada_mensual,
          INSERTED.moneda,
          INSERTED.fecha_checkin,
          INSERTED.checkin_confirmado_por,
          INSERTED.updated_at
        FROM booking.Reserva r
        INNER JOIN catalog.Inmueble i
          ON i.inmueble_id = r.inmueble_id
        INNER JOIN catalog.Publicacion p
          ON p.inmueble_id = i.inmueble_id
        WHERE r.reserva_id = @reserva_id
          AND (
            p.publicado_por_usuario_id = @usuario_publicador_id

            OR EXISTS (
              SELECT 1
              FROM core.EmpresaSecretario es
              WHERE es.empresa_id = i.empresa_id
                AND es.secretario_usuario_id = @usuario_publicador_id
                AND es.activo = 1
            )
          )
          AND r.estado_reserva = 'APROBADA'
          AND i.activo = 1
          AND i.deleted_at IS NULL;
      `);

    const reservaActualizada = reservaResult.recordset[0];

    if (!reservaActualizada) {
      await transaction.rollback();
      return null;
    }

    const requestActualizarInmueble = new sql.Request(transaction);

    await requestActualizarInmueble
      .input('inmueble_id', sql.Int, reservaActualizada.inmueble_id)
      .query(`
        UPDATE catalog.Inmueble
        SET
          estado_operativo = 'OCUPADO',
          updated_at = SYSDATETIME()
        WHERE inmueble_id = @inmueble_id;
      `);

    const requestEvento = new sql.Request(transaction);

    const eventoResult = await requestEvento
      .input('reserva_id', sql.Int, reservaActualizada.reserva_id)
      .input('usuario_id', sql.Int, gestor_id)
      .input('tipo_evento', sql.NVarChar(30), 'CHECKIN')
      .input('descripcion', sql.NVarChar(500), 'El gestor confirmó el check-in del inquilino.')
      .query(`
        INSERT INTO booking.ReservaEvento (
          reserva_id,
          usuario_id,
          tipo_evento,
          descripcion
        )
        OUTPUT
          INSERTED.reserva_evento_id,
          INSERTED.reserva_id,
          INSERTED.usuario_id,
          INSERTED.tipo_evento,
          INSERTED.descripcion,
          INSERTED.fecha_evento
        VALUES (
          @reserva_id,
          @usuario_id,
          @tipo_evento,
          @descripcion
        );
      `);

    await transaction.commit();

    return {
      reserva: reservaActualizada,
      evento: eventoResult.recordset[0]
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const confirmarCheckoutReservaGestion = async ({
  usuario_publicador_id,
  reserva_id,
  gestor_id
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestActualizarReserva = new sql.Request(transaction);

    const reservaResult = await requestActualizarReserva
      .input('usuario_publicador_id', sql.Int, usuario_publicador_id)
      .input('reserva_id', sql.Int, reserva_id)
      .input('gestor_id', sql.Int, gestor_id)
      .query(`
        UPDATE r
        SET
          r.estado_reserva = 'FINALIZADA',
          r.fecha_checkout = SYSDATETIME(),
          r.checkout_confirmado_por = @gestor_id,
          r.updated_at = SYSDATETIME()
        OUTPUT
          INSERTED.reserva_id,
          INSERTED.inmueble_id,
          INSERTED.inquilino_id,
          INSERTED.estado_reserva,
          INSERTED.fecha_solicitud,
          INSERTED.fecha_inicio,
          INSERTED.fecha_fin,
          INSERTED.renta_pactada_mensual,
          INSERTED.moneda,
          INSERTED.fecha_checkin,
          INSERTED.fecha_checkout,
          INSERTED.checkin_confirmado_por,
          INSERTED.checkout_confirmado_por,
          INSERTED.updated_at
        FROM booking.Reserva r
        INNER JOIN catalog.Inmueble i
          ON i.inmueble_id = r.inmueble_id
        INNER JOIN catalog.Publicacion p
          ON p.inmueble_id = i.inmueble_id
        WHERE r.reserva_id = @reserva_id
          AND (
            p.publicado_por_usuario_id = @usuario_publicador_id

            OR EXISTS (
              SELECT 1
              FROM core.EmpresaSecretario es
              WHERE es.empresa_id = i.empresa_id
                AND es.secretario_usuario_id = @usuario_publicador_id
                AND es.activo = 1
            )
          )
          AND r.estado_reserva = 'ACTIVA'
          AND i.activo = 1
          AND i.deleted_at IS NULL;
      `);

    const reservaActualizada = reservaResult.recordset[0];

    if (!reservaActualizada) {
      await transaction.rollback();
      return null;
    }

    const requestActualizarInmueble = new sql.Request(transaction);

    await requestActualizarInmueble
      .input('inmueble_id', sql.Int, reservaActualizada.inmueble_id)
      .query(`
        UPDATE catalog.Inmueble
        SET
          estado_operativo = 'DISPONIBLE',
          updated_at = SYSDATETIME()
        WHERE inmueble_id = @inmueble_id;
      `);

    const requestEvento = new sql.Request(transaction);

    const eventoResult = await requestEvento
      .input('reserva_id', sql.Int, reservaActualizada.reserva_id)
      .input('usuario_id', sql.Int, gestor_id)
      .input('tipo_evento', sql.NVarChar(30), 'CHECKOUT')
      .input('descripcion', sql.NVarChar(500), 'El gestor confirmó el check-out del inquilino.')
      .query(`
        INSERT INTO booking.ReservaEvento (
          reserva_id,
          usuario_id,
          tipo_evento,
          descripcion
        )
        OUTPUT
          INSERTED.reserva_evento_id,
          INSERTED.reserva_id,
          INSERTED.usuario_id,
          INSERTED.tipo_evento,
          INSERTED.descripcion,
          INSERTED.fecha_evento
        VALUES (
          @reserva_id,
          @usuario_id,
          @tipo_evento,
          @descripcion
        );
      `);

    await transaction.commit();

    return {
      reserva: reservaActualizada,
      evento: eventoResult.recordset[0]
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
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
  listarEventosReservaInquilino,
  obtenerVettingInquilinoReservaGestion,
  registrarEvaluacionInquilinoReservaGestion,
  obtenerUltimaEvaluacionInquilinoPorReserva,
  registrarEventoReservaSimple,
  listarEvaluacionesInquilinoReservaGestion,
  registrarEvaluacionConEventoReservaGestion,
  confirmarCheckinReservaGestion,
  confirmarCheckoutReservaGestion
};