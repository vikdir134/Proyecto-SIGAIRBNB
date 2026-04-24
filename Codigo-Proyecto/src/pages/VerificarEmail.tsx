import { Link } from 'react-router-dom';

function VerificarEmail() {
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

                        <div>
                            <span style={{ fontSize: '3rem' }}>✉️</span>
                        </div>

                        <h2>¡Casi listo!</h2>
                        <p>Hemos enviado un enlace de confirmación a tu correo electrónico.</p>

                        <div>
                            <p>Por favor, revisa tu <strong>bandeja de entrada</strong> y haz clic en el botón para activar tu cuenta y poder iniciar sesión.</p>
                            <p>¿No recibiste nada? Revisa tu <strong>carpeta de spam</strong> o <strong>correo no deseado</strong> .</p>
                        </div>

                        <div>
                            <Link to="/Login" className="btn btn-primary btn-block">Ir al Inicio de Sesión</Link>
                        </div>
                    </div>
                </main>

                <footer className="main-footer">
                    &copy; 2026 Stay.pe - Sistema Integral de Gestión de Inmuebles
                </footer>
            </div>
        </>
    );
}

export default VerificarEmail;