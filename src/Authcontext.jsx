import React, { createContext, useState, useEffect, useContext } from "react";

// ✅ Créer le contexte
export const AuthContext = createContext();

// ✅ Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ✅ Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Charger user + token depuis localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("🔄 Restored user from localStorage:", parsedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (err) {
        console.error("❌ Error parsing user from localStorage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // ✅ Fonction pour login
  const login = (userData) => {
    console.log("🔐 Login called with:", userData);

    // userData = { user, token } venant du backend
    if (userData.user && userData.token) {
      setUser(userData.user);
      setToken(userData.token);
      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("token", userData.token);
    } 
    // Si on reçoit juste l'objet user
    else {
      setUser(userData);
      setToken(null);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  // ✅ Fonction pour logout
  const logout = () => {
    console.log("🚪 Logout called");
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
