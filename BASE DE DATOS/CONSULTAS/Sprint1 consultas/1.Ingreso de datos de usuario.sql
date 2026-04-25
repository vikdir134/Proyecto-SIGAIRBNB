USE SistemaIntegralGestionAirbnb;
GO

IF NOT EXISTS (SELECT 1 FROM core.Empresa WHERE razon_social = 'Airbnb Gestión Demo')
BEGIN
    INSERT INTO core.Empresa (
        razon_social,
        nombre_comercial,
        ruc,
        correo_contacto,
        telefono_contacto,
        ciudad,
        pais
    )
    VALUES (
        'Airbnb Gestión Demo',
        'Airbnb Gestión Demo',
        '00000000000',
        'contacto@demo.com',
        '999999999',
        'Lima',
        'Perú'
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM auth.Rol WHERE nombre = 'CLIENTE')
BEGIN
    INSERT INTO auth.Rol (nombre, descripcion)
    VALUES ('CLIENTE', 'Usuario que puede registrarse, iniciar sesión y reservar inmuebles');
END;
GO

SELECT * FROM core.Empresa;
SELECT * FROM auth.Rol;