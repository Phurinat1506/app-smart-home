import React, { useState, useEffect, useRef } from "react";

const Window = ({ title, onClose, children, initialPosition = { x: 100, y: 100 }, zIndex = 1, onFocus }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    if (onFocus) onFocus();
    
    // Only start drag if clicking the title bar
    // We'll attach this handler to the title bar div
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  return (
    <div
      ref={windowRef}
      onMouseDown={() => onFocus && onFocus()}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: 500,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: zIndex,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        animation: "popIn 0.2s ease-out",
      }}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: "linear-gradient(to bottom, #f0f0f0, #e0e0e0)",
          padding: "10px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "grab",
          userSelect: "none",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div style={{ fontWeight: "600", color: "#333", fontSize: "14px", display: "flex", alignItems: 'center', gap: 8 }}>
            <span style={{width: 12, height: 12, borderRadius: '50%', background: '#ccc', display: 'inline-block'}}></span>
            {title}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
           <button
            onClick={(e) => {
                e.stopPropagation();
                // Minimize logic could go here
            }}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#f5a623",
              cursor: "pointer",
            }}
          />
          <button
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#ff5f56",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0", flex: 1, overflow: "auto", maxHeight: "80vh" }}>
        {children}
      </div>
      
      <style>
        {`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default Window;
