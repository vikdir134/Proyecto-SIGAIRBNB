import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Registro from './pages/Registro';
import VerificarEmail from './pages/VerificarEmail';
import RecuperarPassword from './pages/RecuperarPassword';

import GestionHome from './pages/GestionHome';
import GestionPerfil from './pages/GestionPerfil';
import GestionEdificio from './pages/GestionEdificio';
import GestionUnidad from './pages/GestionUnidad';
import GestionMantenimiento from './pages/GestionMantenimiento';
import GestionAdmin from './pages/GestionAdmin';
import GestionDisponibilidad from './pages/GestionDisponibilidad';
import RutaGestionReservas from './components/RutaGestionReservas';
import RutaAdmin from './components/RutaAdmin';
import BusquedaPage from './pages/BusquedaPage';
import RestablecerPassword from './pages/RestablecerPassword';
import GestionPublicacion from './pages/GestionPublicacion';
import MisSolicitudesReserva from './pages/MisSolicitudesReserva';
import GestionSolicitudesReserva from './pages/GestionSolicitudesReserva';
import GestionConceptosCobro from './pages/GestionConceptosCobro';
import MisPagos from './pages/MisPagos';
import GestionIngresosAlquiler from './pages/GestionIngresosAlquiler';
import GestionTarifas from './pages/GestionTarifas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/Perfil' element={<Perfil />} />
        <Route path='/Registro' element={<Registro />} />
        <Route path='/VerificarEmail' element={<VerificarEmail />} />
        <Route path='/RecuperarPassword' element={<RecuperarPassword />} />
        <Route path='/RestablecerPassword' element={<RestablecerPassword />} />
            <Route
            path="/gestion/conceptos-cobro"
            element={
                <RutaGestionReservas>
                    <GestionConceptosCobro />
                </RutaGestionReservas>
            }
        />
        <Route
            path="/GestionHome"
            element={
                <RutaAdmin>
                    <GestionHome />
                </RutaAdmin>
            }
        />
        <Route path='/GestionPerfil' element={<GestionPerfil />} />
        <Route
            path="/GestionEdificio"
            element={
                <RutaAdmin>
                    <GestionEdificio />
                </RutaAdmin>
            }
        />
        <Route
            path="/GestionUnidad"
            element={
                <RutaAdmin>
                    <GestionUnidad />
                </RutaAdmin>
            }
        />
        <Route
            path="/GestionMantenimiento"
            element={
                <RutaAdmin>
                    <GestionMantenimiento />
                </RutaAdmin>
            }
        />
        <Route
            path="/GestionAdmin"
            element={
                <RutaAdmin>
                    <GestionAdmin />
                </RutaAdmin>
            }
        />
        <Route
            path="/GestionDisponibilidad"
            element={
                <RutaAdmin>
                    <GestionDisponibilidad />
                </RutaAdmin>
            }
        />
        <Route path="/Busqueda" element={<BusquedaPage />} />

        <Route
            path="/GestionPublicacion"
            element={
                <RutaAdmin>
                    <GestionPublicacion />
                </RutaAdmin>
            }
        />

        <Route
    path="/gestion/ingresos-alquiler"
    element={
        <RutaGestionReservas>
            <GestionIngresosAlquiler />
        </RutaGestionReservas>
    }
/>
        <Route path="/MisSolicitudesReserva" element={<MisSolicitudesReserva />} />
        <Route
            path="/GestionSolicitudesReserva"
            element={
                <RutaGestionReservas>
                    <GestionSolicitudesReserva />
                </RutaGestionReservas>
            }
        />
        <Route path="/Mispagos" element={<MisPagos />} />
        <Route path="/GestionTarifas" element={<GestionTarifas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;