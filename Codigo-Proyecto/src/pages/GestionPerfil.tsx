import SidebarGestion from '../components/SidebarGestion';

function GestionPerfil() {
    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Modificar Perfil</h1>
                    <p>Actualiza tu información personal para mantener tus datos al día dentro de la plataforma.</p>
                </section>

                <section className="gestion-card">
                    <h2>Datos básicos</h2>
                    <p>Edita la información principal de tu cuenta.</p>

                    <div className="gestion-form-grid">
                        <div className="gestion-field">
                            <label>Nombre</label>
                            <input type="text" placeholder="Victor Antonio" />
                        </div>

                        <div className="gestion-field">
                            <label>Apellidos</label>
                            <input type="text" placeholder="Camargo" />
                        </div>

                        <div className="gestion-field">
                            <label>Correo electrónico</label>
                            <input type="email" placeholder="victor@correo.com" />
                        </div>

                        <div className="gestion-field">
                            <label>Teléfono</label>
                            <input type="text" placeholder="999 999 888" />
                        </div>

                        <div className="gestion-field">
                            <label>Ciudad</label>
                            <input type="text" placeholder="Lima" />
                        </div>

                        <div className="gestion-field">
                            <label>Fecha de Nacimiento</label>
                            <input type="date" />
                        </div>
                    </div>
                </section>

                <section className="gestion-card">
                    <h2>Foto de perfil</h2>
                    <p>Cambia tu imagen para personalizar tu cuenta.</p>

                    <div className="photo-box">
                        <div>
                            <strong>Subir nueva imagen</strong>
                            <p>Formatos sugeridos: JPG o PNG. Tamaño recomendado: 400 x 400 px.</p>
                        </div>

                        <div className="photo-actions">
                            <button className="btn-light">Elegir archivo</button>
                            <button className="btn-primary-small">Cambiar imagen</button>
                        </div>
                    </div>
                </section>

                <section className="gestion-card">
                    <h2>Preferencias</h2>
                    <p>Ajusta las opciones básicas de tu experiencia en la plataforma.</p>

                    <div className="gestion-form-grid">
                        <div className="gestion-field">
                            <label>Idioma</label>
                            <input type="text" placeholder="Español" />
                        </div>

                        <div className="gestion-field">
                            <label>Zona horaria</label>
                            <input type="text" placeholder="Perú GMT -5" />
                        </div>
                    </div>

                    <div className="preference-row">
                        <div>
                            <strong>Recibir notificaciones por correo</strong>
                            <p>Avisos de reservas, cambios en inmuebles y actividad importante.</p>
                        </div>
                        <input type="checkbox" defaultChecked />
                    </div>

                    <div className="preference-row">
                        <div>
                            <strong>Recibir recordatorios del sistema</strong>
                            <p>Notificaciones sobre tareas pendientes y actualizaciones del perfil.</p>
                        </div>
                        <input type="checkbox" defaultChecked />
                    </div>
                </section>

                <div className="gestion-actions">
                    <button className="btn-save">Guardar cambios</button>
                    <button className="btn-reset">Restablecer</button>
                </div>
            </main>
        </div>
    );
}

export default GestionPerfil;