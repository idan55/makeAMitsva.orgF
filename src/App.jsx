import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Authcontext";
import Home from "../pages/home";
import Register from "../pages/Register";
import Myaccount from "../pages/Myaccount";
import Login from "../pages/Login";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/myaccount' element={<Myaccount/>} />
          <Route path='/login' element={<Login/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
