import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./DeviceA.css";

const DeviceA = ({ adminToken, setAdminToken }) => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get deviceId from location state or localStorage
  const deviceId = location.state?.deviceId || localStorage.getItem("deviceId");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("deviceId");
    if (setAdminToken) {
      setAdminToken(null);
    }
    navigate("/admin-login");
  }, [navigate, setAdminToken]);

  useEffect(() => {
    const storedToken = adminToken || localStorage.getItem("adminToken");
    
    if (!storedToken) {
      navigate("/admin-login");
      return;
    }

    if (!deviceId) {
      setError("Device ID is missing. Please login again.");
      handleLogout();
      return;
    }

    const fetchDevices = async () => {
      try {
        // The endpoint returns deviceB users
        const deviceRes = await axios.get(
          "https://googl-backend.onrender.com/auth/list-devices",
          { 
            headers: { 
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Transform the response to match our component's expectations
        const transformedDevices = deviceRes.data?.devices.map(device => ({
          name: device.email,
          deviceId: deviceId, // Using the admin's deviceId for tracking
          email: device.email,
          createdAt: device.createdAt,
          oauthToken: device.oauthToken
        })) || [];

        setDevices(transformedDevices);
        setError(null);
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Error details:", error.response || error);
        setError(`Error fetching devices: ${errorMessage}`);
        
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchDevices();

    const sessionTimeout = setTimeout(handleLogout, 5 * 60 * 1000);
    return () => clearTimeout(sessionTimeout);
  }, [adminToken, deviceId, navigate, handleLogout]);

  const loginAsDevice = async (device) => {
    try {
      const storedToken = adminToken || localStorage.getItem("adminToken");
      
      if (!storedToken) {
        throw new Error("No authentication token found");
      }

      // First, make the login-to-device request
      await axios.post(
        "https://googl-backend.onrender.com/auth/device-a/login-to-device",
        { 
          deviceBEmail: device.email, // Using email instead of name
          deviceId: device.deviceId
        },
        { 
          headers: { 
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Then redirect to the login page with the correct parameters
      window.location.href = `https://googl-backend.onrender.com/auth/login?email=${encodeURIComponent(device.email)}&deviceId=${device.deviceId}`;
    } catch (err) {
      console.error("Login error details:", err.response || err);
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
        <h3>Available Device B Users</h3>
        {devices.length === 0 ? (
          <p className="no-devices">No Device B users found.</p>
        ) : (
          <ul>
            {devices.map((device, index) => (
              <li key={device.email || index} className="device-item">
                <div className="device-info">
                  <span className="device-email">{device.email}</span>
                  <span className="device-created">Created: {new Date(device.createdAt).toLocaleDateString()}</span>
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