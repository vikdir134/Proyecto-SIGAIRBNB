/* =========================================================
   BASE DE DATOS: SistemaIntegralGestionAirbnb
   Motor       : SQL Server
   Enfoque     : Modelamiento completo (DDL)
   ========================================================= */

IF DB_ID('SistemaIntegralGestionAirbnb') IS NULL
BEGIN
    CREATE DATABASE SistemaIntegralGestionAirbnb;
END;
GO

USE SistemaIntegralGestionAirbnb;
GO

/* =========================================================
   SCHEMAS
   ========================================================= */
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'core')     EXEC('CREATE SCHEMA core');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'auth')     EXEC('CREATE SCHEMA auth');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'catalog')  EXEC('CREATE SCHEMA catalog');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'booking')  EXEC('CREATE SCHEMA booking');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'finance')  EXEC('CREATE SCHEMA finance');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'reporting') EXEC('CREATE SCHEMA reporting');
GO

/* =========================================================
   CORE
   ========================================================= */

-- Empresa administradora / propietaria
CREATE TABLE core.Empresa
(
    empresa_id              INT IDENTITY(1,1) PRIMARY KEY,
    razon_social            NVARCHAR(200) NOT NULL,
    nombre_comercial        NVARCHAR(200) NULL,
    ruc                     NVARCHAR(20) NULL,
    correo_contacto         NVARCHAR(255) NULL,
    telefono_contacto       NVARCHAR(30) NULL,
    direccion_fiscal        NVARCHAR(255) NULL,
    ciudad                  NVARCHAR(100) NULL,
    pais                    NVARCHAR(100) NOT NULL DEFAULT 'Perú',
    moneda_base             CHAR(3) NOT NULL DEFAULT 'PEN',
    activo                  BIT NOT NULL DEFAULT 1,
    created_at              DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at              DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    deleted_at              DATETIME2 NULL
);
GO

/* =========================================================
   AUTH
   ========================================================= */

-- Roles del sistema
CREATE TABLE auth.Rol
(
    rol_id                  INT IDENTITY(1,1) PRIMARY KEY,
    nombre                  NVARCHAR(50) NOT NULL,
    descripcion             NVARCHAR(200) NULL,
    activo                  BIT NOT NULL DEFAULT 1,
    created_at              DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Rol_Nombre UNIQUE (nombre)
);
GO

-- Usuarios del sistema
CREATE TABLE auth.Usuario
(
    usuario_id              INT IDENTITY(1,1) PRIMARY KEY,
    empresa_id              INT NOT NULL,
    correo                  NVARCHAR(255) NOT NULL,
    password_hash           NVARCHAR(255) NOT NULL,
    estado                  NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    email_verificado        BIT NOT NULL DEFAULT 0,
    ultimo_acceso           DATETIME2 NULL,
    acepta_terminos         BIT NOT NULL DEFAULT 0,
    activo                  BIT NOT NULL DEFAULT 1,
    created_at              DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at              DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    deleted_at              DATETIME2 NULL,
    CONSTRAINT FK_Usuario_Empresa FOREIGN KEY (empresa_id) REFERENCES core.Empresa(empresa_id),
    CONSTRAINT UQ_Usuario_Correo UNIQUE (correo),
    CONSTRAINT CK_Usuario_Estado CHECK (estado IN ('PENDIENTE','ACTIVO','BLOQUEADO','INACTIVO'))
);
GO

