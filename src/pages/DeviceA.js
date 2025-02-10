// DeviceA.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken, setAdminToken }) => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get deviceId from location state or localStorage
  const deviceId = location.state?.deviceId || localStorage.getItem("deviceId");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("deviceId");
    if (setAdminToken) {
      setAdminToken(null);
    }
    navigate("/admin-login");
  }, [navigate, setAdminToken]);

  useEffect(() => {
    const storedToken = adminToken || localStorage.getItem("adminToken");
    
    if (!storedToken) {
      navigate("/admin-login");
      return;
    }

    if (!deviceId) {
      setError("Device ID is missing. Please login again.");
      handleLogout();
      return;
    }

    const fetchDevices = async () => {
      try {
        const deviceRes = await axios.get(
          `https://googl-backend.onrender.com/auth/list-devices?deviceId=${deviceId}`,
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );
        setDevices(deviceRes.data?.devices || []);
        setError(null);
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        setError(`Error fetching devices: ${errorMessage}`);
        
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchDevices();

    const sessionTimeout = setTimeout(handleLogout, 5 * 60 * 1000);
    return () => clearTimeout(sessionTimeout);
  }, [adminToken, deviceId, navigate, handleLogout]);

  const loginAsDevice = async (device) => {
    try {
      const storedToken = adminToken || localStorage.getItem("adminToken");
      
      await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        { 
          deviceBEmail: device.name, 
          deviceId: device.deviceId 
        },
        { 
          headers: { Authorization: `Bearer ${storedToken}` } 
        }
      );

      window.location.href = `https://googl-backend.onrender.com/auth/login?email=${encodeURIComponent(device.name)}&deviceId=${device.deviceId}`;
    } catch (err) {
      setError(`Failed to log in as device: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="admin-container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2 className="admin-title">Admin Panel</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="device-list">
        <h3>Linked Devices</h3>
        {devices.length === 0 ? (
          <p className="no-devices">No linked devices found.</p>
        ) : (
          <ul>
            {devices.map((device, index) => (
              <li key={device.deviceId || index} className="device-item">
                <span>{device.name || "Unknown Device"}</span>
                <button 
                  className="login-button" 
                  onClick={() => loginAsDevice(device)}
                >
                  Login as This User
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f4f4f4",
    },
    card: {
      backgroundColor: "white",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      textAlign: "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
    },
    text: {
      fontSize: "16px",
      color: "#666",
      marginBottom: "20px",
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#4285F4",
      color: "white",
      textDecoration: "none",
      borderRadius: "5px",
      fontSize: "16px",
      fontWeight: "bold",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    },
};

export default DeviceA;