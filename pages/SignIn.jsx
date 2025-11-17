import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function SignIn() {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  
  

  // ---- Fonction de vérification ----
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
      return "  it needs at least one special character.";
    }
    return ""; // OK
  };

  const handlePassChange = (e) => {
    const value = e.target.value;
    setPass(value);

    const message = validatePassword(value);
    setError(message);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (error !== "") {
      alert("Le mot de passe n'est pas valide");
      return;
    }

    alert("Formulaire envoyé !");
  };

  return (
    <div className="page-container">
      <Header />
      <div className="content">

        <form className="sign-in-form" onSubmit={handleSubmit}>
          <h1>Register to Make A Mitsva</h1>

          <label htmlFor="username"> Name: </label>
          <input id="username" type="text" placeholder="Enter your user name" />

          <label htmlFor="email">E-Mail: </label>
          <input id="email" type="email" placeholder="Enter your mail" />

          <label htmlFor="password">Password: </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            onChange={handlePassChange}
          />

          {error && (
            <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
          )}

          <label htmlFor="tel">Telephone: </label>
          <input id="tel" type="tel" placeholder="Enter your telephone number" />

          <button type="submit" className="submit-button" disabled={error !== ""}>
            Se connecter
          </button>
        </form>

      </div>
      <Footer />
    </div>
  );
}

export default SignIn;
