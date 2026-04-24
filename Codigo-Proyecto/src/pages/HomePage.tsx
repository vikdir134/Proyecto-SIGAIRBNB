import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <>
            <header className="main-header">
                <div className="logo-section">
                    <span className="logo-text">Stay<span className="logo-dot-pe">.pe</span></span>
                </div>

                <nav className="main-nav">
                    <Link to="#">Alojamiento</Link>
                    <Link to="#">Explorar</Link>
                    <Link to="#">Ayuda</Link>
                </nav>

                <div className="header-actions">
                    {/* HU08: acceso inicial para publicar un inmueble. */}
                    {/* La publicación real se completa después del login y según el rol */}
                    <Link to="#" className="btn btn-light">Publica tu inmueble</Link>

                    {/* HU01: Formulario de registro con email y contraseña */}
                    <Link to="/Registro" className="btn btn-light">Crear cuenta</Link>

                    {/* HU01: inicio de sesión */}
                    <Link to="/Login" className="btn btn-primary">Iniciar sesión</Link>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="container-home">
                        <h1>Encuentra el inmueble ideal para ti</h1>
                        <p className="hero-description">
                            Busca pisos, locales y edificios disponibles de forma rápida y sencilla.
                        </p>

                        {/* HU07: búsqueda de inmuebles */}
                        <div className="search-bar">
                            <div className="search-item">
                                <label htmlFor="ubicacion">Dónde</label>
                                <input type="text" id="ubicacion" placeholder="Distrito o dirección"/>
                            </div>

                            <div className="search-item">
                                <label htmlFor="fecha-ingreso">Fecha ingreso</label>
                                <input type="date" id="fecha-ingreso"/>
                            </div>

                            <div className="search-item">
                                <label htmlFor="fecha-salida">Fecha salida</label>
                                <input type="date" id="fecha-salida"/>
                            </div>

                            <div className="search-item">
                                <label htmlFor="tipo">Tipo</label>
                                <select id="tipo">
                                    <option value="">Seleccione</option>
                                    <option>Piso</option>
                                    <option>Local</option>
                                    <option>Edificio</option>
                                </select>
                            </div>

                            <div className="search-button-box">
                                {/* HU07: acción de buscar */}
                                <button className="btn btn-accent">Buscar</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container-home section">
                    {/* HU07: exploración por categorías */}
                    <h2>Explora por categoría</h2>
                    <div className="categories">
                        <div className="category-chip">Pisos</div>
                        <div className="category-chip">Locales</div>
                        <div className="category-chip">Edificios</div>
                        <div className="category-chip">Amoblados</div>
                        <div className="category-chip">Cerca al centro</div>
                    </div>
                </section>

                <section className="container-home section">
                    {/* HU07: visualización de inmuebles */}
                    <h2>Inmuebles destacados</h2>
                    <p className="section-description">
                        Algunos espacios disponibles para alquilar dentro de la plataforma.
                    </p>

                    <div className="property-grid">
                        <article className="property-card">
                            <div className="property-image">
                                <img src="/images/piso-san-miguel.jpg" alt="Piso en San Miguel"/>
                            </div>
                            <div className="property-info">
                                <h3>Piso en San Miguel</h3>
                                <p>2 habitaciones · 1 baño · 3 personas</p>
                                <p className="property-location">San Miguel, Lima</p>
                                <p className="property-price">S/ 1,500 / mes</p>
                                <div className="property-actions">
                                    {/* HU07: ver detalle del inmueble */}
                                    <button className="btn btn-secondary">Ver detalle</button>

                                    {/* HU09: solicitud de reserva */}
                                    <button className="btn btn-primary">Reservar</button>
                                </div>
                            </div>
                        </article>

                        <article className="property-card">
                            <div className="property-image">
                                <img src="/images/local-jesus-maria.jpg" alt="Local en Jesús María"/>
                            </div>
                            <div className="property-info">
                                <h3>Local en Jesús María</h3>
                                <p>60 m² · Zona comercial · 1 ambiente</p>
                                <p className="property-location">Jesús María, Lima</p>
                                <p className="property-price">S/ 2,200 / mes</p>
                                <div className="property-actions">
                                    {/* HU07: ver detalle del inmueble */}
                                    <button className="btn btn-secondary">Ver detalle</button>

                                    {/* HU09: solicitud de reserva */}
                                    <button className="btn btn-primary">Reservar</button>
                                </div>
                            </div>
                        </article>

                        <article className="property-card">
                            <div className="property-image">
                                <img src="/images/edificio-miraflores.jpg" alt="Edificio en Miraflores"/>
                            </div>
                            <div className="property-info">
                                <h3>Edificio en Miraflores</h3>
                                <p>3 niveles · Uso mixto · Alta demanda</p>
                                <p className="property-location">Miraflores, Lima</p>
                                <p className="property-price">S/ 8,000 / mes</p>
                                <div className="property-actions">
                                    {/* HU07: ver detalle del inmueble */}
                                    <button className="btn btn-secondary">Ver detalle</button>

                                    {/* HU09: solicitud de reserva */}
                                    <button className="btn btn-primary">Reservar</button>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="container-home section host-section">
                    <div className="host-box">
                        <h2>¿Tienes un inmueble para alquilar?</h2>
                        <p>
                            Publica tu piso, local o edificio y llega a más interesados.
                        </p>

                        {/* HU08: acceso inicial a publicar inmueble */}
                        <button className="btn btn-primary">Comenzar a publicar</button>
                    </div>
                </section>
            </main>

            <footer className="main-footer">
                &copy; 2026 Stay.pe - Sistema Integral de Gestión de Inmuebles
            </footer>
        </>
    )
}

export default HomePage;