const { getConnection, sql } = require('../config/db');

const listarRecibosPendientesInquilino = async (empresa_id, usuario_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_id', sql.Int, usuario_id)
    .query(`
      SELECT
        r.recibo_id,
        r.reserva_id,
        r.periodo_anio,
        r.periodo_mes,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.estado_recibo,
        r.subtotal,
        r.igv_total,
        r.total,
        r.saldo_pendiente,
        r.pdf_url,
        r.observaciones,

        i.inmueble_id,
        i.empresa_id,
        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble,
        i.direccion_linea1,
        i.distrito,
        i.ciudad,

        cc.numero_recibo_base,

        pu.nombres AS nombres_inquilino,
        pu.apellidos AS apellidos_inquilino
      FROM finance.Recibo r
      INNER JOIN finance.CuentaCobroInmueble cc
        ON cc.cuenta_cobro_inmueble_id = r.cuenta_cobro_inmueble_id
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = cc.inmueble_id
      INNER JOIN booking.Reserva res
        ON res.reserva_id = r.reserva_id
      LEFT JOIN core.PerfilUsuario pu
        ON pu.usuario_id = res.inquilino_id
      WHERE res.inquilino_id = @usuario_id
        AND r.estado_recibo IN ('EMITIDO', 'PARCIAL', 'VENCIDO')
        AND r.saldo_pendiente > 0
      ORDER BY r.fecha_vencimiento ASC, r.recibo_id DESC;
    `);

  return result.recordset;
};

const obtenerReciboPendienteParaPago = async (empresa_id, usuario_id, recibo_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_id', sql.Int, usuario_id)
    .input('recibo_id', sql.Int, recibo_id)
    .query(`
      SELECT
        r.recibo_id,
        r.reserva_id,
        r.estado_recibo,
        r.total,
        r.saldo_pendiente,
        COALESCE(res.moneda, i.moneda, 'PEN') AS moneda,
        r.periodo_anio,
        r.periodo_mes,

        i.inmueble_id,
        i.empresa_id,
        i.nombre AS nombre_inmueble,

        res.inquilino_id
      FROM finance.Recibo r
      INNER JOIN finance.CuentaCobroInmueble cc
        ON cc.cuenta_cobro_inmueble_id = r.cuenta_cobro_inmueble_id
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = cc.inmueble_id
      INNER JOIN booking.Reserva res
        ON res.reserva_id = r.reserva_id
      WHERE r.recibo_id = @recibo_id
        AND res.inquilino_id = @usuario_id;
    `);

  return result.recordset[0];
};

