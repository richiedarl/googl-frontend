import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken: initialAdminToken, setAdminToken }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [adminToken, setAdminTokenState] = useState(initialAdminToken || localStorage.getItem("adminToken"));

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    setAdminTokenState(null);
    if (setAdminToken) {
      setAdminToken(null);
    }
    navigate("/admin-login");
  }, [navigate, setAdminToken]);

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    const fetchDevices = async () => {
      try {
        setLoading(true);
        console.log("Fetching devices with token:", { adminToken });

        const response = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Devices response:", response.data);
        setDevices(response.data?.devices || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching devices:", error.response || error);
        setError(error.response?.data?.error || "Failed to fetch devices");

        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [adminToken, navigate, handleLogout]); // ✅ adminToken is now included in dependencies

  return (
    <div className="admin-container">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <h2 className="admin-title">Admin Panel</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="device-list">
        <h3>Device B Users {loading && "(Loading...)"}</h3>
        {loading ? (
          <p>Loading devices...</p>
        ) : devices.length === 0 ? (
          <p className="no-devices">No Device B users found.</p>
        ) : (
          <ul>
            {devices.map((device, index) => (
              <li key={device.deviceId || index} className="device-item">
                <span>{device.email || "Unknown Device"}</span>
                <button className="login-button">Login as This User</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeviceA;
