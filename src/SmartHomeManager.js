import React, { useState, useEffect } from "react";

// DeviceControl Component สำหรับควบคุมอุปกรณ์
function DeviceControl({ device, onToggle }) {
  const isSwitchable = ["Light", "AC","Door"].includes(device.type);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <div>
        <h3 style={{ margin: 0, color: "#333" }}>{device.name}</h3>
        <p style={{ margin: "6px 0", color: "#666" }}>
          ประเภท: <strong>{device.type}</strong>
        </p>
        <p style={{ margin: 0, color: "#555" }}>
          สถานะ:{" "}
          <strong
            style={{
              color:
                device.status === "on" || device.status === "active"
                  ? "green"
                  : device.status === "off"
                  ? "red"
                  : "#000",
            }}
          >
            {device.status}
          </strong>
        </p>
      </div>
      {isSwitchable && (
        <button
          onClick={() => onToggle(device.id)}
          style={{
            padding: "10px 20px",
            backgroundColor: device.status === "on" ? "#28a745" : "#6c757d",
            border: "none",
            borderRadius: 8,
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              device.status === "on" ? "#218838" : "#5a6268")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              device.status === "on" ? "#28a745" : "#6c757d")
          }
        >
          {device.status === "on" ? "ปิด" : "เปิด"}
        </button>
      )}
    </div>
  );
}

// SmartHomeManager Component
function SmartHomeManager() {
  const initialDevices = [
    { id: 1, name: "ไฟห้องนั่งเล่น", type: "Light", status: "off" },
    { id: 2, name: "แอร์ห้องนอน", type: "AC", status: "on" },
    { id: 3, name: "กล้องวงจรปิด", type: "Camera", status: "active" },
    { id: 4, name: "เครื่องวัดอุณหภูมิ", type: "Sensor", status: "27°C" },
    { id: 5, name: "ประตูหน้าบ้าน", type: "Door", status: "off" },
  ];

  const [devices, setDevices] = useState(initialDevices);

  const toggleDevice = (id) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: d.status === "on" ? "off" : "on",
            }
          : d
      )
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.type === "Sensor"
            ? {
                ...d,
                status: `${Math.floor(25 + Math.random() * 5)}°C`,
              }
            : d
        )
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{
        backgroundColor: "#f8f9fa",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        marginTop: 40,
      }}
    >
      <h2 style={{ marginBottom: 24, color: "#007bff" }}>
        ระบบควบคุมและตรวจสอบอุปกรณ์ในบ้าน
      </h2>
      {devices.map((device) => (
        <DeviceControl key={device.id} device={device} onToggle={toggleDevice} />
      ))}
    </section>
  );
}

export default SmartHomeManager;
