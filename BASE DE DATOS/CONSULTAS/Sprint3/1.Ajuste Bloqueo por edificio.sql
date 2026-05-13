ALTER TABLE catalog.BloqueoDisponibilidad
ADD bloqueo_padre_id INT NULL;
GO

ALTER TABLE catalog.BloqueoDisponibilidad
ADD CONSTRAINT FK_BloqueoDisponibilidad_Padre
FOREIGN KEY (bloqueo_padre_id)
REFERENCES catalog.BloqueoDisponibilidad(bloqueo_disponibilidad_id);
GO

CREATE INDEX IX_BloqueoDisponibilidad_Padre
ON catalog.BloqueoDisponibilidad(bloqueo_padre_id);
GO