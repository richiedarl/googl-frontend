import React from "react";

const DeviceB = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome,</h2>
        <p style={styles.text}>Log in to continue</p>
        <a href="http://localhost:5000/auth/google" style={styles.button}>
          Login with Google
        </a>
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
  button: {
    padding: "10px 20px",
    backgroundColor: "#4285F4",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
};

export default DeviceB;
