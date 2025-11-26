import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../src/Authcontext";

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header>
      <h1>Make A Mitsva</h1>

      <NavLink to="/">Home</NavLink>

      {!user && (
        <>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/login">Login</NavLink>
        </>
      )}

      {user && (
        <>
          <NavLink to="/myaccount">My Account</NavLink>
          <button onClick={logout} style={{ marginLeft: "12px" }}>
            Logout
          </button>
        </>
      )}
    </header>
  );
}

export default Header;
