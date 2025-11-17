import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'
import Home from '../pages/home';
import SignIn from '../pages/SignIn';
import Myaccount from '../pages/Myaccount';
import 'leaflet/dist/leaflet.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/register' element={<SignIn/>} />
        <Route path='/myaccount' element={<Myaccount/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
