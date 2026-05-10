--No ejecutar solo es para trazabiliad del desarollo
INSERT INTO auth.UsuarioRol (usuario_id, rol_id)
SELECT 
    u.usuario_id,
    r.rol_id
FROM auth.Usuario u
CROSS JOIN auth.Rol r
WHERE u.correo = 'victorcamargoch133@gmail.com'
  AND r.nombre = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1
      FROM auth.UsuarioRol ur
      WHERE ur.usuario_id = u.usuario_id
        AND ur.rol_id = r.rol_id
  );