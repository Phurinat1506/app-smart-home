import React, { useState, useEffect, useRef } from "react";

function WateringSystem() {
  // 🌱 สถานะของระบบ
  const [soilMoisture, setSoilMoisture] = useState(0); // ความชื้น %
  const [temperature, setTemperature] = useState(0); // องศาเซลเซียส
  const [watering, setWatering] = useState(false); // true = กำลังรด
  const [autoWateringStart, setAutoWateringStart] = useState("06:00");
  const [autoWateringEnd, setAutoWateringEnd] = useState("06:15");

  // 💧 ปริมาณน้ำที่รดไป (0-100) — แสดงเป็นหลอดพลังสีฟ้า
  const [waterAmount, setWaterAmount] = useState(0); // ปัจจุบัน (เปอร์เซ็นต์)
  const [targetWaterAmount, setTargetWaterAmount] = useState(30); // ตั้งค่าปริมาณที่ต้องการรด (เปอร์เซ็นต์)

  // 🔗 refs สำหรับ websocket และ timer
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const simulateTimerRef = useRef(null); // ใช้จำลองการเติมหลอดเมื่อ server ไม่ส่งค่า

  // -----------------------------
  // 🧠 WebSocket connect + reconnect
  // -----------------------------
  const retryCountRef = useRef(0);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log("🚀 Trying to connect Watering WS...");
      socketRef.current = new WebSocket("ws://localhost:8000/watering");

      socketRef.current.onopen = () => {
        console.log("✅ Watering WebSocket connected");
        retryCountRef.current = 0; // reset
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // หาก server ส่ง moisture/temperature/watering/waterAmount มา จะอัปเดต state
          if (data.moisture !== undefined) setSoilMoisture(data.moisture);
          if (data.temperature !== undefined) setTemperature(data.temperature);
          if (data.watering !== undefined) setWatering(data.watering);
          if (data.waterAmount !== undefined) {
            // server แจ้งเปอร์เซ็นต์ปริมาณน้ำจริงที่เติมแล้ว
            setWaterAmount(Math.max(0, Math.min(100, data.waterAmount)));
          }
        } catch (err) {
          console.error("Error parsing WebSocket data:", err);
        }
      };


      socketRef.current.onerror = (err) => {
        console.error("⚠️ Watering WebSocket error:", err);
        try {
          socketRef.current.close();
        } catch (_) {}
        handleReconnect();
      
        
      };
  
      socketRef.current.onclose = () => {
        console.warn("❌ Watering WebSocket disconnected");
        handleReconnect();
      };
    };

    const handleReconnect = () => {
      if (reconnectTimerRef.current) return; // ป้องกัน reconnect ซ้อน
      const timeout = Math.min(10000, 1000 * 2 ** retryCountRef.current);
      console.log(`🔄 Watering Reconnecting in ${timeout / 1000}s...`);
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

  // -----------------------------
  // ⏰ Auto watering ตามเวลา
  // -----------------------------
  useEffect(() => {
    const checkAutoWatering = () => {
      const now = new Date();
      const nowStr = now.toTimeString().slice(0, 5);
      setWatering(nowStr >= autoWateringStart && nowStr <= autoWateringEnd);
    };
    checkAutoWatering();
    const timer = setInterval(checkAutoWatering, 60000);
    return () => clearInterval(timer);
  }, [autoWateringStart, autoWateringEnd]);

  // -----------------------------
  // 💧 ฟังก์ชันเริ่ม/หยุดรดน้ำ (ส่งคำสั่งไป server พร้อม target amount)
  // -----------------------------
  const toggleWatering = () => {
    const newState = !watering;
    setWatering(newState);

    // ส่งคำสั่งไปยัง server ถ้าเชื่อมต่อ
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const payload = {
        command: newState ? "START" : "STOP",
        amount: newState ? targetWaterAmount : 0, // ถ้าเริ่ม ส่ง target amount ให้ server
      };
      socketRef.current.send(JSON.stringify(payload));
    }

    // ถ้าเราเริ่มรดน้ำ และ server ไม่ได้ส่งค่า waterAmount มา เราจำลองการเติมหลอดแบบไล่เปอร์เซ็นต์
    if (newState) {
      // reset progress ให้เริ่มจาก 0 (หรือเก็บค่าตามต้องการ)
      setWaterAmount(0);
      if (simulateTimerRef.current) clearInterval(simulateTimerRef.current);

      simulateTimerRef.current = setInterval(() => {
        setWaterAmount((prev) => {
          const next = prev + 2; // เพิ่มทีละ 2% ต่อ tick
          if (next >= targetWaterAmount) {
            clearInterval(simulateTimerRef.current);
            simulateTimerRef.current = null;
            // ถ้าต้องการให้ระบบ auto หยุดเมื่อถึง target ให้ทำต่อไปนี้:
            // setWatering(false);
            // และส่ง STOP ไป server ถ้าเชื่อมต่อ
            // if (socketRef.current?.readyState === WebSocket.OPEN) {
            //   socketRef.current.send(JSON.stringify({ command: "STOP" }));
            // }
            return targetWaterAmount;
          }
          return next;
        });
      }, 500); // tick ทุก 0.5 วินาที (ปรับได้)
    } else {
      // หยุดรดน้ำ → หยุด timer จำลอง
      if (simulateTimerRef.current) {
        clearInterval(simulateTimerRef.current);
        simulateTimerRef.current = null;
      }
    }
  };

  // -----------------------------
  // 🧾 คำนวณสถานะความชื้น (ข้อความ)
  // -----------------------------
  let moistureStatus = "ปานกลาง";
  if (soilMoisture < 30) moistureStatus = "แห้งมาก";
  else if (soilMoisture > 70) moistureStatus = "ชื้นมาก";

  // -----------------------------
  // 🎨 สไตล์หลอดพลัง (progress bar สีน้ำเงิน)
  // -----------------------------
  const barContainerStyle = {
    width: "100%",
    height: 22,
    background: "#e6f4ff", // พื้นหลังอ่อน
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
  };

  const barFillStyle = {
    height: "100%",
    width: `${Math.max(0, Math.min(100, waterAmount))}%`,
    transition: "width 0.4s ease",
    background: "linear-gradient(90deg,#3aa0ff,#0078d4)", // โทนสีน้ำเงินไล่เฉด
    boxShadow: "0 0 8px rgba(0, 120, 212, 0.3)",
  };

   
  // กำหนดปริมาณสูงสุดที่ 100% หมายถึง (เช่น 500 ml)
  const MAX_WATER_ML = 500;

  // แปลงเปอร์เซ็นต์เป็น ml
  const waterMl = Math.round((waterAmount / 100) * MAX_WATER_ML);



  const smallText = { fontSize: 14, margin: "6px 0" };

  // -----------------------------
  // 🧱 UI
  // -----------------------------
  return (
    <section
      style={{
        backgroundColor: "#dff0d8",
        borderRadius: 12,
        padding: 24,
        marginTop: 40,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ color: "#3c763d", marginBottom: 16 }}>
        ระบบรดน้ำต้นไม้อัตโนมัติ
      </h2>

      {/* ความชื้น */}
      <p style={{ fontSize: 18, marginBottom: 8 }}>
        ความชื้นดิน:{" "}
        <strong
          style={{
            color:
              soilMoisture < 30
                ? "#a94442"
                : soilMoisture > 70
                ? "#3c763d"
                : "#8a6d3b",
          }}
        >
          {soilMoisture.toFixed(1)}% ({moistureStatus})
        </strong>
      </p>

      {/* อุณหภูมิ */}
      <p style={{ fontSize: 18, marginBottom: 16 }}>
        อุณหภูมิ:{" "}
        <strong style={{ color: "#31708f" }}>{temperature.toFixed(1)} °C</strong>
      </p>

      {/* ตั้งเวลา auto */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="start-time" style={{ marginRight: 10 }}>
          เวลาเริ่มรดน้ำอัตโนมัติ:
        </label>
        <input
          id="start-time"
          type="time"
          value={autoWateringStart}
          onChange={(e) => setAutoWateringStart(e.target.value)}
          style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="end-time" style={{ marginRight: 10 }}>
          เวลาหยุดรดน้ำอัตโนมัติ:
        </label>
        <input
          id="end-time"
          type="time"
          value={autoWateringEnd}
          onChange={(e) => setAutoWateringEnd(e.target.value)}
          style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>

      {/* ตัวตั้ง target ปริมาณรดน้ำ */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 10 }}>
          ปริมาณที่ต้องการรด: {targetWaterAmount}%
        </label>
        <input
          type="range"
          min={1}
          max={100}
          value={targetWaterAmount}
          onChange={(e) => setTargetWaterAmount(Number(e.target.value))}
          style={{ verticalAlign: "middle" }}
        />
      </div>

      {/* ปุ่มเริ่ม/หยุด */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={toggleWatering}
          style={{
            backgroundColor: watering ? "#d9534f" : "#5cb85c",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 15,
            transition: "background-color 0.3s ease",
            marginRight: 12,
          }}
        >
          {watering ? "หยุดรดน้ำ" : "เริ่มรดน้ำ"}
        </button>

        {/* สถานะเล็กๆ */}
        <span style={{ fontSize: 14 }}>
          {watering ? "กำลังรดน้ำ..." : "ระบบหยุดอยู่"}
        </span>
      </div>

      {/* หลอดพลังสีน้ำเงิน — แสดงปริมาณที่รดไป (waterAmount) */}
      <div style={{ marginBottom: 6 }}>
      <div style={smallText}>
  ปริมาณที่รดไป: {waterAmount}% ({waterMl} ml)
</div>
        <div style={barContainerStyle}>
          <div style={barFillStyle} />
        </div>
      </div>

      {/* ข้อความเมื่อกำลังรดน้ำ */}
      {watering && (
        <p
          style={{
            fontWeight: "bold",
            color: "#3c763d",
            fontSize: 16,
            marginTop: 10,
          }}
        >
          ระบบกำลังรดน้ำต้นไม้...
        </p>
      )}
    </section>
  );
}

export default WateringSystem;
