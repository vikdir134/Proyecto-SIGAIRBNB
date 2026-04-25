import SidebarGestion from '../components/SidebarGestion';

function GestionHome() {
    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Dashboard</h1>
                    <p>Bienvenido al panel de gestión de Stay.pe.</p>
                </section>

                <section className="gestion-card">
                    <h2>Resumen general</h2>
                    <p>
                        Desde este panel podrás gestionar edificios, pisos, locales,
                        mantenimiento y perfil de usuario.
                    </p>

                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3>Edificios</h3>
                            <p>0 registrados</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Pisos / Locales</h3>
                            <p>0 registrados</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Mantenimientos</h3>
                            <p>0 pendientes</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default GestionHome;