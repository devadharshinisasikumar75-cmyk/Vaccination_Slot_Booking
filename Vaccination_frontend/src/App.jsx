import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SlotBooking from "./pages/SlotBooking";
import Tracking from "./pages/Tracking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/slot-booking" element={<SlotBooking />} />
        <Route path="/tracking" element={<Tracking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;