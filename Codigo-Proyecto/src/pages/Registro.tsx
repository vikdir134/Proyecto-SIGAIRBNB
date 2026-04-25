import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../services/api';

function Registro() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombres: '',
        apellidos: '',
        correo: '',
        password: '',
        acepta_terminos: false
    });

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();

        setMensaje('');
        setError('');
        setCargando(true);

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.mensaje || 'Error al registrar usuario');
                return;
            }

            setMensaje('Registro correcto. Ahora puedes verificar tu email.');

            setTimeout(() => {
                navigate('/VerificarEmail');
            }, 1000);

        } catch (error) {
            setError('No se pudo conectar con el servidor');
        } finally {
            setCargando(false);
        }
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
                        <form onSubmit={handleRegistro}>
                            <h2>Crea tu cuenta</h2>
                            <p>Únete a Stay.pe para gestionar tus alquileres.</p>

                            <div className="search-item">
                                <label htmlFor="nombres">Nombres</label>
                                <input
                                    type="text"
                                    id="nombres"
                                    name="nombres"
                                    required
                                    placeholder="Juan"
                                    value={form.nombres}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="search-item">
                                <label htmlFor="apellidos">Apellidos</label>
                                <input
                                    type="text"
                                    id="apellidos"
                                    name="apellidos"
                                    required
                                    placeholder="Pérez"
                                    value={form.apellidos}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="search-item">
                                <label htmlFor="correo">Email</label>
                                <input
                                    type="email"
                                    id="correo"
                                    name="correo"
                                    required
                                    placeholder="juan@correo.com"
                                    value={form.correo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="search-item">
                                <label htmlFor="password">Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="search-item">
                                <label className="checkbox-row">
                                    <input
                                        type="checkbox"
                                        name="acepta_terminos"
                                        checked={form.acepta_terminos}
                                        onChange={handleChange}
                                    />
                                    Acepto los términos y condiciones
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-margin"
                                disabled={cargando}
                            >
                                {cargando ? 'Registrando...' : 'Registrarse'}
                            </button>

                            {mensaje && <p className="success-message">{mensaje}</p>}
                            {error && <p className="error-message">{error}</p>}

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