-- Perfil del usuario
CREATE TABLE core.PerfilUsuario
(
    perfil_usuario_id           INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id                  INT NOT NULL,
    nombres                     NVARCHAR(120) NOT NULL,
    apellidos                   NVARCHAR(120) NOT NULL,
    tipo_documento              NVARCHAR(20) NULL,
    numero_documento            NVARCHAR(30) NULL,
    telefono                    NVARCHAR(30) NULL,
    fecha_nacimiento            DATE NULL,
    sexo                        CHAR(1) NULL,
    foto_url                    NVARCHAR(500) NULL,
    biografia                   NVARCHAR(500) NULL,
    direccion                   NVARCHAR(255) NULL,
    distrito                    NVARCHAR(100) NULL,
    ciudad                      NVARCHAR(100) NULL,
    pais                        NVARCHAR(100) NOT NULL DEFAULT 'Perú',
    recibe_notif_email          BIT NOT NULL DEFAULT 1,
    recibe_notif_push           BIT NOT NULL DEFAULT 1,
    recibe_notif_sms            BIT NOT NULL DEFAULT 0,

    -- Datos básicos para vetting simplificado del inquilino
    ingreso_mensual_referencial DECIMAL(12,2) NULL,
    tiene_aval_bancario         BIT NOT NULL DEFAULT 0,
    tiene_contrato_trabajo      BIT NOT NULL DEFAULT 0,
    tiene_garante               BIT NOT NULL DEFAULT 0,
    nombre_garante              NVARCHAR(200) NULL,
    contacto_garante            NVARCHAR(100) NULL,

    created_at                  DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at                  DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_PerfilUsuario_Usuario FOREIGN KEY (usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT UQ_PerfilUsuario_Usuario UNIQUE (usuario_id),
    CONSTRAINT CK_PerfilUsuario_Sexo CHECK (sexo IS NULL OR sexo IN ('M','F','O'))
);
GO

-- Relación usuario-rol
CREATE TABLE auth.UsuarioRol
(
    usuario_rol_id           INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id               INT NOT NULL,
    rol_id                   INT NOT NULL,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_UsuarioRol_Usuario FOREIGN KEY (usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT FK_UsuarioRol_Rol FOREIGN KEY (rol_id) REFERENCES auth.Rol(rol_id),
    CONSTRAINT UQ_UsuarioRol UNIQUE (usuario_id, rol_id)
);
GO

-- Sesiones / refresh tokens
CREATE TABLE auth.SesionUsuario
(
    sesion_usuario_id        INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id               INT NOT NULL,
    token                    NVARCHAR(500) NOT NULL,
    user_agent               NVARCHAR(500) NULL,
    ip_address               NVARCHAR(64) NULL,
    fecha_inicio             DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    fecha_expiracion         DATETIME2 NOT NULL,
    fecha_revocacion         DATETIME2 NULL,
    activa                   BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_SesionUsuario_Usuario FOREIGN KEY (usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT UQ_SesionUsuario_Token UNIQUE (token)
);
GO

-- Tokens de verificación de email
CREATE TABLE auth.TokenVerificacionEmail
(
    token_verificacion_id    INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id               INT NOT NULL,
    token                    NVARCHAR(255) NOT NULL,
    fecha_expiracion         DATETIME2 NOT NULL,
    usado                    BIT NOT NULL DEFAULT 0,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_TokenVerificacion_Usuario FOREIGN KEY (usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT UQ_TokenVerificacion_Token UNIQUE (token)
);
GO

-- Tokens de recuperación de contraseña
CREATE TABLE auth.TokenRecuperacionPassword
(
    token_recuperacion_id    INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id               INT NOT NULL,
    token                    NVARCHAR(255) NOT NULL,
    fecha_expiracion         DATETIME2 NOT NULL,
    usado                    BIT NOT NULL DEFAULT 0,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_TokenRecuperacion_Usuario FOREIGN KEY (usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT UQ_TokenRecuperacion_Token UNIQUE (token)
);
GO

/* =========================================================
   CATALOGO DE INMUEBLES
   ========================================================= */

-- Inmueble maestro: edificio, piso o local
CREATE TABLE catalog.Inmueble
(
    inmueble_id              INT IDENTITY(1,1) PRIMARY KEY,
    empresa_id               INT NOT NULL,
    edificio_id              INT NULL, -- self FK si es piso/local
    codigo                   NVARCHAR(30) NOT NULL,
    tipo_inmueble            NVARCHAR(20) NOT NULL,   -- EDIFICIO / PISO / LOCAL
    nombre                   NVARCHAR(150) NOT NULL,
    subtipo_unidad           NVARCHAR(50) NULL,       -- OFICINA, LOCAL_COMERCIAL, DEPARTAMENTO, etc.
    descripcion              NVARCHAR(1000) NULL,

    direccion_linea1         NVARCHAR(255) NOT NULL,
    direccion_linea2         NVARCHAR(255) NULL,
    numero                   NVARCHAR(30) NULL,
    distrito                 NVARCHAR(100) NULL,
    ciudad                   NVARCHAR(100) NULL,
    provincia                NVARCHAR(100) NULL,
    departamento             NVARCHAR(100) NULL,
    codigo_postal            NVARCHAR(20) NULL,
    pais                     NVARCHAR(100) NOT NULL DEFAULT 'Perú',

    planta                   NVARCHAR(20) NULL,
    letra                    NVARCHAR(20) NULL,

    area_m2                  DECIMAL(10,2) NULL,
    num_habitaciones         INT NULL,
    num_banos                INT NULL,
    capacidad_personas       INT NULL,

    renta_base_mensual       DECIMAL(12,2) NULL,
    moneda                   CHAR(3) NOT NULL DEFAULT 'PEN',

    latitud                  DECIMAL(9,6) NULL,
    longitud                 DECIMAL(9,6) NULL,

    estado_operativo         NVARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    es_publicable            BIT NOT NULL DEFAULT 1,
    activo                   BIT NOT NULL DEFAULT 1,

    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    deleted_at               DATETIME2 NULL,

    CONSTRAINT FK_Inmueble_Empresa FOREIGN KEY (empresa_id) REFERENCES core.Empresa(empresa_id),
    CONSTRAINT FK_Inmueble_Edificio FOREIGN KEY (edificio_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT UQ_Inmueble_Codigo UNIQUE (codigo),

    CONSTRAINT CK_Inmueble_Tipo CHECK (tipo_inmueble IN ('EDIFICIO','PISO','LOCAL')),
    CONSTRAINT CK_Inmueble_Estado CHECK (estado_operativo IN ('DISPONIBLE','RESERVADO','OCUPADO','MANTENIMIENTO','INACTIVO')),
    CONSTRAINT CK_Inmueble_RelacionTipo CHECK (
        (tipo_inmueble = 'EDIFICIO' AND edificio_id IS NULL AND planta IS NULL AND letra IS NULL)
        OR
        (tipo_inmueble IN ('PISO','LOCAL') AND edificio_id IS NOT NULL)
    ),
    CONSTRAINT CK_Inmueble_NoAutoReferencia CHECK (edificio_id IS NULL OR edificio_id <> inmueble_id)
);
GO

-- Catálogo flexible de características
CREATE TABLE catalog.Caracteristica
(
    caracteristica_id        INT IDENTITY(1,1) PRIMARY KEY,
    nombre                   NVARCHAR(100) NOT NULL,
    tipo_dato                NVARCHAR(20) NOT NULL DEFAULT 'BOOLEAN', -- BOOLEAN/TEXTO/NUMERO
    descripcion              NVARCHAR(200) NULL,
    activo                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Caracteristica_Nombre UNIQUE (nombre),
    CONSTRAINT CK_Caracteristica_TipoDato CHECK (tipo_dato IN ('BOOLEAN','TEXTO','NUMERO'))
);
GO

-- Características asignadas por inmueble
CREATE TABLE catalog.InmuebleCaracteristica
(
    inmueble_caracteristica_id   INT IDENTITY(1,1) PRIMARY KEY,
    inmueble_id                  INT NOT NULL,
    caracteristica_id            INT NOT NULL,
    valor_texto                  NVARCHAR(200) NULL,
    valor_numero                 DECIMAL(12,2) NULL,
    valor_boolean                BIT NULL,
    created_at                   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_InmuebleCaracteristica_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT FK_InmuebleCaracteristica_Caracteristica FOREIGN KEY (caracteristica_id) REFERENCES catalog.Caracteristica(caracteristica_id),
    CONSTRAINT UQ_InmuebleCaracteristica UNIQUE (inmueble_id, caracteristica_id)
);
GO

-- Publicación del inmueble
CREATE TABLE catalog.Publicacion
(
    publicacion_id            INT IDENTITY(1,1) PRIMARY KEY,
    inmueble_id               INT NOT NULL,
    titulo                    NVARCHAR(200) NOT NULL,
    descripcion_corta         NVARCHAR(500) NULL,
    descripcion_larga         NVARCHAR(MAX) NULL,
    precio_publicado_mensual  DECIMAL(12,2) NOT NULL,
    moneda                    CHAR(3) NOT NULL DEFAULT 'PEN',
    condiciones_arrendamiento NVARCHAR(1000) NULL,
    disponible_desde          DATE NULL,
    estado_publicacion        NVARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    es_destacado              BIT NOT NULL DEFAULT 0,
    acepta_reservas           BIT NOT NULL DEFAULT 1,
    fecha_publicacion         DATETIME2 NULL,
    created_at                DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at                DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Publicacion_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT UQ_Publicacion_Inmueble UNIQUE (inmueble_id),
    CONSTRAINT CK_Publicacion_Estado CHECK (estado_publicacion IN ('BORRADOR','PUBLICADO','PAUSADO','RETIRADO'))
);
GO

-- Fotos del inmueble/publicación
CREATE TABLE catalog.InmuebleFoto
(
    inmueble_foto_id          INT IDENTITY(1,1) PRIMARY KEY,
    publicacion_id            INT NOT NULL,
    url_foto                  NVARCHAR(500) NOT NULL,
    nombre_archivo            NVARCHAR(255) NULL,
    orden_visual              INT NOT NULL DEFAULT 1,
    es_principal              BIT NOT NULL DEFAULT 0,
    created_at                DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_InmuebleFoto_Publicacion FOREIGN KEY (publicacion_id) REFERENCES catalog.Publicacion(publicacion_id),
    CONSTRAINT CK_InmuebleFoto_Orden CHECK (orden_visual > 0)
);
GO

-- Bloqueos manuales de disponibilidad
CREATE TABLE catalog.BloqueoDisponibilidad
(
    bloqueo_disponibilidad_id INT IDENTITY(1,1) PRIMARY KEY,
    inmueble_id               INT NOT NULL,
    fecha_inicio              DATE NOT NULL,
    fecha_fin                 DATE NOT NULL,
    motivo                    NVARCHAR(300) NULL,
    origen                    NVARCHAR(20) NOT NULL DEFAULT 'MANUAL', -- MANUAL / MANTENIMIENTO / OTRO
    activo                    BIT NOT NULL DEFAULT 1,
    created_at                DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_BloqueoDisponibilidad_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT CK_BloqueoDisponibilidad_Rango CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT CK_BloqueoDisponibilidad_Origen CHECK (origen IN ('MANUAL','MANTENIMIENTO','OTRO'))
);
GO

/* =========================================================
   RESERVAS / SOLICITUDES
   ========================================================= */

-- Reserva/Solicitud principal
CREATE TABLE booking.Reserva
(
    reserva_id               INT IDENTITY(1,1) PRIMARY KEY,
    inmueble_id              INT NOT NULL,
    inquilino_id             INT NOT NULL,
    estado_reserva           NVARCHAR(20) NOT NULL DEFAULT 'SOLICITADA',
    fecha_solicitud          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    fecha_inicio             DATE NOT NULL,
    fecha_fin                DATE NOT NULL,

    renta_pactada_mensual    DECIMAL(12,2) NULL,
    monto_total_estimado     DECIMAL(12,2) NULL,
    deposito_garantia        DECIMAL(12,2) NULL,
    moneda                   CHAR(3) NOT NULL DEFAULT 'PEN',

    observacion_inquilino    NVARCHAR(500) NULL,
    observacion_gestor       NVARCHAR(500) NULL,
    motivo_rechazo           NVARCHAR(300) NULL,
    motivo_cancelacion       NVARCHAR(300) NULL,

    fecha_decision           DATETIME2 NULL,
    gestionado_por_usuario_id INT NULL,

    fecha_checkin            DATETIME2 NULL,
    fecha_checkout           DATETIME2 NULL,
    checkin_confirmado_por   INT NULL,
    checkout_confirmado_por  INT NULL,

    cancelado_por_usuario_id INT NULL,
    fecha_cancelacion        DATETIME2 NULL,

    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Reserva_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT FK_Reserva_Inquilino FOREIGN KEY (inquilino_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT FK_Reserva_GestionadoPor FOREIGN KEY (gestionado_por_usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT FK_Reserva_CheckinPor FOREIGN KEY (checkin_confirmado_por) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT FK_Reserva_CheckoutPor FOREIGN KEY (checkout_confirmado_por) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT FK_Reserva_CanceladoPor FOREIGN KEY (cancelado_por_usuario_id) REFERENCES auth.Usuario(usuario_id),

    CONSTRAINT CK_Reserva_Estado CHECK (estado_reserva IN ('SOLICITADA','APROBADA','RECHAZADA','CANCELADA','ACTIVA','FINALIZADA','EXPIRADA')),
    CONSTRAINT CK_Reserva_Fechas CHECK (fecha_fin > fecha_inicio)
);
GO

-- Historial de eventos de reserva
CREATE TABLE booking.ReservaEvento
(
    reserva_evento_id        INT IDENTITY(1,1) PRIMARY KEY,
    reserva_id               INT NOT NULL,
    usuario_id               INT NULL,
    tipo_evento              NVARCHAR(30) NOT NULL,
    descripcion              NVARCHAR(500) NULL,
    fecha_evento             DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_ReservaEvento_Reserva FOREIGN KEY (reserva_id) REFERENCES booking.Reserva(reserva_id),
    CONSTRAINT FK_ReservaEvento_Usuario FOREIGN KEY (usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT CK_ReservaEvento_Tipo CHECK (tipo_evento IN ('SOLICITUD','APROBACION','RECHAZO','CHECKIN','CHECKOUT','EXTENSION','CANCELACION','NOTA'))
);
GO

-- Evaluación del inquilino
CREATE TABLE booking.EvaluacionInquilino
(
    evaluacion_inquilino_id  INT IDENTITY(1,1) PRIMARY KEY,
    reserva_id               INT NOT NULL,
    evaluado_por_usuario_id  INT NOT NULL,
    score_riesgo             INT NULL,
    historial_reservas       INT NULL,
    observaciones            NVARCHAR(500) NULL,
    resultado                NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_evaluacion         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_EvaluacionInquilino_Reserva FOREIGN KEY (reserva_id) REFERENCES booking.Reserva(reserva_id),
    CONSTRAINT FK_EvaluacionInquilino_Usuario FOREIGN KEY (evaluado_por_usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT CK_EvaluacionInquilino_Resultado CHECK (resultado IN ('PENDIENTE','APROBADO','OBSERVADO','RECHAZADO'))
);
GO

-- Solicitudes de extensión
CREATE TABLE booking.SolicitudExtension
(
    solicitud_extension_id   INT IDENTITY(1,1) PRIMARY KEY,
    reserva_id               INT NOT NULL,
    solicitante_usuario_id   INT NOT NULL,
    nueva_fecha_fin          DATE NOT NULL,
    motivo                   NVARCHAR(500) NULL,
    estado                   NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_solicitud          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    fecha_decision           DATETIME2 NULL,
    decidido_por_usuario_id  INT NULL,
    comentario_decision      NVARCHAR(500) NULL,

    CONSTRAINT FK_SolicitudExtension_Reserva FOREIGN KEY (reserva_id) REFERENCES booking.Reserva(reserva_id),
    CONSTRAINT FK_SolicitudExtension_Solicitante FOREIGN KEY (solicitante_usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT FK_SolicitudExtension_DecididoPor FOREIGN KEY (decidido_por_usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT CK_SolicitudExtension_Estado CHECK (estado IN ('PENDIENTE','APROBADA','RECHAZADA','CANCELADA'))
);
GO

/* =========================================================
   FACTURACION
   ========================================================= */

-- Catálogo de conceptos de cobro
CREATE TABLE finance.ConceptoCobro
(
    concepto_cobro_id        INT IDENTITY(1,1) PRIMARY KEY,
    codigo                   NVARCHAR(30) NOT NULL,
    nombre                   NVARCHAR(100) NOT NULL,
    descripcion              NVARCHAR(300) NULL,
    tipo_concepto            NVARCHAR(20) NOT NULL, -- FIJO / VARIABLE / IMPUESTO / SERVICIO
    es_obligatorio           BIT NOT NULL DEFAULT 0,
    aplica_igv               BIT NOT NULL DEFAULT 0,
    monto_default            DECIMAL(12,2) NOT NULL DEFAULT 0,
    orden_impresion          INT NOT NULL DEFAULT 1,
    activo                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT UQ_ConceptoCobro_Codigo UNIQUE (codigo),
    CONSTRAINT CK_ConceptoCobro_Tipo CHECK (tipo_concepto IN ('FIJO','VARIABLE','IMPUESTO','SERVICIO')),
    CONSTRAINT CK_ConceptoCobro_Orden CHECK (orden_impresion > 0)
);
GO

-- Configuración de conceptos por inmueble
CREATE TABLE finance.ConfiguracionCobroInmueble
(
    configuracion_cobro_id   INT IDENTITY(1,1) PRIMARY KEY,
    inmueble_id              INT NOT NULL,
    concepto_cobro_id        INT NOT NULL,
    monto_configurado        DECIMAL(12,2) NOT NULL DEFAULT 0,
    es_obligatorio           BIT NOT NULL DEFAULT 0,
    vigencia_desde           DATE NOT NULL,
    vigencia_hasta           DATE NULL,
    activo                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_ConfigCobro_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT FK_ConfigCobro_Concepto FOREIGN KEY (concepto_cobro_id) REFERENCES finance.ConceptoCobro(concepto_cobro_id),
    CONSTRAINT CK_ConfigCobro_Rango CHECK (vigencia_hasta IS NULL OR vigencia_hasta >= vigencia_desde)
);
GO

-- IPC anual
CREATE TABLE finance.IndiceIPC
(
    indice_ipc_id            INT IDENTITY(1,1) PRIMARY KEY,
    anio                     INT NOT NULL,
    porcentaje_anual         DECIMAL(6,3) NOT NULL,
    fecha_publicacion        DATE NULL,
    activo                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_IndiceIPC_Anio UNIQUE (anio)
);
GO

-- Histórico de tarifas/renta por inmueble
CREATE TABLE finance.TarifaInmueble
(
    tarifa_inmueble_id       INT IDENTITY(1,1) PRIMARY KEY,
    inmueble_id              INT NOT NULL,
    vigencia_desde           DATE NOT NULL,
    vigencia_hasta           DATE NULL,
    renta_base_mensual       DECIMAL(12,2) NOT NULL,
    porcentaje_ipc_aplicado  DECIMAL(6,3) NOT NULL DEFAULT 0,
    monto_incremento         DECIMAL(12,2) NOT NULL DEFAULT 0,
    motivo                   NVARCHAR(300) NULL,
    aplicado_por_usuario_id  INT NULL,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_TarifaInmueble_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT FK_TarifaInmueble_Usuario FOREIGN KEY (aplicado_por_usuario_id) REFERENCES auth.Usuario(usuario_id),
    CONSTRAINT CK_TarifaInmueble_Rango CHECK (vigencia_hasta IS NULL OR vigencia_hasta >= vigencia_desde)
);
GO

-- Cuenta de cobro permanente por inmueble
CREATE TABLE finance.CuentaCobroInmueble
(
    cuenta_cobro_inmueble_id INT IDENTITY(1,1) PRIMARY KEY,
    inmueble_id              INT NOT NULL,
    numero_recibo_base       NVARCHAR(50) NOT NULL,
    dia_vencimiento          TINYINT NOT NULL DEFAULT 5,
    activo                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_CuentaCobroInmueble_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT UQ_CuentaCobroInmueble_Inmueble UNIQUE (inmueble_id),
    CONSTRAINT UQ_CuentaCobroInmueble_Numero UNIQUE (numero_recibo_base),
    CONSTRAINT CK_CuentaCobroInmueble_Dia CHECK (dia_vencimiento BETWEEN 1 AND 31)
);
GO

-- Recibos mensuales
CREATE TABLE finance.Recibo
(
    recibo_id                INT IDENTITY(1,1) PRIMARY KEY,
    cuenta_cobro_inmueble_id INT NOT NULL,
    reserva_id               INT NULL,
    periodo_anio             INT NOT NULL,
    periodo_mes              TINYINT NOT NULL,
    fecha_emision            DATE NOT NULL DEFAULT CAST(SYSDATETIME() AS DATE),
    fecha_vencimiento        DATE NOT NULL,
    estado_recibo            NVARCHAR(20) NOT NULL DEFAULT 'EMITIDO',
    subtotal                 DECIMAL(12,2) NOT NULL DEFAULT 0,
    igv_total                DECIMAL(12,2) NOT NULL DEFAULT 0,
    total                    DECIMAL(12,2) NOT NULL DEFAULT 0,
    saldo_pendiente          DECIMAL(12,2) NOT NULL DEFAULT 0,
    generado_desde_recibo_id INT NULL,
    emitido_por_usuario_id   INT NULL,
    pdf_url                  NVARCHAR(500) NULL,
    observaciones            NVARCHAR(500) NULL,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Recibo_CuentaCobro FOREIGN KEY (cuenta_cobro_inmueble_id) REFERENCES finance.CuentaCobroInmueble(cuenta_cobro_inmueble_id),
    CONSTRAINT FK_Recibo_Reserva FOREIGN KEY (reserva_id) REFERENCES booking.Reserva(reserva_id),
    CONSTRAINT FK_Recibo_ReciboOrigen FOREIGN KEY (generado_desde_recibo_id) REFERENCES finance.Recibo(recibo_id),
    CONSTRAINT FK_Recibo_Usuario FOREIGN KEY (emitido_por_usuario_id) REFERENCES auth.Usuario(usuario_id),

    CONSTRAINT UQ_Recibo_Periodo UNIQUE (cuenta_cobro_inmueble_id, periodo_anio, periodo_mes),
    CONSTRAINT CK_Recibo_PeriodoMes CHECK (periodo_mes BETWEEN 1 AND 12),
    CONSTRAINT CK_Recibo_Estado CHECK (estado_recibo IN ('EMITIDO','PAGADO','PARCIAL','VENCIDO','ANULADO')),
    CONSTRAINT CK_Recibo_Fechas CHECK (fecha_vencimiento >= fecha_emision)
);
GO

-- Detalle del recibo
CREATE TABLE finance.ReciboDetalle
(
    recibo_detalle_id        INT IDENTITY(1,1) PRIMARY KEY,
    recibo_id                INT NOT NULL,
    concepto_cobro_id        INT NOT NULL,
    descripcion              NVARCHAR(200) NULL,
    cantidad                 DECIMAL(12,2) NOT NULL DEFAULT 1,
    precio_unitario          DECIMAL(12,2) NOT NULL DEFAULT 0,
    importe                  DECIMAL(12,2) NOT NULL DEFAULT 0,
    orden_impresion          INT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_ReciboDetalle_Recibo FOREIGN KEY (recibo_id) REFERENCES finance.Recibo(recibo_id),
    CONSTRAINT FK_ReciboDetalle_Concepto FOREIGN KEY (concepto_cobro_id) REFERENCES finance.ConceptoCobro(concepto_cobro_id),
    CONSTRAINT UQ_ReciboDetalle UNIQUE (recibo_id, concepto_cobro_id),
    CONSTRAINT CK_ReciboDetalle_Cantidad CHECK (cantidad >= 0),
    CONSTRAINT CK_ReciboDetalle_Precio CHECK (precio_unitario >= 0),
    CONSTRAINT CK_ReciboDetalle_Importe CHECK (importe >= 0)
);
GO

-- Pagos
CREATE TABLE finance.Pago
(
    pago_id                  INT IDENTITY(1,1) PRIMARY KEY,
    recibo_id                INT NOT NULL,
    reserva_id               INT NULL,
    usuario_pagador_id       INT NOT NULL,
    metodo_pago              NVARCHAR(20) NOT NULL,
    proveedor_pasarela       NVARCHAR(100) NULL,
    transaccion_externa      NVARCHAR(150) NULL,
    referencia               NVARCHAR(150) NULL,
    monto                    DECIMAL(12,2) NOT NULL,
    moneda                   CHAR(3) NOT NULL DEFAULT 'PEN',
    estado_pago              NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_pago               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    fecha_confirmacion       DATETIME2 NULL,
    observaciones            NVARCHAR(500) NULL,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Pago_Recibo FOREIGN KEY (recibo_id) REFERENCES finance.Recibo(recibo_id),
    CONSTRAINT FK_Pago_Reserva FOREIGN KEY (reserva_id) REFERENCES booking.Reserva(reserva_id),
    CONSTRAINT FK_Pago_Usuario FOREIGN KEY (usuario_pagador_id) REFERENCES auth.Usuario(usuario_id),

    CONSTRAINT CK_Pago_Metodo CHECK (metodo_pago IN ('ONLINE','TRANSFERENCIA','EFECTIVO','TARJETA')),
    CONSTRAINT CK_Pago_Estado CHECK (estado_pago IN ('PENDIENTE','CONFIRMADO','FALLIDO','REEMBOLSADO','ANULADO')),
    CONSTRAINT CK_Pago_Monto CHECK (monto > 0)
);
GO

/* =========================================================
   TESORERIA / MOVIMIENTOS BANCARIOS
   ========================================================= */

-- Bancos
CREATE TABLE finance.Banco
(
    banco_id                 INT IDENTITY(1,1) PRIMARY KEY,
    nombre                   NVARCHAR(150) NOT NULL,
    codigo                   NVARCHAR(30) NULL,
    activo                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Banco_Nombre UNIQUE (nombre)
);
GO

-- Cuentas bancarias
CREATE TABLE finance.CuentaBancaria
(
    cuenta_bancaria_id       INT IDENTITY(1,1) PRIMARY KEY,
    empresa_id               INT NOT NULL,
    banco_id                 INT NOT NULL,
    nombre_cuenta            NVARCHAR(150) NOT NULL,
    numero_cuenta            NVARCHAR(50) NOT NULL,
    cci                      NVARCHAR(50) NULL,
    moneda                   CHAR(3) NOT NULL DEFAULT 'PEN',
    tipo_cuenta              NVARCHAR(20) NOT NULL DEFAULT 'CORRIENTE',
    saldo_inicial            DECIMAL(14,2) NOT NULL DEFAULT 0,
    saldo_actual             DECIMAL(14,2) NOT NULL DEFAULT 0,
    activa                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_CuentaBancaria_Empresa FOREIGN KEY (empresa_id) REFERENCES core.Empresa(empresa_id),
    CONSTRAINT FK_CuentaBancaria_Banco FOREIGN KEY (banco_id) REFERENCES finance.Banco(banco_id),
    CONSTRAINT UQ_CuentaBancaria_Numero UNIQUE (banco_id, numero_cuenta),
    CONSTRAINT CK_CuentaBancaria_Tipo CHECK (tipo_cuenta IN ('AHORRO','CORRIENTE'))
);
GO

-- Categorías de movimientos: gasto o ingreso
CREATE TABLE finance.CategoriaMovimiento
(
    categoria_movimiento_id  INT IDENTITY(1,1) PRIMARY KEY,
    nombre                   NVARCHAR(100) NOT NULL,
    naturaleza               NVARCHAR(20) NOT NULL, -- GASTO / INGRESO
    descripcion              NVARCHAR(300) NULL,
    activo                   BIT NOT NULL DEFAULT 1,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT UQ_CategoriaMovimiento_Nombre UNIQUE (nombre, naturaleza),
    CONSTRAINT CK_CategoriaMovimiento_Naturaleza CHECK (naturaleza IN ('GASTO','INGRESO'))
);
GO

-- Movimientos bancarios
CREATE TABLE finance.MovimientoBancario
(
    movimiento_bancario_id   INT IDENTITY(1,1) PRIMARY KEY,
    cuenta_bancaria_id       INT NOT NULL,
    categoria_movimiento_id  INT NOT NULL,
    tipo_movimiento          NVARCHAR(20) NOT NULL, -- GASTO / INGRESO
    inmueble_id              INT NULL,
    reserva_id               INT NULL,
    recibo_id                INT NULL,
    pago_id                  INT NULL,

    fecha_movimiento         DATETIME2 NOT NULL,
    concepto                 NVARCHAR(200) NOT NULL,
    descripcion              NVARCHAR(500) NULL,
    importe                  DECIMAL(14,2) NOT NULL,
    saldo_anterior           DECIMAL(14,2) NULL,
    saldo_posterior          DECIMAL(14,2) NULL,
    referencia_externa       NVARCHAR(150) NULL,
    observaciones            NVARCHAR(500) NULL,
    created_at               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_MovimientoBancario_Cuenta FOREIGN KEY (cuenta_bancaria_id) REFERENCES finance.CuentaBancaria(cuenta_bancaria_id),
    CONSTRAINT FK_MovimientoBancario_Categoria FOREIGN KEY (categoria_movimiento_id) REFERENCES finance.CategoriaMovimiento(categoria_movimiento_id),
    CONSTRAINT FK_MovimientoBancario_Inmueble FOREIGN KEY (inmueble_id) REFERENCES catalog.Inmueble(inmueble_id),
    CONSTRAINT FK_MovimientoBancario_Reserva FOREIGN KEY (reserva_id) REFERENCES booking.Reserva(reserva_id),
    CONSTRAINT FK_MovimientoBancario_Recibo FOREIGN KEY (recibo_id) REFERENCES finance.Recibo(recibo_id),
    CONSTRAINT FK_MovimientoBancario_Pago FOREIGN KEY (pago_id) REFERENCES finance.Pago(pago_id),

    CONSTRAINT CK_MovimientoBancario_Tipo CHECK (tipo_movimiento IN ('GASTO','INGRESO')),
    CONSTRAINT CK_MovimientoBancario_Importe CHECK (importe > 0)
);
GO

/* =========================================================
   INDICES
   ========================================================= */

CREATE UNIQUE INDEX UX_PerfilUsuario_NumeroDocumento
ON core.PerfilUsuario(numero_documento)
WHERE numero_documento IS NOT NULL;
GO

CREATE INDEX IX_Usuario_Empresa_Estado
ON auth.Usuario(empresa_id, estado);
GO

CREATE INDEX IX_Inmueble_Edificio
ON catalog.Inmueble(edificio_id);
GO

CREATE INDEX IX_Inmueble_Tipo_Estado
ON catalog.Inmueble(tipo_inmueble, estado_operativo, activo);
GO

CREATE INDEX IX_Publicacion_Estado
ON catalog.Publicacion(estado_publicacion, acepta_reservas);
GO

CREATE INDEX IX_BloqueoDisponibilidad_Inmueble_Fechas
ON catalog.BloqueoDisponibilidad(inmueble_id, fecha_inicio, fecha_fin);
GO

CREATE INDEX IX_Reserva_Inmueble_Fechas
ON booking.Reserva(inmueble_id, fecha_inicio, fecha_fin, estado_reserva);
GO

CREATE INDEX IX_Reserva_Inquilino_Estado
ON booking.Reserva(inquilino_id, estado_reserva, fecha_solicitud);
GO

CREATE INDEX IX_SolicitudExtension_Reserva_Estado
ON booking.SolicitudExtension(reserva_id, estado);
GO

CREATE INDEX IX_Recibo_Periodo_Estado
ON finance.Recibo(periodo_anio, periodo_mes, estado_recibo);
GO

CREATE INDEX IX_Recibo_Reserva
ON finance.Recibo(reserva_id);
GO

CREATE INDEX IX_Pago_Recibo_Estado
ON finance.Pago(recibo_id, estado_pago, fecha_pago);
GO

CREATE INDEX IX_MovimientoBancario_Fecha_Tipo
ON finance.MovimientoBancario(fecha_movimiento, tipo_movimiento);
GO

CREATE INDEX IX_MovimientoBancario_Inmueble
ON finance.MovimientoBancario(inmueble_id, tipo_movimiento);
GO

CREATE UNIQUE INDEX UX_InmuebleFoto_Principal
ON catalog.InmuebleFoto(publicacion_id)
WHERE es_principal = 1;
GO

CREATE UNIQUE INDEX UX_MovimientoBancario_Pago
ON finance.MovimientoBancario(pago_id)
WHERE pago_id IS NOT NULL;
GO

/* =========================================================
   VISTAS DE REPORTE
   ========================================================= */

-- Recibos pendientes / deudores
CREATE VIEW reporting.v_RecibosPendientes
AS
SELECT
    r.recibo_id,
    cc.numero_recibo_base,
    i.inmueble_id,
    i.codigo AS codigo_inmueble,
    i.nombre AS inmueble,
    res.reserva_id,
    pu.nombres + ' ' + pu.apellidos AS inquilino,
    r.periodo_anio,
    r.periodo_mes,
    r.fecha_emision,
    r.fecha_vencimiento,
    r.total,
    r.saldo_pendiente,
    r.estado_recibo
FROM finance.Recibo r
INNER JOIN finance.CuentaCobroInmueble cc
    ON cc.cuenta_cobro_inmueble_id = r.cuenta_cobro_inmueble_id
INNER JOIN catalog.Inmueble i
    ON i.inmueble_id = cc.inmueble_id
LEFT JOIN booking.Reserva res
    ON res.reserva_id = r.reserva_id
LEFT JOIN core.PerfilUsuario pu
    ON pu.usuario_id = res.inquilino_id
WHERE r.estado_recibo IN ('EMITIDO','PARCIAL','VENCIDO')
  AND r.saldo_pendiente > 0;
GO

-- Resumen financiero mensual
CREATE VIEW reporting.v_ResumenFinancieroMensual
AS
SELECT
    YEAR(fecha_movimiento) AS anio,
    MONTH(fecha_movimiento) AS mes,
    SUM(CASE WHEN tipo_movimiento = 'INGRESO' THEN importe ELSE 0 END) AS total_ingresos,
    SUM(CASE WHEN tipo_movimiento = 'GASTO' THEN importe ELSE 0 END) AS total_gastos,
    SUM(CASE WHEN tipo_movimiento = 'INGRESO' THEN importe ELSE -importe END) AS balance_neto
FROM finance.MovimientoBancario
GROUP BY YEAR(fecha_movimiento), MONTH(fecha_movimiento);
GO

-- KPI simplificado por inmueble
CREATE VIEW reporting.v_KPI_Ocupacion_Rentabilidad
AS
WITH ReservasAgg AS
(
    SELECT
        inmueble_id,
        COUNT(CASE WHEN estado_reserva IN ('APROBADA','ACTIVA','FINALIZADA') THEN 1 END) AS reservas_confirmadas,
        SUM(CASE WHEN estado_reserva IN ('APROBADA','ACTIVA','FINALIZADA')
                 THEN DATEDIFF(DAY, fecha_inicio, fecha_fin)
                 ELSE 0 END) AS dias_ocupados
    FROM booking.Reserva
    GROUP BY inmueble_id
),
MovimientosAgg AS
(
    SELECT
        inmueble_id,
        SUM(CASE WHEN tipo_movimiento = 'INGRESO' THEN importe ELSE 0 END) AS ingresos,
        SUM(CASE WHEN tipo_movimiento = 'GASTO' THEN importe ELSE 0 END) AS gastos
    FROM finance.MovimientoBancario
    GROUP BY inmueble_id
)
SELECT
    i.inmueble_id,
    i.codigo,
    i.nombre,
    i.tipo_inmueble,
    ISNULL(r.reservas_confirmadas, 0) AS reservas_confirmadas,
    ISNULL(r.dias_ocupados, 0) AS dias_ocupados,
    ISNULL(m.ingresos, 0) AS ingresos,
    ISNULL(m.gastos, 0) AS gastos,
    ISNULL(m.ingresos, 0) - ISNULL(m.gastos, 0) AS rentabilidad_neta
FROM catalog.Inmueble i
LEFT JOIN ReservasAgg r
    ON r.inmueble_id = i.inmueble_id
LEFT JOIN MovimientosAgg m
    ON m.inmueble_id = i.inmueble_id
WHERE i.activo = 1;
GO

-- Reporte de pagos y deudores
CREATE VIEW reporting.v_PagosYDeudores
AS
WITH PagosConfirmados AS
(
    SELECT
        recibo_id,
        SUM(CASE WHEN estado_pago = 'CONFIRMADO' THEN monto ELSE 0 END) AS total_pagado
    FROM finance.Pago
    GROUP BY recibo_id
)
SELECT
    r.recibo_id,
    i.inmueble_id,
    i.nombre AS inmueble,
    pu.nombres + ' ' + pu.apellidos AS inquilino,
    r.periodo_anio,
    r.periodo_mes,
    r.total,
    ISNULL(p.total_pagado, 0) AS total_pagado,
    (r.total - ISNULL(p.total_pagado, 0)) AS deuda,
    CASE
        WHEN (r.total - ISNULL(p.total_pagado, 0)) <= 0 THEN 'PAGADO'
        WHEN ISNULL(p.total_pagado, 0) > 0 THEN 'PARCIAL'
        ELSE 'PENDIENTE'
    END AS estado_pago_general,
    r.fecha_vencimiento
FROM finance.Recibo r
INNER JOIN finance.CuentaCobroInmueble cc
    ON cc.cuenta_cobro_inmueble_id = r.cuenta_cobro_inmueble_id
INNER JOIN catalog.Inmueble i
    ON i.inmueble_id = cc.inmueble_id
LEFT JOIN booking.Reserva res
    ON res.reserva_id = r.reserva_id
LEFT JOIN core.PerfilUsuario pu
    ON pu.usuario_id = res.inquilino_id
LEFT JOIN PagosConfirmados p
    ON p.recibo_id = r.recibo_id;
GO