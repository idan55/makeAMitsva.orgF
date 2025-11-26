import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { registerUser, LoginUser } from "../src/Api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../src/Authcontext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const validatePassword = (value) => {
    if (value.length < 8) return "it needs at least 8 characters.";
    if (!/[A-Z]/.test(value)) return "it needs at least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "it needs at least one number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value)) return "it needs at least one special character.";
    return "";
  };

  const handlePassChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const message = validatePassword(value);
    setError(message);
  };

  async function handleSubmit(e) {
    e.preventDefault();
  
    // Vérification finale du mot de passe
    const passwordError = validatePassword(password);
    if (passwordError !== "") {
      setFeedback("Password is not valid: " + passwordError);
      setFeedbackType("error");
      return;
    }
  
    const data = { name, age, email, password, phone };
  
    try {
      console.log("1️⃣ Creating account...");
      await registerUser(data);
  
      console.log("2️⃣ Logging in automatically...");
      const loginData = await LoginUser({ email, password });
      
      console.log("3️⃣ Saving user to context:", loginData.user);
      login(loginData.user);
  
      setFeedback("Account created and logged in!");
      setFeedbackType("success");
  
      setTimeout(() => {
        navigate('/');
      }, 1500);
  
    } catch (err) {
      console.error("❌ Error:", err);
      setFeedback(err.message || "An error occurred");
      setFeedbackType("error");
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="age">Age:</label>
          <input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={age}
            min={16}
            max={120}
            onChange={(e) => setAge(e.target.value)}
            required
          />

          <label htmlFor="email">E-Mail:</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePassChange}
            required
          />

          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          <label htmlFor="phone">Phone:</label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <button
            type="submit"
            className="submit-button"
            disabled={error !== ""}
          >
            Create your account
          </button>

          {feedback && (
            <p
              style={{
                color: feedbackType === "error" ? "red" : "green",
                marginTop: "10px",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              {feedback}
            </p>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Register;