import React, { useState } from "react";
import Window from "./Window";
import WateringSystem from "./WateringSystem";
import SmartHomeManager from "./SmartHomeManager";
import WaterTankLevel from "./WaterTankLevel";

const APP_ICONS = {
  watering: "💧",
  smarthome: "🏠",
  tank: "🚿"
};

export default function DesktopMode() {
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(10);

  const openWindow = (appId, title, component) => {
    // Check if already open
    if (windows.find((w) => w.id === appId)) {
      bringToFront(appId);
      return;
    }

    const newWindow = {
      id: appId,
      title,
      component,
      zIndex: nextZIndex,
      initialPosition: { x: 50 + windows.length * 30, y: 50 + windows.length * 30 },
    };

    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const bringToFront = (id) => {
    setWindows(
      windows.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex(nextZIndex + 1);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 84px)", // Subtract header height approximately or make it full screen if desired. 
        // For this app integration, we are inside a layout with header/nav. 
        // We'll make it fit the container.
        position: "relative",
        background: "url('https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover no-repeat",
        overflow: "hidden",
        borderRadius: 12,
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)"
      }}
    >
      {/* Desktop Icons */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
        <DesktopIcon
          label="Watering System"
          icon={APP_ICONS.watering}
          onClick={() => openWindow("watering", "ระบบรดน้ำต้นไม้", <WateringSystem />)}
        />
        <DesktopIcon
          label="Smart Home"
          icon={APP_ICONS.smarthome}
          onClick={() => openWindow("smarthome", "Smart Home Manager", <SmartHomeManager />)}
        />
        <DesktopIcon
          label="Water Tank"
          icon={APP_ICONS.tank}
          onClick={() => openWindow("tank", "ระดับน้ำในถัง", <WaterTankLevel />)}
        />
      </div>

      {/* Windows Area */}
      {windows.map((win) => (
        <Window
          key={win.id}
          title={win.title}
          initialPosition={win.initialPosition}
          zIndex={win.zIndex}
          onClose={() => closeWindow(win.id)}
          onFocus={() => bringToFront(win.id)}
        >
            <div style={{padding: 20, background: '#f9f9f9', minHeight: '100%'}}>
             {win.component}
            </div>
        </Window>
      ))}

      {/* Taskbar / Status Bar */}
      <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderTop: '1px solid rgba(255,255,255,0.4)'
      }}>
          <div style={{fontWeight: 'bold', color: '#333'}}>Start</div>
          <div style={{flex: 1}}></div>
          <div style={{color: '#333', fontSize: 14}}>
              {new Date().toLocaleTimeString()}
          </div>
      </div>
    </div>
  );
}

function DesktopIcon({ label, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 80,
        textAlign: "center",
        cursor: "pointer",
        padding: 8,
        borderRadius: 8,
        transition: "background 0.2s",
        color: "white",
        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <div style={{ fontSize: 40, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 13, wordWrap: "break-word", lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}