const registrarPagoOnline = async ({
  empresa_id,
  usuario_id,
  recibo_id,
  metodo_pago = 'ONLINE',
  proveedor_pasarela = 'SIMULADO',
  referencia = null
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const metodoPagoNormalizado = String(metodo_pago).trim().toUpperCase();

    const metodosPermitidos = [
      'ONLINE',
      'TARJETA',
      'TRANSFERENCIA',
      'EFECTIVO'
    ];

    if (!metodosPermitidos.includes(metodoPagoNormalizado)) {
      await transaction.rollback();

      return {
        ok: false,
        status: 400,
        mensaje: 'Método de pago no válido.'
      };
    }

    const requestRecibo = new sql.Request(transaction);

    const reciboResult = await requestRecibo
      .input('usuario_id', sql.Int, usuario_id)
      .input('recibo_id', sql.Int, recibo_id)
      .query(`
        SELECT
          r.recibo_id,
          r.reserva_id,
          r.estado_recibo,
          r.total,
          r.saldo_pendiente,
          COALESCE(res.moneda, i.moneda, 'PEN') AS moneda,
          i.empresa_id,
          res.inquilino_id
        FROM finance.Recibo r WITH (UPDLOCK, ROWLOCK)
        INNER JOIN finance.CuentaCobroInmueble cc
          ON cc.cuenta_cobro_inmueble_id = r.cuenta_cobro_inmueble_id
        INNER JOIN catalog.Inmueble i
          ON i.inmueble_id = cc.inmueble_id
        INNER JOIN booking.Reserva res
          ON res.reserva_id = r.reserva_id
        WHERE r.recibo_id = @recibo_id
          AND res.inquilino_id = @usuario_id;
      `);

    const recibo = reciboResult.recordset[0];

    if (!recibo) {
      await transaction.rollback();

      return {
        ok: false,
        status: 404,
        mensaje: 'Recibo no encontrado o no pertenece al inquilino.'
      };
    }

    if (recibo.estado_recibo === 'ANULADO') {
      await transaction.rollback();

      return {
        ok: false,
        status: 400,
        mensaje: 'No se puede pagar un recibo anulado.'
      };
    }

    if (recibo.estado_recibo === 'PAGADO' || Number(recibo.saldo_pendiente) <= 0) {
      await transaction.rollback();

      return {
        ok: false,
        status: 400,
        mensaje: 'Este recibo ya se encuentra pagado.'
      };
    }

    const montoPago = Number(recibo.saldo_pendiente);
    const transaccionExterna = `SIM-${metodoPagoNormalizado}-${Date.now()}-${recibo_id}`;

    const proveedorPasarelaFinal =
      metodoPagoNormalizado === 'ONLINE' || metodoPagoNormalizado === 'TARJETA'
        ? proveedor_pasarela || 'SIMULADO'
        : null;

    const observacionesPago =
      metodoPagoNormalizado === 'ONLINE'
        ? 'Pago online simulado confirmado correctamente.'
        : metodoPagoNormalizado === 'TARJETA'
          ? 'Pago con tarjeta simulado confirmado correctamente.'
          : metodoPagoNormalizado === 'TRANSFERENCIA'
            ? 'Pago por transferencia registrado como confirmado.'
            : 'Pago en efectivo registrado como confirmado.';

    const requestPago = new sql.Request(transaction);

    const pagoResult = await requestPago
      .input('recibo_id', sql.Int, recibo.recibo_id)
      .input('reserva_id', sql.Int, recibo.reserva_id)
      .input('usuario_pagador_id', sql.Int, usuario_id)
      .input('metodo_pago', sql.NVarChar(20), metodoPagoNormalizado)
      .input('proveedor_pasarela', sql.NVarChar(100), proveedorPasarelaFinal)
      .input('transaccion_externa', sql.NVarChar(150), transaccionExterna)
      .input('referencia', sql.NVarChar(150), referencia)
      .input('monto', sql.Decimal(12, 2), montoPago)
      .input('moneda', sql.Char(3), recibo.moneda || 'PEN')
      .input('estado_pago', sql.NVarChar(20), 'CONFIRMADO')
      .input('observaciones', sql.NVarChar(500), observacionesPago)
      .query(`
        INSERT INTO finance.Pago (
          recibo_id,
          reserva_id,
          usuario_pagador_id,
          metodo_pago,
          proveedor_pasarela,
          transaccion_externa,
          referencia,
          monto,
          moneda,
          estado_pago,
          fecha_pago,
          fecha_confirmacion,
          observaciones
        )
        OUTPUT INSERTED.*
        VALUES (
          @recibo_id,
          @reserva_id,
          @usuario_pagador_id,
          @metodo_pago,
          @proveedor_pasarela,
          @transaccion_externa,
          @referencia,
          @monto,
          @moneda,
          @estado_pago,
          SYSDATETIME(),
          SYSDATETIME(),
          @observaciones
        );
      `);

    const pago = pagoResult.recordset[0];

    const requestUpdate = new sql.Request(transaction);

    await requestUpdate
      .input('recibo_id', sql.Int, recibo.recibo_id)
      .query(`
        UPDATE finance.Recibo
        SET
          estado_recibo = 'PAGADO',
          saldo_pendiente = 0,
          updated_at = SYSDATETIME()
        WHERE recibo_id = @recibo_id;
      `);

    await transaction.commit();

    return {
      ok: true,
      pago,
      monto_pagado: montoPago
    };

  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error('Error haciendo rollback del pago:', rollbackError);
    }

    console.error('Error registrando pago:', error);

    return {
      ok: false,
      status: 500,
      mensaje: 'Error interno al procesar el pago.'
    };
  }
};

