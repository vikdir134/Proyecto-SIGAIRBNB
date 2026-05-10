--No ejecutar Query solo es para traxabilidad y entender el proceso
INSERT INTO auth.Rol (nombre, descripcion)
SELECT 'ADMIN', 'Administrador de la empresa'
WHERE NOT EXISTS (
    SELECT 1
    FROM auth.Rol
    WHERE nombre = 'ADMIN'
);