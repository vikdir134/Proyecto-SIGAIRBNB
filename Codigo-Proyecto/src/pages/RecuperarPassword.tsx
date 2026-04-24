import { Link } from 'react-router-dom';

function RecuperarPassword() {
    return (
        <>
            <header className="main-header">
                <div className="logo-section">
                    <Link to="/">
                        <span className="logo-text">Stay<span className="logo-dot-pe">.pe</span></span>
                    </Link>
                </div>
            </header>

            <main className="login-main">
                <div className="login-container">

                    <div>
                        <span style={{fontSize: '3rem'}}>🔑</span>
                    </div>

                    <h2>¿Olvidaste tu contraseña?</h2>
                    <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.</p>

                    <form action="verificar-email.html">
                        <div className="search-item">
                            <label htmlFor="email-recovery">Correo electrónico</label>
                            <input type="email" id="email-recovery" name="email" placeholder="ejemplo@correo.com" required/>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-margin">Enviar enlace</button>
                    </form>

                    <div>
                        <p>¿Recordaste tu contraseña? <Link to="/Login" className="login-link">Inicia Sesión</Link></p>
                    </div>
                </div>
            </main>

            <footer className="main-footer">
                &copy; 2026 Stay.pe - Sistema Integral de Gestión de Inmuebles
            </footer>
        </>
    );
}

export default RecuperarPassword;