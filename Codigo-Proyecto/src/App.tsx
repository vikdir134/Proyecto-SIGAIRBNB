import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Registro from './pages/Registro';
import VerificarEmail from './pages/VerificarEmail';
import RecuperarPassword from './pages/RecuperarPassword';

function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/Login' element={<Login/>}/>
        <Route path='/Perfil' element={<Perfil/>}/>
        <Route path='/Registro' element={<Registro/>}/>
        <Route path='/VerificarEmail' element={<VerificarEmail/>}/>
        <Route path='/RecuperarPassword' element={<RecuperarPassword/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;