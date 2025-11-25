import React, { useContext } from 'react'
import { NavLink } from "react-router-dom";
import { AuthContext } from "../src/Authcontext";

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header>
      <h1>Make A Mitsva</h1>

      <NavLink to="/">Home Page</NavLink>

      {user ? (
        <>
          <NavLink to="/myaccount">My Account</NavLink>
          <button onClick={logout} style={{ marginLeft: "500px" }} className="logout-button">
            Logout
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </header>
  );
}

export default Header;
