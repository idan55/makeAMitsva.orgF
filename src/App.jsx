import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'
import Home from '../pages/home';
import Register from '../pages/Register';
import Myaccount from '../pages/Myaccount';
import 'leaflet/dist/leaflet.css';
import Login from '../pages/Login';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/myaccount' element={<Myaccount/>} />
        <Route path='/login' element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
