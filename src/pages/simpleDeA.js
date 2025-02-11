import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken: initialAdminToken, setAdminToken }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const storedToken = initialAdminToken || localStorage.getItem("adminToken");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    if (setAdminToken) {
      setAdminToken(null);
    }
    navigate("/admin-login");
  }, [navigate, setAdminToken]);

  useEffect(() => {
    if (!storedToken) {
      navigate("/admin-login");
      return;
    }

    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setDevices(response.data?.devices || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching devices:", error.response || error);
        const errorMessage = error.response?.data?.error || "Failed to fetch devices";
        setError(errorMessage);
        
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [storedToken, navigate, handleLogout]);

  const loginAsDevice = async (device) => {
    try {
      await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        {
          deviceBEmail: device.email
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      window.location.href = `https://googl-backend.onrender.com/auth/login?email=${encodeURIComponent(device.email)}`;
    } catch (err) {
      console.error("Login error:", err.response || err);
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
        <h3>Device B Users {loading && '(Loading...)'}</h3>
        {loading ? (
          <p>Loading devices...</p>
        ) : devices.length === 0 ? (
          <p className="no-devices">No Device B users found.</p>
        ) : (
          <ul>
            {devices.map((device, index) => (
              <li key={device._id || index} className="device-item">
                <span>{device.email || "Unknown Device"}</span>
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

export default DeviceA;