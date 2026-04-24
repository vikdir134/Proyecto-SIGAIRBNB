import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const handlePerfil = (e: React.FormEvent) => {
        e.preventDefault(); // Evita que la página se recargue por el type="submit"

        // Navega a la ruta del perfil
        navigate('/Perfil');
    };

    return (
        <>
            <body className="auth-body">
                <header className="main-header">
                    <div className="logo-section">
                        <Link to="/">
                            <span className="logo-text">Stay<span className="logo-dot-pe">.pe</span></span>
                        </Link>
                    </div>
                </header>

                <main className="login-main">
                    <div className="login-container">
                        <h2>¡Bienvenido de nuevo!</h2>
                        <p>Ingresa tus credenciales para acceder</p>

                        <form action="perfil.html" method="GET">
                            <div className="search-item">
                                <label htmlFor="email">Correo electrónico</label>
                                <input type="email" id="email" name="email" placeholder="ejemplo@correo.com" required />
                            </div>

                            <div className="search-item">
                                <label htmlFor="password">Contraseña</label>
                                <input type="password" id="password" name="password" placeholder="••••••••" required />
                            </div>

                            <div>
                                <Link to="/RecuperarPassword" className="login-link">¿Olvidaste tu contraseña?</Link>
                            </div>

                            <button onClick={handlePerfil} type="submit"
                                className="btn btn-primary btn-block btn-margin">Ingresar</button>
                        </form>

                        <div>
                            <p>¿No tienes una cuenta? <Link to="/Registro" className="login-link auth-link">Regístrate aquí</Link></p>
                        </div>
                    </div>
                </main>

                <footer className="main-footer">
                    &copy; 2026 Stay.pe - Sistema Integral de Gestión de Inmuebles
                </footer>
            </body>
        </>
    );
}

export default Login;