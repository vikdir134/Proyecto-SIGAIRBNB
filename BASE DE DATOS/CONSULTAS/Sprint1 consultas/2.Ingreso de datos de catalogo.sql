use SistemaIntegralGestionAirbnb

INSERT INTO catalog.Caracteristica (nombre, tipo_dato, descripcion)
SELECT 'Ascensor', 'BOOLEAN', 'Indica si el inmueble cuenta con ascensor'
WHERE NOT EXISTS (SELECT 1 FROM catalog.Caracteristica WHERE nombre = 'Ascensor');

INSERT INTO catalog.Caracteristica (nombre, tipo_dato, descripcion)
SELECT 'Estacionamiento', 'BOOLEAN', 'Indica si cuenta con estacionamiento'
WHERE NOT EXISTS (SELECT 1 FROM catalog.Caracteristica WHERE nombre = 'Estacionamiento');

INSERT INTO catalog.Caracteristica (nombre, tipo_dato, descripcion)
SELECT 'Vista exterior', 'BOOLEAN', 'Indica si tiene vista exterior'
WHERE NOT EXISTS (SELECT 1 FROM catalog.Caracteristica WHERE nombre = 'Vista exterior');

INSERT INTO catalog.Caracteristica (nombre, tipo_dato, descripcion)
SELECT 'Tipo de piso', 'TEXTO', 'Material o acabado del piso'
WHERE NOT EXISTS (SELECT 1 FROM catalog.Caracteristica WHERE nombre = 'Tipo de piso');

INSERT INTO catalog.Caracteristica (nombre, tipo_dato, descripcion)
SELECT 'Antig�edad', 'NUMERO', 'A�os aproximados de antig�edad del inmueble'
WHERE NOT EXISTS (SELECT 1 FROM catalog.Caracteristica WHERE nombre = 'Antig�edad');