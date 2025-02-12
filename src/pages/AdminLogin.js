import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./AdminRegister.css";

const AdminLogin = ({ setAdminToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    // Generate deviceId if not exists
    const deviceId = localStorage.getItem("deviceId") || uuidv4();
    localStorage.setItem("deviceId", deviceId);

    const requestData = {
      email,
      password,
      deviceId
    };

    console.log("Attempting login with data:", { 
      email,
      deviceId,
      passwordLength: password.length 
    });

    try {
      const response = await axios.post(
        "https://googl-backend.onrender.com/auth/login-admin",
        requestData,
        {
          headers: { 
            "Content-Type": "application/json"
          },
          timeout: 15000 // 15 second timeout
        }
      );

      console.log("Login response received:", {
        status: response.status,
        hasToken: !!response.data.token,
        redirect: response.data.redirect
      });

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        if (setAdminToken) {
          setAdminToken(response.data.token);
        }
        console.log("Token stored, navigating to device-a");
        navigate("/device-a");
      } else {
        throw new Error("No token received in response");
      }
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isAxiosError: error.isAxiosError,
        isTimeout: error.code === 'ECONNABORTED'
      });

      let errorMessage = "Login failed. ";
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += "Request timed out. Please try again.";
      } else if (error.isAxiosError && !error.response) {
        errorMessage += "Network error. Please check your connection.";
      } else {
        errorMessage += "Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
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
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
          disabled={loading}
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;