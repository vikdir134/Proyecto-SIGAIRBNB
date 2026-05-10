import { useEffect, useState } from 'react';
import SidebarGestion from '../components/SidebarGestion';

import {
    listarUsuariosAdmin,
    inactivarUsuarioAdmin,
    reactivarUsuarioAdmin,
    type UsuarioAdmin
} from '../services/adminService';

function GestionAdmin() {
    const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioAdmin | null>(null);

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [accionConfirmacion, setAccionConfirmacion] = useState<'INACTIVAR' | 'REACTIVAR' | null>(null);

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            setMensaje('');
            setError('');

            const data = await listarUsuariosAdmin();
            setUsuarios(data.usuarios || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const abrirConfirmacion = (usuario: UsuarioAdmin, accion: 'INACTIVAR' | 'REACTIVAR') => {
        setUsuarioSeleccionado(usuario);
        setAccionConfirmacion(accion);
        setMostrarConfirmacion(true);
        setMensaje('');
        setError('');
    };

    const ejecutarAccion = async () => {
        if (!usuarioSeleccionado || !accionConfirmacion) return;

        try {
            setCargando(true);
            setMensaje('');
            setError('');

            if (accionConfirmacion === 'INACTIVAR') {
                await inactivarUsuarioAdmin(usuarioSeleccionado.usuario_id);
                setMensaje('Usuario inactivado correctamente');
            }

            if (accionConfirmacion === 'REACTIVAR') {
                await reactivarUsuarioAdmin(usuarioSeleccionado.usuario_id);
                setMensaje('Usuario reactivado correctamente');
            }

            setMostrarConfirmacion(false);
            setUsuarioSeleccionado(null);
            setAccionConfirmacion(null);

            await cargarUsuarios();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al ejecutar la acción');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Mantenimiento Admin</h1>
                    <p>
                        Administra los usuarios de tu empresa. Puedes visualizar sus datos,
                        revisar sus roles y activar o inactivar cuentas.
                    </p>
                </section>

                {mensaje && <div className="alert-success">{mensaje}</div>}
                {error && <div className="alert-error">{error}</div>}

                <section className="gestion-card">
                    <div className="section-title-row">
                        <div>
                            <h2>Usuarios de la empresa</h2>
                            <p>Listado de usuarios asociados a tu empresa actual.</p>
                        </div>

                        <button
                            type="button"
                            className="btn-gestion-secondary"
                            onClick={cargarUsuarios}
                            disabled={cargando}
                        >
                            Actualizar
                        </button>
                    </div>

                    {cargando && <p>Cargando usuarios...</p>}

                    {!cargando && usuarios.length === 0 && (
                        <p>No hay usuarios registrados en esta empresa.</p>
                    )}

                    {usuarios.length > 0 && (
                        <div className="tabla-responsive">
                            <table className="gestion-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Correo</th>
                                        <th>Roles</th>
                                        <th>Estado</th>
                                        <th>Activo</th>
                                        <th>Último acceso</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usuarios.map((usuario) => {
                                        const nombreCompleto = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();

                                        return (
                                            <tr key={usuario.usuario_id}>
                                                <td>{usuario.usuario_id}</td>
                                                <td>{nombreCompleto || '-'}</td>
                                                <td>{usuario.correo}</td>
                                                <td>{usuario.roles || '-'}</td>
                                                <td>{usuario.estado}</td>
                                                <td>{usuario.activo ? 'Sí' : 'No'}</td>
                                                <td>
                                                    {usuario.ultimo_acceso
                                                        ? new Date(usuario.ultimo_acceso).toLocaleString()
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {usuario.activo ? (
                                                        <button
                                                            type="button"
                                                            className="btn-danger btn-tabla"
                                                            onClick={() => abrirConfirmacion(usuario, 'INACTIVAR')}
                                                            disabled={cargando}
                                                        >
                                                            Inactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn-gestion-primary btn-tabla"
                                                            onClick={() => abrirConfirmacion(usuario, 'REACTIVAR')}
                                                            disabled={cargando}
                                                        >
                                                            Reactivar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {mostrarConfirmacion && usuarioSeleccionado && accionConfirmacion && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <h2>
                                {accionConfirmacion === 'INACTIVAR'
                                    ? 'Confirmar inactivación'
                                    : 'Confirmar reactivación'}
                            </h2>

                            <p>
                                {accionConfirmacion === 'INACTIVAR'
                                    ? '¿Seguro que deseas inactivar este usuario?'
                                    : '¿Seguro que deseas reactivar este usuario?'}
                            </p>

                            <div className="detalle-confirmacion">
                                <p><strong>ID:</strong> {usuarioSeleccionado.usuario_id}</p>
                                <p><strong>Usuario:</strong> {(usuarioSeleccionado.nombres || '') + ' ' + (usuarioSeleccionado.apellidos || '')}</p>
                                <p><strong>Correo:</strong> {usuarioSeleccionado.correo}</p>
                                <p><strong>Estado actual:</strong> {usuarioSeleccionado.estado}</p>
                            </div>

                            <div className="form-actions modal-actions">
                                <button
                                    type="button"
                                    className={accionConfirmacion === 'INACTIVAR' ? 'btn-danger' : 'btn-gestion-primary'}
                                    onClick={ejecutarAccion}
                                    disabled={cargando}
                                >
                                    {accionConfirmacion === 'INACTIVAR'
                                        ? 'Confirmar inactivación'
                                        : 'Confirmar reactivación'}
                                </button>

                                <button
                                    type="button"
                                    className="btn-gestion-secondary"
                                    onClick={() => {
                                        setMostrarConfirmacion(false);
                                        setUsuarioSeleccionado(null);
                                        setAccionConfirmacion(null);
                                    }}
                                    disabled={cargando}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default GestionAdmin;