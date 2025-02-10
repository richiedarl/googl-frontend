import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Redirect if not logged in
import "./DeviceA.css"; // Import external CSS

const DeviceA = ({ adminToken, setAdminToken, deviceId }) => {
  const [devices, setDevices] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Retrieve admin token from localStorage if missing
        let storedToken = adminToken || localStorage.getItem("adminToken");
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

        // Fetch linked devices
        const deviceRes = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );

        if (deviceRes.data?.devices?.length > 0) {
          setDevices(deviceRes.data.devices);
        } else {
          console.warn("No linked devices found.");
          setDevices([]);
        }

        // Fetch stored Google OAuth token
        const tokenRes = await axios.get(
          `https://googl-backend.onrender.com/auth/device-a/get-token?deviceId=${deviceId}`,
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );

        setToken(tokenRes.data.googleToken || "No token available");
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
      }
    };

    fetchDevices();
  }, [adminToken, deviceId, setAdminToken, navigate]);

  // Login as a specific device user
  const loginAsDevice = async (email) => {
    try {
      await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        { deviceBEmail: email },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

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
        <textarea value={token} readOnly className="token-box"></textarea>
      </div>

      <div className="device-list">
        <h3>Linked Devices</h3>
        {devices.length === 0 ? (
          <p className="no-devices">No linked devices found.</p>
        ) : (
          <ul>
            {devices.map((device, index) => (
              <li key={index} className="device-item">
                <span>{device.email || "Unknown Email"}</span>
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
