import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminRegister.css"; // Using the same CSS file

const AdminLogin = ({ setAdminToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Get or generate deviceId
      const deviceId = localStorage.getItem("deviceId") || navigator.userAgent || "Unknown Device";
      localStorage.setItem("deviceId", deviceId);

      // **STEP 1: Admin Login**
      const res = await axios.post("https://googl-backend.onrender.com/auth/login-admin", {
        email,
        password,
        deviceId,
      });

      const adminToken = res.data.token;
      localStorage.setItem("adminToken", adminToken);
      setAdminToken(adminToken);

      // **STEP 2: Get Google OAuth Token**
      const tokenRes = await axios.get("https://googl-backend.onrender.com/get-token", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      console.log("Google OAuth Token:", tokenRes.data.googleToken);

      // **STEP 3: Get Admin Data**
      const adminRes = await axios.get("https://googl-backend.onrender.com/auth/admin/get-admin", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const admin = adminRes.data;

      // **STEP 4: Save Device if Not Exists**
      const existingDevice = admin.devices.find((d) => d.deviceId === deviceId);
      if (!existingDevice) {
        await axios.post(
          "https://googl-backend.onrender.com/auth/admin/save-devices",
          { deviceId },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      }

      alert("Login successful! Redirecting to Device A page.");
      navigate("/device-a");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login (Device A)</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="auth-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
