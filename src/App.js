import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import DeviceA from "./pages/DeviceA";
import DeviceBLogin from "./pages/DeviceB";
import DeviceBDashboard from "./pages/DeviceBDashboard";
import GmailManager from "./pages/GmailManager";

function App() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken"));

  return (
    <Router>
      <Routes>
        {/* Default Route: Device B Login */}
        <Route path="/" element={<DeviceBLogin />} />

        {/* Admin Login & Registration */}
        <Route path="/admin-login" element={<AdminLogin setAdminToken={setAdminToken} />} />
        <Route path="/admin-register" element={<AdminRegister />} />

        {/* Device A (Admin Dashboard) - Protected Route */}
        <Route 
          path="/device-a" 
          element={adminToken ? <DeviceA adminToken={adminToken} /> : <Navigate to="/admin-login" />} 
        />

        {/* Device B Dashboard (After Successful Login) */}
        <Route path="/device-b" element={<DeviceBDashboard />} />
        <Route path="/gmail-manager" element={<GmailManager />} />
      </Routes>
    </Router>
  );
}

export default App;
