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
  const [profileImage, setProfileImage] = useState(""); // URL de Cloudinary
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  // Validation du mot de passe
  const validatePassword = (value) => {
    if (value.length < 8) return "It needs at least 8 characters.";
    if (!/[A-Z]/.test(value)) return "It needs at least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "It needs at least one number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value))
      return "It needs at least one special character.";
    return "";
  };

  const handlePassChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const message = validatePassword(value);
    setError(message);
  };

  // Upload de l'image vers le backend (qui upload sur Cloudinary)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setProfileImage(data.url); // Stocke seulement l'URL
    } catch (err) {
      console.error("Image upload error:", err);
      setFeedback("Error uploading image");
      setFeedbackType("error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setFeedback("Password is not valid: " + passwordError);
      setFeedbackType("error");
      return;
    }

    const data = { name, age, email, password, phone, profileImage };

    try {
      // Enregistre l'utilisateur dans la DB
      await registerUser(data);
      // Login automatique après inscription
      const loginData = await LoginUser({ email, password });
      login(loginData);

      setFeedback("Account created and logged in!");
      setFeedbackType("success");

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("❌ Error:", err);
      setFeedback(err.message || "An error occurred");
      setFeedbackType("error");
    }
  };

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

          {error && <p style={{ color: "red" }}>{error}</p>}

          <label htmlFor="phone">Phone:</label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          {/* Upload d'image */}
          <label>Profile Picture:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {profileImage && (
            <img
              src={profileImage}
              alt="Profile preview"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                marginTop: "10px",
              }}
            />
          )}

          <button type="submit" className="submit-button" disabled={error !== ""}>
            Create your account
          </button>

          {feedback && (
            <p
              style={{
                color: feedbackType === "error" ? "red" : "green",
                marginTop: "10px",
                fontSize: "16px",
                fontWeight: "bold",
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
