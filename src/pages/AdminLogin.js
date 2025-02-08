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
      const res = await axios.post("http://localhost:5000/auth/login-admin", { email, password });
      
      // Save token & redirect
      localStorage.setItem("adminToken", res.data.token);
      setAdminToken(res.data.token);
      alert("Login successful! Redirecting to Device A page.");
      navigate("/device-a"); // Redirect to Device A panel

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login (Device A)</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin} className="auth-form">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" />
        <button type="submit" className="auth-button">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
