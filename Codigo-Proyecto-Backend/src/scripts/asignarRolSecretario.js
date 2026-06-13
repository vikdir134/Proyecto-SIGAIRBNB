const { getConnection, sql } = require('../config/db');

const asignarRolSecretario = async () => {
  const correo = process.argv[2]?.trim().toLowerCase();

  if (!correo) {
    console.error(
      'Debes indicar el correo del usuario.\n' +
      'Ejemplo: node src/scripts/asignarRolSecretario.js secretario@correo.com'
    );
    process.exitCode = 1;
    return;
  }

  let pool;

  try {
    pool = await getConnection();

    const usuarioResult = await pool.request()
      .input('correo', sql.NVarChar(255), correo)
      .query(`
        SELECT
          usuario_id,
          correo,
          estado,
          activo
        FROM auth.Usuario
        WHERE correo = @correo
          AND activo = 1
          AND deleted_at IS NULL;
      `);

    const usuario = usuarioResult.recordset[0];

    if (!usuario) {
      throw new Error(
        `No se encontró un usuario activo con el correo ${correo}`
      );
    }

    const rolResult = await pool.request()
      .query(`
        SELECT
          rol_id,
          nombre
        FROM auth.Rol
        WHERE nombre = 'SECRETARIO'
          AND activo = 1;
      `);

    const rolSecretario = rolResult.recordset[0];

    if (!rolSecretario) {
      throw new Error(
        'El rol SECRETARIO no existe o se encuentra inactivo'
      );
    }

    await pool.request()
      .input('usuario_id', sql.Int, usuario.usuario_id)
      .input('rol_id', sql.Int, rolSecretario.rol_id)
      .query(`
        IF NOT EXISTS (
          SELECT 1
          FROM auth.UsuarioRol
          WHERE usuario_id = @usuario_id
            AND rol_id = @rol_id
        )
        BEGIN
          INSERT INTO auth.UsuarioRol (
            usuario_id,
            rol_id
          )
          VALUES (
            @usuario_id,
            @rol_id
          );
        END;
      `);

    const rolesResult = await pool.request()
      .input('usuario_id', sql.Int, usuario.usuario_id)
      .query(`
        SELECT
          r.nombre AS rol
        FROM auth.UsuarioRol ur
        INNER JOIN auth.Rol r
          ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = @usuario_id
          AND r.activo = 1
        ORDER BY r.nombre;
      `);

    console.log('Rol SECRETARIO asignado correctamente.');
    console.log(`Usuario: ${usuario.correo}`);
    console.table(rolesResult.recordset);

  } catch (error) {
    console.error('Error al asignar el rol SECRETARIO:', error.message);
    process.exitCode = 1;
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (errorCierre) {
        console.error(
          'No se pudo cerrar la conexión:',
          errorCierre.message
        );
      }
    }
  }
};

asignarRolSecretario();