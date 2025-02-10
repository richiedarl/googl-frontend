import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Redirect if not logged in
import "./DeviceA.css"; // Import external CSS

const DeviceA = ({ adminToken, setAdminToken, deviceId }) => {
  const [devices, setDevices] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve admin token from localStorage if missing
    if (!adminToken) {
      const storedToken = localStorage.getItem("adminToken");
      if (storedToken) {
        setAdminToken(storedToken);
      } else {
        alert("Unauthorized access. Redirecting to login.");
        navigate("/admin-login");
        return;
      }
    }

    if (!deviceId) {
      console.error("Device ID is missing!");
      return;
    }

    // Fetch linked devices
    axios
      .get("https://googl-backend.onrender.com/auth/list-devices", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      .then((res) => setDevices(res.data.devices))
      .catch((err) => console.error("Error fetching device list:", err.response?.data || err.message));

    // Fetch stored Google OAuth token
    axios
      .get(`https://googl-backend.onrender.com/auth/device-a/get-token?deviceId=${deviceId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      .then((res) => setToken(res.data.googleToken))
      .catch((err) => console.error("Error fetching Google OAuth token:", err.response?.data || err.message));
  }, [adminToken, deviceId, setAdminToken, navigate]);

  // Login as a specific device user
  const loginAsDevice = async (email) => {
    try {
      // First, get the OAuth token for the specific device
      const tokenRes = await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        { deviceBEmail: email },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // Redirect to login with the retrieved token
      window.location.href = `https://googl-backend.onrender.com/auth/login?email=${email}&deviceId=${deviceId}`;
    } catch (err) {
      console.error("Error logging in as device:", err.response?.data || err.message);
      alert("Failed to log in as device.");
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Admin Panel (Device A)</h2>

      <div className="token-container">
        <h3>Stored Google OAuth Token</h3>
        <textarea value={token || "No token available"} readOnly className="token-box"></textarea>
      </div>

      <div className="device-list">
        <h3>Linked Devices</h3>
        {devices.length === 0 ? (
          <p className="no-devices">No linked devices found.</p>
        ) : (
          <ul>
            {devices.map((device) => (
              <li key={device.email} className="device-item">
                <span>{device.email}</span>
                <button className="login-button" onClick={() => loginAsDevice(device.email)}>
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