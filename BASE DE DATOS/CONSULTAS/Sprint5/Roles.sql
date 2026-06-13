/* =========================================================
   ROLES INICIALES DEL SISTEMA
   ========================================================= */

IF NOT EXISTS (
    SELECT 1
    FROM auth.Rol
    WHERE nombre = 'CLIENTE'
)
BEGIN
    INSERT INTO auth.Rol (
        nombre,
        descripcion,
        activo
    )
    VALUES (
        'CLIENTE',
        'Usuario que busca inmuebles y realiza solicitudes de reserva',
        1
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM auth.Rol
    WHERE nombre = 'ADMIN'
)
BEGIN
    INSERT INTO auth.Rol (
        nombre,
        descripcion,
        activo
    )
    VALUES (
        'ADMIN',
        'Administrador general del sistema y de los inmuebles',
        1
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM auth.Rol
    WHERE nombre = 'SECRETARIO'
)
BEGIN
    INSERT INTO auth.Rol (
        nombre,
        descripcion,
        activo
    )
    VALUES (
        'SECRETARIO',
        'Responsable del control de ocupación, check-in y check-out de reservas',
        1
    );
END;
GO