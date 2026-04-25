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

module.exports = {
  buscarUsuarioPorCorreo,
  registrarUsuario
};