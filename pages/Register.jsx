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
  const [feedback, setFeedback] = useState(null);
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
  const compressImage = (file, maxDim = 1200, quality = 0.7) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height >= width && height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Compression failed"));
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    console.log("📤 File selected:", file.name); // ✅ Debug
    setIsUploading(true);
    try {
      const workingFile =
        file.size > 5 * 1024 * 1024 ? await compressImage(file) : file;

      const formData = new FormData();
      formData.append("image", workingFile);
      console.log("📤 Sending to /api/upload..."); // ✅ Debug
      
      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });
      
      console.log("📥 Response status:", res.status); // ✅ Debug
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      console.log("✅ Cloudinary URL received:", data.url); // ✅ Debug
      
      setProfileImage(data.url);
      console.log("🔹 profileImage juste après upload:", data.url);

      setFeedback({ type: "success", text: "Image uploaded successfully ✅" });
    } catch (err) {
      console.error("❌ Upload error:", err);
      setFeedback({ type: "error", text: "Error uploading image" });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);

    if (!value) {
      setPhoneError("");
      return;
    }

    const normalized = normalizeIsraeliPhone(value);
    setPhoneError(
      normalized
        ? ""
        : "Please enter a valid Israeli mobile number (e.g. +9725XXXXXXXX)"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const pwdError = validatePassword(password);
    if (pwdError) {
      setFeedback({ type: "error", text: "Password error: " + pwdError });
      return;
    }

    const normalizedPhone = normalizeIsraeliPhone(phone);
    if (!normalizedPhone) {
      setPhoneError("Please enter a valid Israeli mobile number.");
      setFeedback({ type: "error", text: "Please enter a valid Israeli mobile number." });
      return;
    }
  
    if (!profileImage) {
      setFeedback({ type: "error", text: "Please upload a profile image." });
      return;
    }
  
    try {
      const userData = {
        name,
        age,
        email,
        password,
        phone: normalizedPhone,
        profileImage,
      };
  
      // 🔹 Inscription + récupération token + user
      const registerResponse = await registerUser(userData);
      console.log("✅ Register response:", registerResponse);

      // 🔹 Login automatique pour récupérer token + user
      const loginResponse = await LoginUser({ email, password });
      login(loginResponse);

      setPhone(normalizedPhone); // reflect the normalized number in the form
      setFeedback({ type: "success", text: "Account created and logged in!" });
      navigate("/"); // go straight to the map/home
    } catch (err) {
      console.error("❌ Registration error:", err);
      setFeedback({ type: "error", text: err.message || "Registration failed" });
    }
  };
  
  return (
    <div className="page-container">
      <Header />
      <div className="content" style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", background: "#f9f9f9", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h1 style={{ textAlign: "center" }}>Register</h1>
          <style>{`.auth-message{ text-align:center; font-weight:bold; margin-bottom:10px; }`}</style>

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

          {feedback && (
            <p
              className="auth-message"
              style={{
                color: feedback.type === "error" ? "red" : "green",
              }}
            >
              {feedback.text}
            </p>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
