import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminRegister.css"; // Import external CSS

const AdminRegister = ({ setAdminToken }) => {
  const [admin, setAdmin] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
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
        if (setAdminToken) setAdminToken(data.token); // Fix: Avoid calling undefined function
        alert("Registration successful! Redirecting to Device A page.");
        navigate("/device-a");
      } else {
        if (data.msg === "User already registered. Please login.") {
          alert("User already registered. Redirecting to login page.");
          navigate("/admin-login");
        } else {
          setMessage(data?.msg || "Error registering admin."); // Fix: Avoid empty messages
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
        <input type="text" name="name" placeholder="Name" value={admin.name} onChange={handleChange} required className="auth-input" />
        <input type="email" name="email" placeholder="Email" value={admin.email} onChange={handleChange} required className="auth-input" />
        <input type="password" name="password" placeholder="Password" value={admin.password} onChange={handleChange} required className="auth-input" />
        <button type="submit" className="auth-button">Register</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
    </div>
  );
};

export default AdminRegister;
