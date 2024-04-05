
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Inicio from './components/pages/Inicio'
import Reservas from './components/pages/Reservas'

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Inicio/>}/>
        <Route path='/reservas' element={<Reservas/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
