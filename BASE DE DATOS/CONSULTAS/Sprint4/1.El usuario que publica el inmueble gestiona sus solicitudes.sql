/* =========================================================
   HU10 - 
   El usuario que publica el inmueble gestiona sus solicitudes
   ========================================================= */

IF COL_LENGTH('catalog.Publicacion', 'publicado_por_usuario_id') IS NULL
BEGIN
    ALTER TABLE catalog.Publicacion
    ADD publicado_por_usuario_id INT NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_Publicacion_PublicadoPorUsuario'
)
BEGIN
    ALTER TABLE catalog.Publicacion
    ADD CONSTRAINT FK_Publicacion_PublicadoPorUsuario
    FOREIGN KEY (publicado_por_usuario_id)
    REFERENCES auth.Usuario(usuario_id);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Publicacion_PublicadoPorUsuario'
      AND object_id = OBJECT_ID('catalog.Publicacion')
)
BEGIN
    CREATE INDEX IX_Publicacion_PublicadoPorUsuario
    ON catalog.Publicacion(publicado_por_usuario_id);
END;
GO