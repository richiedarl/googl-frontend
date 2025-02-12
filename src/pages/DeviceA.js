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
    if (typeof setAdminToken === "function") {
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
        console.log("Fetching devices with token:", storedToken);

        const response = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Devices response:", response.data);
        setDevices(response.data?.devices || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching devices:", error.response || error);
        const errorMessage =
          error.response?.data?.error || "Failed to fetch devices";
        setError(errorMessage);

        if (error.response?.status === 401 || error.response?.status === 403) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();

    const sessionTimeout = setTimeout(handleLogout, 5 * 60 * 1000);
    return () => clearTimeout(sessionTimeout);
  }, [storedToken, navigate, handleLogout]);

  const loginAsDevice = async (device) => {
    try {
      if (!storedToken) {
        throw new Error("No authentication token found");
      }
  
      console.log("Attempting login for device:", device.email);
  
      const response = await axios.post(
        "https://googl-backend.onrender.com/auth/login-to-device",
        { deviceBEmail: device.email },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Login response:", response.data);
  
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error("No redirect URL provided");
      }
    } catch (err) {
      console.error("Error logging in as device:", err.response || err);
      setError(
        `Failed to log in as device: ${err.response?.data?.error || err.message}`
      );
    }
  };
  
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
          <>
            <p>Total devices found: {devices.length}</p>
            <ul>
              {devices.map((device, index) => (
                <li key={device.email || index} className="device-item">
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
          </>
        )}
      </div>
    </div>
  );
};

export default DeviceA;