import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function Perfil() {
    const navigate = useNavigate();

    const handleHomePage = (e: React.FormEvent) => {
        e.preventDefault(); // Evita que la página se recargue por el type="submit"

        // Navega a la ruta del perfil
        navigate('/');
    };

    return (
        <>
            <header className="main-header">
                <div className="logo-section">
                    <Link to="/">
                        <span className="logo-text">Stay<span className="logo-dot-pe">.pe</span></span>
                    </Link>
                </div>

                <nav className="main-nav">
                    <Link to="#">Mis Reservas</Link>
                    <Link to="#">Ayuda</Link>
                </nav>

                <div className="header-actions">
                    <button className="btn btn-primary">Juan Perez</button>
                    <button className="btn btn-accent" onClick={handleHomePage}>Cerrar Sesión</button>
                </div>

            </header>

            {/* HU02: Edición de nombre y foto de perfil */}
            <main className="profile-main">
                <section>
                    <div className="section">
                        <h1>Configuración de Perfil</h1>
                        <p className="section-description">Gestiona tu información personal y preferencias de contacto.</p>
                    </div>

                    <form>
                        <div>
                            <div>
                                <img src="" alt="Foto de perfil"/>
                            </div>
                            <div>
                                <label htmlFor="photo-upload" className="btn btn-primary btn-margin">Cambiar foto</label>
                                <input type="file" id="photo-upload" accept="image/*" style={{display: 'none'}}/>
                                <p>JPG o PNG. Máximo 2MB.</p>
                            </div>
                        </div>

                        <div className="section">
                            <div>
                                <label htmlFor="nombre">Nombre</label>
                                <input type="text" id="nombre" value="Juan" placeholder="Tu nombre"/>
                            </div>

                            <div>
                                <label htmlFor="apellido">Apellidos</label>
                                <input type="text" id="apellido" value="Pérez" placeholder="Tus apellidos"/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="email-display">Correo Electrónico</label>
                                <input type="email" id="email-display" value="juan.perez@ejemplo.com" disabled/>
                                <small>El correo no se puede cambiar por seguridad.</small>
                            </div>
                        </div>

                        <hr/>

                        {/* HU02: Configuración de notificaciones */}
                        <div>
                            <h3>Preferencias de Notificaciones</h3>
                            <div>
                                <label>
                                    <input type="checkbox" checked name="notif-email"/>
                                        Recibir alertas de reservas por Email
                                </label>
                                <label>
                                    <input type="checkbox" name="notif-push"/>
                                        Recibir notificaciones Push en el navegador
                                </label>
                            </div>
                        </div>

                        <div className="section">
                            <button type="submit" className="btn btn-light btn-margin">Cancelar</button>
                            <button type="submit" className="btn btn-primary btn-margin">Guardar Cambios</button>
                        </div>
                    </form>
                </section>
            </main>

            <footer className="main-footer">
                &copy; 2026 Stay.pe - Sistema Integral de Gestión de Inmuebles
            </footer>
        </>
    );
}

export default Perfil;