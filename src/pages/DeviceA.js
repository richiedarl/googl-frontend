import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken, setAdminToken, deviceId }) => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("DeviceA Component Mounted");
    console.log("adminToken:", adminToken);
    console.log("setAdminToken type:", typeof setAdminToken); // Debugging line
    console.log("deviceId:", deviceId);

    const storedToken = adminToken || localStorage.getItem("adminToken");

    if (!storedToken) {
      alert("Unauthorized access. Redirecting to login.");
      navigate("/admin-login");
      return;
    }

    if (typeof setAdminToken !== "function") {
      console.error("setAdminToken is not a function! Check props.");
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
          `https://googl-backend.onrender.com/auth/list-devices?deviceId=${deviceId}`,
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );
        setDevices(deviceRes.data?.devices || []);
      } catch (error) {
        console.error("Error fetching devices:", error.response?.data || error.message);
      }
    };

    fetchDevices();

    const sessionTimeout = setTimeout(() => {
      handleLogout();
    }, 5 * 60 * 1000);

    return () => clearTimeout(sessionTimeout);
  }, [adminToken, deviceId, setAdminToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    if (typeof setAdminToken === "function") {
      setAdminToken(null);
    }
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

export default DeviceA;
