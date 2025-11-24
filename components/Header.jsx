import React from 'react'
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header>
        <h1>Make A Mitsva</h1>
    <NavLink to="/">
        Home Page
    </NavLink>
    <NavLink to="/login">
       Login
    </NavLink>
    <NavLink to="/register">
        Register
    </NavLink>
    <NavLink to="/myaccount">
        My Account
    </NavLink>
    
    
    
    </header>
  )
}

export default Header