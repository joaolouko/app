import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Inicio from './components/pages/Inicio';
import ReservarSala from './components/pages/ReservarSala';
import Login from './components/pages/Login';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/reservar' element={<ReservarSala />} />
                <Route path='/inicio' element={<Inicio />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
