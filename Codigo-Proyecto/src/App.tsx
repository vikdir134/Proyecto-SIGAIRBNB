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
import RutaAdmin from './components/RutaAdmin';
import BusquedaPage from './pages/BusquedaPage';

import RestablecerPassword from './pages/RestablecerPassword';

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

        <Route path='/GestionHome' element={<GestionHome />} />
        <Route path='/GestionPerfil' element={<GestionPerfil />} />
        <Route path='/GestionEdificio' element={<GestionEdificio />} />
        <Route path='/GestionUnidad' element={<GestionUnidad />} />
        <Route path='/GestionMantenimiento' element={<GestionMantenimiento />} />
        <Route path='/GestionAdmin' element={<RutaAdmin><GestionAdmin /></RutaAdmin>}/>
        <Route path="/GestionDisponibilidad" element={<GestionDisponibilidad />} 
        />
        <Route path="/Busqueda" element={<BusquedaPage />} />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;