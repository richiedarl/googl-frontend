import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken, setAdminToken, deviceId }) => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    if (typeof setAdminToken === "function") {
      setAdminToken(null);
    } else {
      console.error("setAdminToken is not a function");
    }
    alert("Session expired. Please log in again.");
    navigate("/admin-login");
  }, [navigate, setAdminToken]);

  useEffect(() => {
    const storedToken = adminToken || localStorage.getItem("adminToken");
    console.log("Stored Token:", storedToken);
    console.log("Device ID:", deviceId);

    if (!storedToken) {
      alert("Unauthorized access. Redirecting to login.");
      navigate("/admin-login");
      return;
    }

    if (typeof setAdminToken === "function") {
      setAdminToken(storedToken);
    } else {
      console.error("setAdminToken is not a function");
    }

    if (!deviceId) {
      console.error("Device ID is missing! Check if 'deviceId' is passed correctly.");
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
  }, [adminToken, deviceId, setAdminToken, navigate, handleLogout]);

  const loginAsDevice = async (device) => {
    try {
      await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        { deviceBEmail: device.name, deviceId: device.deviceId },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      window.location.href = `https://googl-backend.onrender.com/auth/login?email=${device.name}&deviceId=${device.deviceId}`;
    } catch (err) {
      console.error("Error logging in as device:", err.response?.data || err.message);
      alert("Failed to log in as device.");
    }
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
