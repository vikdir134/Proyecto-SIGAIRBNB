import SidebarGestion from '../components/SidebarGestion';

function GestionUnidad() {
    return (
        <div className="gestion-layout">
            <SidebarGestion />

            <main className="gestion-main">
                <section className="gestion-header-card">
                    <h1>Registrar Piso / Local</h1>
                    <p>Formulario base para registrar pisos o locales. Las funciones se agregarán después.</p>
                </section>
            </main>
        </div>
    );
}

export default GestionUnidad;