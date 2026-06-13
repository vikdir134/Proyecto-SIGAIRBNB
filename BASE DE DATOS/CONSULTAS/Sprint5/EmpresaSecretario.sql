CREATE TABLE core.EmpresaSecretario
(
    empresa_secretario_id       INT IDENTITY(1,1) PRIMARY KEY,
    empresa_id                  INT NOT NULL,
    secretario_usuario_id       INT NOT NULL,
    asignado_por_usuario_id     INT NOT NULL,
    activo                      BIT NOT NULL DEFAULT 1,
    fecha_asignacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    fecha_revocacion            DATETIME2 NULL,

    CONSTRAINT FK_EmpresaSecretario_Empresa
        FOREIGN KEY (empresa_id)
        REFERENCES core.Empresa(empresa_id),

    CONSTRAINT FK_EmpresaSecretario_Secretario
        FOREIGN KEY (secretario_usuario_id)
        REFERENCES auth.Usuario(usuario_id),

    CONSTRAINT FK_EmpresaSecretario_AsignadoPor
        FOREIGN KEY (asignado_por_usuario_id)
        REFERENCES auth.Usuario(usuario_id),

    CONSTRAINT UQ_EmpresaSecretario
        UNIQUE (empresa_id, secretario_usuario_id)
);
GO