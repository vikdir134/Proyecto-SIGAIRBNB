import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Registro() {
    const navigate = useNavigate();

    const handleVerificarEmail = (e: React.FormEvent) => {
        e.preventDefault(); // Evita que la página se recargue por el type="submit"

        // Navega a la ruta del perfil
        navigate('/VerificarEmail');
    };

    return (
        <>
            <div className="auth-body">
                <header className="main-header">
                    <div className="logo-section">
                        <Link to="/">
                            <span className="logo-text">Stay<span className="logo-dot-pe">.pe</span></span>
                        </Link>
                    </div>
                </header>

                <main className="login-main">
                    <div className="login-container">
                        <form>
                            <h2>Crea tu cuenta</h2>
                            <p>Únete a Stay.pe para gestionar tus alquileres.</p>

                            <div className="search-item">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" required placeholder="juan@correo.com" />
                            </div>

                            <div className="search-item">
                                <label htmlFor="password">Contraseña</label>
                                <input type="password" id="password" required placeholder="Mínimo 8 caracteres" />
                            </div>

                            {/* HU01: Verificación de email */}
                            <button onClick={handleVerificarEmail} type="submit"
                                className="btn btn-primary btn-block btn-margin">Registrarse</button>
                            <p>¿Ya tienes cuenta? <Link to="/Login" className="login-link">Inicia sesión</Link></p>
                        </form>
                    </div>
                </main>

                <footer className="main-footer">
                    &copy; 2026 Stay.pe - Sistema Integral de Gestión de Inmuebles
                </footer>
            </div>
        </>
    );
}

export default Registro;