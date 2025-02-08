import React from "react";

const DeviceBDashboard = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Successfully Registered!</h2>
        <p style={styles.text}>You are now connected and ready to go.</p>
        <h3 style={styles.inspiration}>✨ You Desire the World ✨</h3>
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
  inspiration: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: "15px",
  },
};

export default DeviceBDashboard;
