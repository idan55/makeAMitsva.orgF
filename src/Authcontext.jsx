import React, { createContext, useState, useEffect, useContext } from 'react';


// 1️⃣ Créer le contexte
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On first load, restore user from localStorage if present
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // if bad JSON, just clear it
        localStorage.removeItem("user");
      }
    }
  }, []);

  // data is the full login response: { message, token, user }
  const login = (data) => {
    if (!data || !data.user || !data.token) return;
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = () => {
    console.log('Logout called'); // ✅ Debug
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};