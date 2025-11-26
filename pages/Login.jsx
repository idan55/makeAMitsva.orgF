import React, { useState, useContext } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LoginUser } from '../src/Api'; 
import { AuthContext } from "../src/Authcontext";
import { useNavigate } from "react-router-dom"; // Import pour la redirection

import '../src/App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // Hook pour rediriger

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await LoginUser({ email, password });
    // met l'utilisateur dans le contexte !
    login(data);
    setMessage("User connected");
    navigate('/'); // Redirige vers la page d'accueil
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

      setMessage("Utilisateur connecté");
    } catch (err) {
      setError(err.message);
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

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <label htmlFor="email">E-mail</label>
          <input
            placeholder='Enter your email'
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            placeholder='Enter your password'
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
          {message && <p style={{ color: 'green' }}>{message}</p>}
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Login;