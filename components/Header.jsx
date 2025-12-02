import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../src/Authcontext";
import "../src/App.css";

const API_URL = "http://localhost:4000/api";  // <--- IMPORTANT !!!

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged in");

    const userId = user.id;

    try {
      const res = await fetch(`${API_URL}/users/delete/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        console.warn("Réponse non-JSON reçue.");
      }

      if (res.ok) {
        alert("Account deleted successfully!");
        logout();
        navigate("/");
      } else {
        alert("Error deleting account: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("An error occurred while deleting your account.");
    }
  }

  function toggleMenu() {
    setOpen(!open);
  }

  return (
    <header style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      
      <h1 style={{ marginRight: "20px" }}>Make A Mitsva</h1>

      <NavLink to="/" style={{ marginRight: "12px" }}>Home</NavLink>

      {!user && (
        <>
          <NavLink to="/register" style={{ marginRight: "12px" }}>
            Register
          </NavLink>
          <NavLink to="/login" style={{ marginRight: "12px" }}>
            Login
          </NavLink>
        </>
      )}

      {user && (
        <>
          <NavLink to="/myaccount" style={{ marginRight: "12px" }}>
            My Account
          </NavLink>

          {/* Bouton PLUS à droite mais dans le header */}
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleMenu}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Plus
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "40px",
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid lightgray",
                  borderRadius: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: "10px",
                  minWidth: "150px",
                  zIndex: 20,
                }}
              >
                <button
                  onClick={logout}
                  style={{
                    display: "block",
                    width: "100%",
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    padding: "8px",
                    marginBottom: "10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "left",
                    color:'blue'
                  }}
                >
                  Logout
                </button>

                <button
                  onClick={handleDelete}
                  style={{
                    display: "block",
                    width: "100%",
                    backgroundColor: "#e53935",
                    color: "white",
                    border: "none",
                    padding: "8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
