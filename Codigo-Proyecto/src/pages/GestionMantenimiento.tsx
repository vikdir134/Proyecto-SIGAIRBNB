import SidebarGestion from '../components/SidebarGestion';

function GestionMantenimiento() {
    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Mantenimiento</h1>
                    <p>Panel base para registrar y consultar mantenimientos.</p>
                </section>
            </main>
        </div>
    );
}

export default GestionMantenimiento;