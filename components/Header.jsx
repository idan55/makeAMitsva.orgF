import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../src/Authcontext";
import "../src/App.css";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="header-row">
        <NavLink to="/" className="brand-link">
          <img
            src="/logo.png"
            alt="Make A Mitsva logo"
            className="brand-logo"
          />
          <h1 className="brand-title">Make A Mitsva</h1>
        </NavLink>

        <div className="header-actions">
          {user?.role === "admin" && (
            <NavLink to="/admin" className="admin-link">
              Admin
            </NavLink>
          )}

          {user ? (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/register" className="pill-link">
                Register
              </NavLink>
              <NavLink to="/login" className="pill-link">
                Login
              </NavLink>
            </>
          )}
        </div>
      </div>

      <nav className="nav-links" aria-label="Primary">
        <NavLink to="/" end>
          Home
        </NavLink>
        {user && <NavLink to="/myaccount">My Account</NavLink>}
      </nav>
    </header>
  );
}

export default Header;
