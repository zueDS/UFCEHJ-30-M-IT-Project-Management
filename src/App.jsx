import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login"; 
import Register from "./pages/Registration";
import { PAGES, NAV_ITEMS } from "../constants";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HospitalLayout = () => {
  const [active, setActive] = useState("dashboard");

  const ActivePage = PAGES[active] || PAGES.dashboard;
  const activeLabel = NAV_ITEMS.find(n => n.id === active)?.label || "Dashboard";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f1f5f9",
    }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar active={active} setActive={setActive} />

        <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 24, fontSize: 13, color: "#6b7280",
          }}>
            <span
              style={{ color: "#1e40af", fontWeight: 600, cursor: "pointer" }}
              onClick={() => setActive("dashboard")}
            >
              Dashboard
            </span>
            {active !== "dashboard" && (
              <>
                <span>›</span>
                <span style={{ color: "#374151", fontWeight: 600 }}>{activeLabel}</span>
              </>
            )}
          </div>
          <ActivePage setActive={setActive} />
        </main>
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Register />} />
        <Route path="/dashboard" element={<HospitalLayout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;