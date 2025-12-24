import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import WateringSystem from "./WateringSystem";   // สมมติมีไฟล์นี้
import SmartHomeManager from "./SmartHomeManager"; // สมมติมีไฟล์นี้
import WaterTankLevel from "./WaterTankLevel";
import DesktopMode from "./DesktopMode";


export default function App() {
  const activeStyle = {
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#007bff",
    padding: "8px 20px",
    borderRadius: "6px",
    textDecoration: "none",
  };

  const inactiveStyle = {
    color: "#007bff",
    padding: "8px 20px",
    borderRadius: "6px",
    textDecoration: "none",
  };

  return (
    <Router>
      <div
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor: "#f0f4f8",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "20px 40px",
            fontSize: 28,
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontFamily: ""
          }}
        >
          APP House
        </header>

        {/* Navigation Menu */}
        <nav
          style={{
            backgroundColor: "#e3f2fd",
            padding: "12px 40px",
            display: "flex",
            gap: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <NavLink to="/" end style={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}>
            หน้าแรก
          </NavLink>
          {/* <NavLink
            to="/smart-home"
            style={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
          >
            ควบคุมบ้าน
          </NavLink>
          <NavLink to="/watering" style={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}>
            ระบบรดน้ำ
          </NavLink> */}
          <NavLink to="/watertanklevel" style={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}>
            วัดระดับน้ำในถัง
          </NavLink>
          {/* <NavLink to="/desktop" style={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}>
            Desktop UI
          </NavLink> */}
        </nav>

        {/* Main Content */}
        <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
          <Routes>
            <Route
              path="/"
              element={
                <div
                  style={{
                    backgroundColor: "white",
                    padding: 40,
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    textAlign: "center",
                  }}
                >
                  <h1 style={{ fontSize: 36, marginBottom: 20, color: "#007bff" }}>
                    ยินดีต้อนรับสู่ APP House
                  </h1>
                  <p style={{ fontSize: 18, color: "#555" }}>
                    ระบบจัดการบ้านอัจฉริยะและระบบรดน้ำต้นไม้อัตโนมัติ
                  </p>
                  <p style={{ fontSize: 16, marginTop: 30, color: "#777" }}>
                    เลือกเมนูด้านบนเพื่อเริ่มต้นใช้งาน
                  </p>
                </div>
              }
            />
            <Route path="/smart-home" element={<SmartHomeManager />} />
            <Route path="/watering" element={<WateringSystem />} />
            <Route path="/watertanklevel" element={<WaterTankLevel />} />
            <Route path="/desktop" element={<DesktopMode />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: 20,
            color: "#aaa",
            fontSize: 14,
            borderTop: "1px solid #eee",
            marginTop: 40,
          }}
        >
          © 2025 APP House. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}
