import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique ID generation
import "./AdminRegister.css"; // Using the same CSS file

const AdminRegister = ({ setAdminToken }) => {
  const [admin, setAdmin] = useState({ name: "", email: "", password: "", deviceId: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // On mount, get or generate a deviceId and store it in localStorage
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = uuidv4(); // Generate a new unique device ID if missing
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setAdmin((prev) => ({ ...prev, deviceId: storedDeviceId }));
    console.log("Device ID:", storedDeviceId);
  }, []);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!admin.deviceId) {
      alert("Device ID is missing!");
      return;
    }

    try {
      const response = await fetch("https://googl-backend.onrender.com/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin),
      });

      const data = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        if (setAdminToken) setAdminToken(data.token);
        alert("Registration successful! Redirecting to Device A page.");
        navigate("/device-a");
      } else {
        // If the email is already registered, alert the user and prompt for login
        if (data.msg === "User already registered. Please login.") {
          setMessage("User already exists, please login.");
        } else {
          setMessage(data?.msg || "Error registering admin.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={admin.name}
          onChange={handleChange}
          required
          className="auth-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={admin.email}
          onChange={handleChange}
          required
          className="auth-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={admin.password}
          onChange={handleChange}
          required
          className="auth-input"
        />
        <button type="submit" className="auth-button">
          Register
        </button>
      </form>
      {message && (
        <div className="auth-message">
          <p>{message}</p>
          {message === "User already exists, please login." && (
            <button className="auth-button" onClick={() => navigate("/admin-login")}>
              Go to Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRegister;
