import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DeviceA.css"; // Import external CSS

const DeviceA = ({ adminToken, deviceId }) => {
  const [devices, setDevices] = useState([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!adminToken || !deviceId) return;

    axios.get(`http://localhost:5000/device-a/list-devices?deviceId=${deviceId}`, { 
      headers: { Authorization: `Bearer ${adminToken}` } 
    })
      .then(res => setDevices(res.data.devices))
      .catch(err => console.error("Error fetching device list:", err));

    axios.get(`http://localhost:5000/device-a/get-token?deviceId=${deviceId}`, { 
      headers: { Authorization: `Bearer ${adminToken}` } 
    })
      .then(res => setToken(res.data.googleToken))
      .catch(err => console.error("Error fetching Google OAuth token:", err));
  }, [adminToken, deviceId]);

  const loginAsDevice = async (email) => {
    window.location.href = `http://localhost:5000/login?email=${email}&deviceId=${deviceId}`;
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
            {devices.map(device => (
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
