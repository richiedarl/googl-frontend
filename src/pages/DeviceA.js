import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken, setAdminToken }) => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();
  
  // Ensure deviceId is set
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || navigator.userAgent);

  useEffect(() => {
    const storedToken = adminToken || localStorage.getItem("adminToken");
    if (!storedToken) {
      alert("Unauthorized access. Redirecting to login.");
      navigate("/admin-login");
      return;
    }

    setAdminToken(storedToken);

    if (!deviceId) {
      console.error("Device ID is missing!");
      return;
    }

    const fetchDevices = async () => {
      try {
        const deviceRes = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );
        setDevices(deviceRes.data?.devices || []);
      } catch (error) {
        console.error("Error fetching devices:", error.response?.data || error.message);
      }
    };

    fetchDevices();

    // Session timeout - Logout after 5 minutes
    const sessionTimeout = setTimeout(() => {
      handleLogout();
    }, 5 * 60 * 1000);

    return () => clearTimeout(sessionTimeout);
  }, [adminToken, deviceId, setAdminToken, navigate]);

  const loginAsDevice = async (device) => {
    try {
      await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        { deviceBEmail: device.name },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      window.location.href = `https://googl-backend.onrender.com/auth/login?email=${device.name}&deviceId=${device.deviceId}`;
    } catch (err) {
      console.error("Error logging in as device:", err.response?.data || err.message);
      alert("Failed to log in as device.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    alert("Session expired. Please log in again.");
    navigate("/admin-login");
  };

  return (
    <div className="admin-container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2 className="admin-title">Admin Panel</h2>
      <div className="device-list">
        <h3>Linked Devices</h3>
        {devices.length === 0 ? (
          <p className="no-devices">No linked devices found.</p>
        ) : (
          <ul>
            {devices.map((device, index) => (
              <li key={index} className="device-item">
                <span>{device.name || "Unknown Device"}</span>
                <button className="login-button" onClick={() => loginAsDevice(device)}>
                  Login as User
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeviceA;