const listarMisPagos = async (empresa_id, usuario_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_id', sql.Int, usuario_id)
    .query(`
      SELECT
        p.pago_id,
        p.recibo_id,
        p.reserva_id,
        p.metodo_pago,
        p.proveedor_pasarela,
        p.transaccion_externa,
        p.referencia,
        p.monto,
        p.moneda,
        p.estado_pago,
        p.fecha_pago,
        p.fecha_confirmacion,
        p.observaciones,

        r.periodo_anio,
        r.periodo_mes,
        r.estado_recibo,

        i.inmueble_id,
        i.empresa_id,
        i.codigo AS codigo_inmueble,
        i.nombre AS nombre_inmueble
      FROM finance.Pago p
      INNER JOIN finance.Recibo r
        ON r.recibo_id = p.recibo_id
      INNER JOIN finance.CuentaCobroInmueble cc
        ON cc.cuenta_cobro_inmueble_id = r.cuenta_cobro_inmueble_id
      INNER JOIN catalog.Inmueble i
        ON i.inmueble_id = cc.inmueble_id
      INNER JOIN booking.Reserva res
        ON res.reserva_id = r.reserva_id
      WHERE res.inquilino_id = @usuario_id
      ORDER BY p.fecha_pago DESC;
    `);

  return result.recordset;
};

