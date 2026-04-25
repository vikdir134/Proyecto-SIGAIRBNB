import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;