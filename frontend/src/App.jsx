import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals";
import Profile from "./pages/Profile";
import SmartSense from "./pages/SmartSense";

function AppShell() {
  const location = useLocation();
  const isSmartSense = location.pathname === "/smartsense";

  return (
    <div className={`min-h-screen ${isSmartSense ? "bg-[#080c14]" : "bg-slate-900"} text-slate-100`}>
      {!isSmartSense && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/smartsense" element={<SmartSense />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
