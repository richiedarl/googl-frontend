import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import DeviceA from "./pages/DeviceA";
import DeviceBLogin from "./pages/DeviceB";
import DeviceBDashboard from "./pages/DeviceBDashboard";
import GmailManager from "./pages/GmailManager";

// A wrapper component to handle URL parameters for GmailManager
const GmailManagerWrapper = () => {
  const location = useLocation();
  const [oauthToken, setOauthToken] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Try multiple sources for the token
    const tokenFromUrl = searchParams.get("token");
    const tokenFromStorage = localStorage.getItem("deviceOAuthToken");
    
    console.log("🔍 Token Sources:", {
      tokenFromUrl: tokenFromUrl ? tokenFromUrl.substring(0, 10) : 'N/A',
      tokenFromStorage: tokenFromStorage ? tokenFromStorage.substring(0, 10) : 'N/A'
    });

    // Prioritize URL token, then storage token
    const finalToken = tokenFromUrl || tokenFromStorage;

    if (finalToken) {
      localStorage.setItem("deviceOAuthToken", finalToken);
      setOauthToken(finalToken);
    } else {
      console.error("❌ No OAuth token available");
    }
  }, [location]);

  if (!oauthToken) {
    return <div>Loading Gmail Manager... Please ensure you're logged in.</div>;
  }

  return <GmailManager oauthToken={oauthToken} />;
};


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
        
        {/* Updated GmailManager route using the wrapper component */}
        <Route path="/gmail-manager" element={<GmailManagerWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;