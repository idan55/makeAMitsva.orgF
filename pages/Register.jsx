import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { registerUser, LoginUser } from "../src/Api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../src/Authcontext";
import { normalizeIsraeliPhone } from "../src/phoneUtils";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [profileImage, setProfileImage] = useState(""); 
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Validation mot de passe
  const validatePassword = (value) => {
    if (value.length < 8) return "At least 8 characters.";
    if (!/[A-Z]/.test(value)) return "At least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "At least one number.";
    return "";
  };

  const handlePassChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError(validatePassword(value));
  };

  // Upload image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfileImage(data.url);
      setFeedback("Image uploaded successfully");
    } catch (err) {
      console.error(err);
      setFeedback("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);

    const normalized = normalizeIsraeliPhone(value);
    if (value && !normalized) {
      setPhoneError("Use an Israeli number like +9725XXXXXXXX");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const pwdError = validatePassword(password);
    if (pwdError) {
      setFeedback("Password error: " + pwdError);
      return;
    }

    const normalizedPhone = normalizeIsraeliPhone(phone);
    if (!normalizedPhone) {
      setFeedback("Please enter a valid Israeli phone number (+9725XXXXXXXX).");
      setPhoneError("Use an Israeli number like +9725XXXXXXXX");
      return;
    }
    
    if (!profileImage) {
      setFeedback("Please upload a profile image.");
      return;
    }
  
    try {
      const userData = { name, age, email, password, phone: normalizedPhone, profileImage };
      const registerResponse = await registerUser(userData);
      
      // Prefer token from register response; otherwise fallback to login
      if (registerResponse?.token && registerResponse?.user) {
        login({ user: registerResponse.user, token: registerResponse.token });
        localStorage.setItem("user", JSON.stringify(registerResponse.user));
        localStorage.setItem("token", registerResponse.token);
      } else {
        const loginData = await LoginUser({ email, password });
        login(loginData);
      }
  
      setPhone(normalizedPhone); // reflect the normalized number in the form
      setFeedback("Account created and logged in!");
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      console.error("❌ Registration error:", err);
      setFeedback(err.message || "Registration failed");
    }
  };

  return (
    <div className="page-container">
      <Header />
      <div className="content" style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", background: "#f9f9f9", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h1 style={{ textAlign: "center" }}>Register</h1>

          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} required min={16} max={120} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input type="password" placeholder="Password" value={password} onChange={handlePassChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
          <input
            type="tel"
            placeholder="Phone (e.g. +9725XXXXXXXX)"
            value={phone}
            onChange={handlePhoneChange}
            onBlur={() => {
              const normalized = normalizeIsraeliPhone(phone);
              if (normalized) setPhone(normalized);
            }}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          {phoneError && <p style={{ color: "red", fontSize: "14px" }}>{phoneError}</p>}

          <label>Profile Picture:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {isUploading && <p>Uploading image...</p>}
          {profileImage && <img src={profileImage} alt="Preview" style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginTop: "10px" }} />}

          <button
            type="submit"
            disabled={error !== "" || phoneError !== "" || isUploading || !profileImage}
            style={{ padding: "12px", borderRadius: "8px", background: "#2196f3", color: "white", fontWeight: "bold", border: "none", cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading || !profileImage ? 0.6 : 1 }}
          >
            Register
          </button>

          {feedback && <p style={{ color: feedback.includes("error") ? "red" : "green", textAlign: "center", fontWeight: "bold" }}>{feedback}</p>}
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
