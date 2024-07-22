
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Inicio from './components/pages/Inicio'
import ReservarSala from './components/pages/ReservarSala'

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Inicio/>}/>
        <Route path='/reservar' element={<ReservarSala/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
