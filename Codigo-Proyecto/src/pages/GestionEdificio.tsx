import SidebarGestion from '../components/SidebarGestion';

function GestionEdificio() {
    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Registrar Edificio</h1>
                    <p>Formulario base para registrar edificios. Las funciones se agregarán después.</p>
                </section>
            </main>
        </div>
    );
}

export default GestionEdificio;