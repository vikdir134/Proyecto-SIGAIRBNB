IF COL_LENGTH('finance.TarifaInmueble', 'indice_ipc_id') IS NULL
BEGIN
    ALTER TABLE finance.TarifaInmueble
    ADD indice_ipc_id INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_TarifaInmueble_IndiceIPC'
)
BEGIN
    ALTER TABLE finance.TarifaInmueble
    ADD CONSTRAINT FK_TarifaInmueble_IndiceIPC
    FOREIGN KEY (indice_ipc_id)
    REFERENCES finance.IndiceIPC(indice_ipc_id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_TarifaInmueble_Inmueble_IPC'
      AND object_id = OBJECT_ID('finance.TarifaInmueble')
)
BEGIN
    CREATE UNIQUE INDEX UX_TarifaInmueble_Inmueble_IPC
    ON finance.TarifaInmueble(inmueble_id, indice_ipc_id)
    WHERE indice_ipc_id IS NOT NULL;
END
GO