const generarReciboPendientePrueba = async ({
  empresa_id,
  usuario_id,
  reserva_id,
  monto = null,
  periodo_anio = null,
  periodo_mes = null,
  fecha_vencimiento = null
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestReserva = new sql.Request(transaction);

    const reservaResult = await requestReserva
      .input('usuario_id', sql.Int, usuario_id)
      .input('reserva_id', sql.Int, reserva_id)
      .query(`
        SELECT
          r.reserva_id,
          r.inmueble_id,
          r.inquilino_id,
          r.estado_reserva,
          r.renta_pactada_mensual,
          r.moneda AS moneda_reserva,
          i.nombre AS nombre_inmueble,
          i.renta_base_mensual,
          i.moneda AS moneda_inmueble
        FROM booking.Reserva r
        INNER JOIN catalog.Inmueble i
          ON i.inmueble_id = r.inmueble_id
        WHERE r.reserva_id = @reserva_id
          AND r.inquilino_id = @usuario_id
          AND r.estado_reserva IN ('APROBADA', 'ACTIVA');
      `);

    const reserva = reservaResult.recordset[0];

    if (!reserva) {
      await transaction.rollback();

      return {
        ok: false,
        status: 404,
        mensaje: 'No existe una reserva APROBADA o ACTIVA para este inquilino.'
      };
    }

    const montoRecibo = Number(
      monto ||
      reserva.renta_pactada_mensual ||
      reserva.renta_base_mensual ||
      1000
    );

    if (montoRecibo <= 0) {
      await transaction.rollback();

      return {
        ok: false,
        status: 400,
        mensaje: 'El monto del recibo debe ser mayor a 0.'
      };
    }

    const requestCuenta = new sql.Request(transaction);

    const cuentaResult = await requestCuenta
      .input('inmueble_id', sql.Int, reserva.inmueble_id)
      .query(`
        SELECT TOP 1
          cuenta_cobro_inmueble_id
        FROM finance.CuentaCobroInmueble
        WHERE inmueble_id = @inmueble_id
          AND activo = 1;
      `);

    let cuenta_cobro_inmueble_id = cuentaResult.recordset[0]?.cuenta_cobro_inmueble_id;

    if (!cuenta_cobro_inmueble_id) {
      const requestCrearCuenta = new sql.Request(transaction);

      const crearCuentaResult = await requestCrearCuenta
        .input('inmueble_id', sql.Int, reserva.inmueble_id)
        .input('numero_recibo_base', sql.NVarChar(50), `RC-${reserva.inmueble_id}-${Date.now()}`)
        .query(`
          INSERT INTO finance.CuentaCobroInmueble (
            inmueble_id,
            numero_recibo_base,
            dia_vencimiento,
            activo
          )
          OUTPUT INSERTED.cuenta_cobro_inmueble_id
          VALUES (
            @inmueble_id,
            @numero_recibo_base,
            5,
            1
          );
        `);

      cuenta_cobro_inmueble_id = crearCuentaResult.recordset[0].cuenta_cobro_inmueble_id;
    }

    const fechaActual = new Date();

    let anio = periodo_anio ? Number(periodo_anio) : fechaActual.getFullYear();
    let mes = periodo_mes ? Number(periodo_mes) : fechaActual.getMonth() + 1;

    if (mes < 1 || mes > 12) {
      await transaction.rollback();

      return {
        ok: false,
        status: 400,
        mensaje: 'El periodo_mes debe estar entre 1 y 12.'
      };
    }

    let intentos = 0;

    while (intentos < 24) {
      const requestExiste = new sql.Request(transaction);

      const existeResult = await requestExiste
        .input('cuenta_cobro_inmueble_id', sql.Int, cuenta_cobro_inmueble_id)
        .input('periodo_anio', sql.Int, anio)
        .input('periodo_mes', sql.TinyInt, mes)
        .query(`
          SELECT TOP 1 recibo_id
          FROM finance.Recibo
          WHERE cuenta_cobro_inmueble_id = @cuenta_cobro_inmueble_id
            AND periodo_anio = @periodo_anio
            AND periodo_mes = @periodo_mes;
        `);

      if (existeResult.recordset.length === 0) {
        break;
      }

      mes++;

      if (mes > 12) {
        mes = 1;
        anio++;
      }

      intentos++;
    }

    if (intentos >= 24) {
      await transaction.rollback();

      return {
        ok: false,
        status: 400,
        mensaje: 'No se pudo encontrar un periodo disponible para generar el recibo.'
      };
    }

    const fechaVencimientoFinal = fecha_vencimiento
      ? new Date(fecha_vencimiento)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const requestRecibo = new sql.Request(transaction);

    const reciboResult = await requestRecibo
      .input('cuenta_cobro_inmueble_id', sql.Int, cuenta_cobro_inmueble_id)
      .input('reserva_id', sql.Int, reserva.reserva_id)
      .input('periodo_anio', sql.Int, anio)
      .input('periodo_mes', sql.TinyInt, mes)
      .input('fecha_vencimiento', sql.Date, fechaVencimientoFinal)
      .input('subtotal', sql.Decimal(12, 2), montoRecibo)
      .input('igv_total', sql.Decimal(12, 2), 0)
      .input('total', sql.Decimal(12, 2), montoRecibo)
      .input('saldo_pendiente', sql.Decimal(12, 2), montoRecibo)
      .input('observaciones', sql.NVarChar(500), 'Recibo generado desde Yaak para prueba de HU16.')
      .query(`
        INSERT INTO finance.Recibo (
          cuenta_cobro_inmueble_id,
          reserva_id,
          periodo_anio,
          periodo_mes,
          fecha_emision,
          fecha_vencimiento,
          estado_recibo,
          subtotal,
          igv_total,
          total,
          saldo_pendiente,
          observaciones
        )
        OUTPUT INSERTED.*
        VALUES (
          @cuenta_cobro_inmueble_id,
          @reserva_id,
          @periodo_anio,
          @periodo_mes,
          CAST(SYSDATETIME() AS DATE),
          @fecha_vencimiento,
          'EMITIDO',
          @subtotal,
          @igv_total,
          @total,
          @saldo_pendiente,
          @observaciones
        );
      `);

    await transaction.commit();

    return {
      ok: true,
      recibo: reciboResult.recordset[0]
    };

  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error('Error haciendo rollback al generar recibo:', rollbackError);
    }

    console.error('Error generando recibo de prueba:', error);

    return {
      ok: false,
      status: 500,
      mensaje: 'Error interno al generar el recibo de prueba.'
    };
  }
};

module.exports = {
  listarRecibosPendientesInquilino,
  obtenerReciboPendienteParaPago,
  registrarPagoOnline,
  listarMisPagos,
  generarReciboPendientePrueba
};