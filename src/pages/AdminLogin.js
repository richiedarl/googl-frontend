import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminRegister.css"; // Using the same CSS file

const AdminLogin = ({ setAdminToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const deviceId = localStorage.getItem("deviceId") || "unknown-device"; // Get or set default
    const adminData = { email, password, deviceId };

    try {
      const response = await fetch(
        "https://googl-backend.onrender.com/auth/login-admin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adminData),
        }
      );

      const data = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        if (setAdminToken) setAdminToken(data.token);
        alert("Login successful! Redirecting...");
        navigate("/device-a");
      } else {
        setError(data?.error || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login (Device A)</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
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
