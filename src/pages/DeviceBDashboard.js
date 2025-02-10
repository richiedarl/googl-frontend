import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DeviceBDashboard = () => {
  const location = useLocation();


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userEmail = params.get("email");

    if (userEmail) {
      setEmail(userEmail);
      localStorage.setItem("deviceBUserEmail", userEmail); // Store in local storage
    } else {
      const storedEmail = localStorage.getItem("deviceBUserEmail");
      if (storedEmail) setEmail(storedEmail);
    }
  }, [location]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Successfully Connected!</h2>
        <p style={styles.text}>You are now connected and ready to go.</p>
        </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  text: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "20px",
  },
  email: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: "15px",
  },
  inspiration: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: "15px",
  },
};

export default DeviceBDashboard;
