import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LoginUser } from "../src/Api";
import { AuthContext } from "../src/Authcontext";

import "../src/App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await LoginUser({ email, password });
      login(data); // Save user in context
      setMessage("Logged in successfully");
      navigate("/"); // Redirect to homepage
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Header />

      <div className="content">
        <form className="sign-in-form" onSubmit={handleSubmit}>
          <h1>Login</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}

          <label htmlFor="email">E-mail</label>
          <input
            placeholder="Enter your email"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            placeholder="Enter your password"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Connexion..." : "Login"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
