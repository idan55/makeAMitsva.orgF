import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '..src/App.css'
function Login() {
  return (
    <div className="page-container">
      <Header />

      <div className="content">
        <form className="sign-in-form">
          <h1>Login</h1>

          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" />

          <button type="submit" className="submit-button">Login</button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
