import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { registerUser } from "../src/Api";

function Register() {
  // States pour les inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [feedback, setFeedback] = useState(""); // message text
  const [feedbackType, setFeedbackType] = useState(""); // "success" or "error"

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
  async function handleSubmit(e) {
    e.preventDefault();

    if (error !== "") {
      setFeedback("Password is not valid");
      setFeedbackType("error");
      return;
    }

    const data = { name, age, email, password, phone };

    try {
      const response = await registerUser(data);

      // response.message comes from backend: "registration completed"
      setFeedback(response.message || "Account created!");
      setFeedbackType("success");
      console.log("Backend response:", response);
    } catch (err) {
      console.error(err);
      // err.message is whatever backend sent in data.error
      setFeedback(err.message);
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
          />
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            placeholder="Enter your age"
            value={age}
            min={16}
            max={120}
            onChange={(e) => setAge(e.target.value)}
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

          <label htmlFor="phone">phone:</label>
          <input
            id="phone"
            type="phone"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
