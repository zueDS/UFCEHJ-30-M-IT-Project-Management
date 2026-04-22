import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const savedData = localStorage.getItem("userData");

    if (savedData) {
      try {
        const userData = JSON.parse(savedData);

        setUserName(userData.name || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    //const confirmLogout = window.confirm("Are you sure you want to logout?");
    //if (confirmLogout) {
      localStorage.removeItem("userData");
      navigate("/login");
    //}
  };

  return (
    <header
      style={{
        background: "linear-gradient(90deg, #1e3a8a 0%, #1e40af 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        height: 56,
        flexShrink: 0,
        boxShadow: "0 2px 12px rgba(30,58,138,.4)",
        zIndex: 10,
      }}
    >
      {/* Logo + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            background: "#fff",
            color: "#1e40af",
            fontWeight: 900,
            fontSize: 15,
            width: 34,
            height: 34,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "-1px",
          }}
        >
          H
        </div>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: ".4px" }}>
          HOSPITAL MANAGEMENT SYSTEM
        </span>
      </div>

      {/* Admin + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* UPDATED: Capitalized and larger username */}
        <span style={{ fontSize: 14, opacity: 0.85 }}>
          Logged in as :{" "}
          <strong
            style={{
              opacity: 1,
              fontStyle: "normal",
              textTransform: "uppercase", 
              fontSize: 16, 
              marginLeft: "4px",
            }}
          >
            {userName}
          </strong>
        </span>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,.12)",
            border: "1.5px solid rgba(255,255,255,.25)",
            color: "#fff",
            borderRadius: 8,
            padding: "6px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            transition: "background .2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,.22)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,.12)")
          }
        >
          <Icon name="logout" /> Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
