import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { registerUser } from "../api/api";

function Register() {
  // States pour les inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");

  // States pour le contrôle du password
  const [error, setError] = useState("");

  const validatePassword = (value) => {
    if (value.length < 8) {
      return "it needs at least 8 characters.";
    }
    if (!/[A-Z]/.test(value)) {
      return "it needs at least one uppercase letter.";
    }
    if (!/[0-9]/.test(value)) {
      return "it needs at least one number.";
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value)) {
      return "it needs at least one special character.";
    }
    return "";
  };

  const handlePassChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const message = validatePassword(value);
    setError(message);
  };

  // === HANDLE SUBMIT BACKEND ===
  async function handleSubmit(e) {
    e.preventDefault();

    if (error !== "") {
      alert("Le mot de passe n'est pas valide");
      return;
    }

    const data = { username, email, password, tel };

    try {
      const response = await registerUser(data);
      console.log("Backend response:", response);
      alert("Compte créé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors du register");
    }
  }

  return (
    <div className="page-container">
      <Header />
      <div className="content">
        <form className="sign-in-form" onSubmit={handleSubmit}>
          <h1>Register to Make A Mitsva</h1>

          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your user name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="email">E-Mail:</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePassChange}
          />

          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          <label htmlFor="phone">Telephone:</label>
          <input
            id="phone"
            type="phone"
            placeholder="Enter your telephone number"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
          <button
            type="submit"
            className="submit-button"
            disabled={error !== ""}
          >
            Create your account
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
