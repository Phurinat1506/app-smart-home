import React, { useState, useEffect, useRef } from "react";

function WaterTankLevel({ totalCapacityMl = 5000 }) {
  const [tankLevel, setTankLevel] = useState(100); // %
  const [status, setStatus] = useState("ปกติ");

  // --- ส่วน Logic (WebSocket, State, Effect) - เหมือนเดิมทั้งหมด ---
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log("🚀 Trying to connect Tank WS...");
      socketRef.current = new WebSocket("ws://192.168.1.150:8000/ws/tanklevel");
      socketRef.current.onopen = () => {
        console.log("✅ Tank WebSocket connected");
        retryCountRef.current = 0;
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.amount !== undefined) {
            setTankLevel(Math.max(0, Math.min(100, data.amount)));
          }
        } catch (err) {
          console.error("⚠️ Error parsing tank data:", err);
        }
      };
      socketRef.current.onerror = (err) => {
        console.error("⚠️ Tank WebSocket error:", err);
        try {
          socketRef.current.close();
        } catch (_) {}
        handleReconnect();
      };
      socketRef.current.onclose = () => {
        console.warn("❌ Tank WebSocket closed");
        handleReconnect();
      };
    };
    const handleReconnect = () => {
      if (reconnectTimerRef.current) return;
      const timeout = Math.min(10000, 1000 * 2 ** retryCountRef.current);
      console.log(`🔄 Reconnecting in ${timeout / 1000}s...`);
      reconnectTimerRef.current = setTimeout(() => {
        retryCountRef.current++;
        reconnectTimerRef.current = null;
        connectWebSocket();
      }, timeout);
    };
    connectWebSocket();
    return () => {
      socketRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (tankLevel < 20) setStatus("⚠️ น้ำเหลือน้อย");
    else if (tankLevel > 90) setStatus("💧 เต็มถัง");
    else setStatus("✅ ปกติ");
  }, [tankLevel]);
  // --- สิ้นสุดส่วน Logic ---


  // --- 🎨 [อัปเดต] Style ถังน้ำให้สมจริงขึ้น ---
  const tankContainerStyle = {
    width: "150px",
    height: "250px",
    
    // 1. 🌟 เปลี่ยนพื้นหลังเป็นไล่สีแนวนอน (ซ้าย-ขวา)
    //    จำลองแสงสะท้อนบนทรงกระบอก (เทา -> ขาว -> เทา)
    background: "linear-gradient(90deg, #e0e0e0, #fdfdfd, #e0e0e0)",
    
    // 2. 🌟 เปลี่ยนขอบให้บางลง และโค้งมนด้านบนเล็กน้อย
    border: "1px solid #b0b0b0",
    borderRadius: "8px 8px 15px 15px", // บน 8px, ล่าง 15px
    
    position: "relative",
    overflow: "hidden",
    margin: "20px auto 0",
    
    // 3. 🌟 เพิ่มเงา 2 ชั้น:
    //    - 'inset' คือเงาด้านใน ให้ดูมี "ความลึก"
    //    - เงาปกติ คือเงาใต้ถัง ให้ดู "ลอย" ขึ้นมา
    boxShadow: "inset 0 4px 10px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)",
  };

  // --- 🎨 [อัปเดต] Style น้ำให้สมจริงขึ้น ---
  const waterFillStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: `${Math.max(0, Math.min(100, tankLevel))}%`,
    transition: "height 0.4s ease, background 0.4s ease",
    
    // 4. 🌟 'background' สีน้ำ (เหมือนเดิม)
    background:
      tankLevel < 20
        ? "linear-gradient(0deg, #d4380d, #ff4d4f)" // แดง
        : "linear-gradient(0deg, #0288d1, #4fc3f7)", // ฟ้า

    // 5. 🌟 [สำคัญ] เพิ่มเงา 'inset' ให้กับน้ำ
    //    ทำให้ดูเหมือนน้ำอยู่ "ข้างใน" ถัง และขอบน้ำจะเข้มกว่าตรงกลาง
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.15)",

    // 6. 🌟 [สำคัญ] เพิ่มขอบด้านบนของน้ำ
    //    จำลอง "ขอบผิวน้ำ" ที่สะท้อนแสง
    borderTop: "2px solid rgba(255, 255, 255, 0.4)",
  };

  const currentMl = (tankLevel / 100) * totalCapacityMl;

  return (
    <section
      style={{
        backgroundColor: "#e7f3fe",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}
    >
      <h3 style={{ color: "#31708f", marginBottom: 12 }}>ระดับน้ำในถัง</h3>

      {/* --- ส่วนแสดงผล % และ ml (เหมือนเดิม) --- */}
      <p
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: tankLevel < 20 ? "#a94442" : "#31708f",
          margin: "8px 0 4px 0",
        }}
      >
        {tankLevel.toFixed(1)}%
      </p>
      <p style={{ fontSize: 16, color: "#555", marginTop: 0, marginBottom: 16 }}>
        {currentMl.toFixed(0)} ml ({status})
      </p>

      {/* --- ส่วนถังน้ำ (ใช้ Style ใหม่) --- */}
      <div style={tankContainerStyle}>
        <div style={waterFillStyle} />
      </div>
    </section>
  );
}

export default WaterTankLevel;