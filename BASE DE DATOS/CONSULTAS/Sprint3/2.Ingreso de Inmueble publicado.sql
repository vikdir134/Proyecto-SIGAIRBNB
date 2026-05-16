--Esta consulta solo es para el seguimiento , se ingreso un inmueble publicado para avanzar el HU6
DECLARE @inmueble_id INT = 2;

IF NOT EXISTS (
    SELECT 1
    FROM catalog.Publicacion
    WHERE inmueble_id = @inmueble_id
)
BEGIN
    INSERT INTO catalog.Publicacion (
        inmueble_id,
        titulo,
        descripcion_corta,
        descripcion_larga,
        precio_publicado_mensual,
        moneda,
        condiciones_arrendamiento,
        disponible_desde,
        estado_publicacion,
        es_destacado,
        acepta_reservas,
        fecha_publicacion
    )
    VALUES (
        @inmueble_id,
        'Local comercial en Miraflores',
        'Local ubicado en una zona estratégica de Miraflores, ideal para oficina o negocio.',
        'Este local se encuentra dentro del edificio registrado en el sistema. Cuenta con buena ubicación, acceso céntrico y condiciones adecuadas para alquiler mensual.',
        2500.00,
        'PEN',
        'Contrato mínimo de 6 meses. Evaluación previa del inquilino.',
        '2026-06-01',
        'PUBLICADO',
        1,
        1,
        SYSDATETIME()
    );
END;