import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Inicio from './components/pages/Inicio';
import ReservarSala from './components/pages/ReservarSala';
import Login from './components/pages/Login';
import Admin from './components/pages/Admin';
import PrivateRoute from './components/PrivateRoute';
import VerReservas from './components/pages/VerReservas';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/reservar' element={<PrivateRoute><ReservarSala /></PrivateRoute>} />
                <Route path='/ver-reserva' element={<PrivateRoute><VerReservas /></PrivateRoute>} />
                <Route path='/inicio' element={<PrivateRoute><Inicio /></PrivateRoute>} />
                <Route path='/admin' element={<PrivateRoute><Admin/></PrivateRoute>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
