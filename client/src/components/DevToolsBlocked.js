import React from "react";
import { useNavigate } from "react-router-dom";

const DevToolsBlocked = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8d7da",
        color: "#721c24",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Access Denied</h1>
      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        Developer tools are not allowed on this page.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#721c24",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Return to Login
      </button>
    </div>
  );
};

export default DevToolsBlocked;
