const { getConnection, sql } = require('../config/db');

const buscarUsuarioPorCorreo = async (correo) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('correo', sql.NVarChar(255), correo)
    .query(`
      SELECT 
        usuario_id,
        empresa_id,
        correo,
        password_hash,
        estado,
        email_verificado,
        activo
      FROM auth.Usuario
      WHERE correo = @correo
        AND deleted_at IS NULL
    `);

  return result.recordset[0];
};

const registrarUsuario = async ({
  empresa_id,
  correo,
  password_hash,
  nombres,
  apellidos,
  acepta_terminos
}) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestUsuario = new sql.Request(transaction);

    const usuarioResult = await requestUsuario
      .input('empresa_id', sql.Int, empresa_id)
      .input('correo', sql.NVarChar(255), correo)
      .input('password_hash', sql.NVarChar(255), password_hash)
      .input('acepta_terminos', sql.Bit, acepta_terminos)
      .query(`
        INSERT INTO auth.Usuario (
          empresa_id,
          correo,
          password_hash,
          estado,
          email_verificado,
          acepta_terminos
        )
        OUTPUT INSERTED.usuario_id, INSERTED.correo, INSERTED.estado, INSERTED.email_verificado
        VALUES (
          @empresa_id,
          @correo,
          @password_hash,
          'PENDIENTE',
          0,
          @acepta_terminos
        );
      `);

    const usuarioCreado = usuarioResult.recordset[0];

    const requestPerfil = new sql.Request(transaction);

    await requestPerfil
      .input('usuario_id', sql.Int, usuarioCreado.usuario_id)
      .input('nombres', sql.NVarChar(120), nombres)
      .input('apellidos', sql.NVarChar(120), apellidos)
      .query(`
        INSERT INTO core.PerfilUsuario (
          usuario_id,
          nombres,
          apellidos
        )
        VALUES (
          @usuario_id,
          @nombres,
          @apellidos
        );
      `);

    const requestRol = new sql.Request(transaction);

    await requestRol
      .input('usuario_id', sql.Int, usuarioCreado.usuario_id)
      .query(`
        INSERT INTO auth.UsuarioRol (
          usuario_id,
          rol_id
        )
        SELECT 
          @usuario_id,
          rol_id
        FROM auth.Rol
        WHERE nombre = 'CLIENTE';
      `);

    await transaction.commit();

    return usuarioCreado;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
// Esta funcion trae el ROL DE USUARIO "Pendiente de modificar a una PROCEDURE EN SQL SERVER"
const obtenerRolesUsuario = async (usuario_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_id', sql.Int, usuario_id)
    .query(`
      SELECT 
        r.nombre
      FROM auth.UsuarioRol ur
      INNER JOIN auth.Rol r
        ON r.rol_id = ur.rol_id
      WHERE ur.usuario_id = @usuario_id
        AND r.activo = 1;
    `);

  return result.recordset.map(rol => rol.nombre);
};

// Esta funcion actualiza el UltimoAcesso, "Pendiente de modificar a un PROCEDURE en SQL Server"
const actualizarUltimoAcceso = async (usuario_id) => {
  const pool = await getConnection();

  await pool.request()
    .input('usuario_id', sql.Int, usuario_id)
    .query(`
      UPDATE auth.Usuario
      SET ultimo_acceso = SYSDATETIME(),
          updated_at = SYSDATETIME()
      WHERE usuario_id = @usuario_id;
    `);
};

const obtenerUsuarioConPerfil = async (usuario_id) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuario_id', sql.Int, usuario_id)
    .query(`
      SELECT 
        u.usuario_id,
        u.correo,
        u.estado,
        u.email_verificado,
        u.acepta_terminos,
        u.ultimo_acceso,
        u.created_at,

        p.perfil_usuario_id,
        p.nombres,
        p.apellidos,
        p.telefono,
        p.tipo_documento,
        p.numero_documento,
        p.fecha_nacimiento,
        p.sexo,
        p.foto_url,
        p.biografia,
        p.direccion,
        p.distrito,
        p.ciudad,
        p.pais,
        p.recibe_notif_email,
        p.recibe_notif_push,
        p.recibe_notif_sms
      FROM auth.Usuario u
      INNER JOIN core.PerfilUsuario p
        ON p.usuario_id = u.usuario_id
      WHERE u.usuario_id = @usuario_id
        AND u.deleted_at IS NULL;
    `);

  return result.recordset[0];
};

module.exports = {
  buscarUsuarioPorCorreo,
  registrarUsuario,
  obtenerRolesUsuario,
  actualizarUltimoAcceso,
  obtenerUsuarioConPerfil
};