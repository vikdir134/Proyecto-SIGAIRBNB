DECLARE @publicacion_id INT;

SELECT @publicacion_id = publicacion_id
FROM catalog.Publicacion
WHERE inmueble_id = 2;

IF @publicacion_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM catalog.InmuebleFoto
    WHERE publicacion_id = @publicacion_id
)
BEGIN
    INSERT INTO catalog.InmuebleFoto (
        publicacion_id,
        url_foto,
        nombre_archivo,
        orden_visual,
        es_principal
    )
    VALUES (
        @publicacion_id,
        '/images/local-jesus-maria.jpg',
        'local-jesus-maria.jpg',
        1,
        1
    );
END;