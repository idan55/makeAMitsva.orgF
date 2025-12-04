import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Authcontext";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Myaccount from "../pages/Myaccount";
import Login from "../pages/Login";
import Admin from "../pages/Admin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/myaccount" element={<Myaccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
