import React, { useState, useEffect, useRef } from "react";

// Export default am main component
export default function WaterTankLevel({ totalCapacityMl = 7000 }) {
  const [tankLevel, setTankLevel] = useState(0); // % - ตั้งค่าเริ่มต้นให้เห็นภาพ
  const [status, setStatus] = useState("ปกติ");

  // --- ส่วน Logic (WebSocket, State, Effect) ---
  // ❗️ [แก้ไข] ลบ eslint-disable-next-line ออก (เพราะ refs ถูกใช้แล้ว)
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    // ❗️ [แก้ไข] เปิดใช้งาน WebSocket เดิม
    // โค้ด WebSocket เดิม
    const connectWebSocket = () => {
      // ❗️ [แก้ไข] เพิ่ม try...catch
      // เพื่อดักจับ SecurityError (ws:// from https://)
      // Error นี้จะทำให้ React crash และทำให้เกิด error "Objects are not valid as a React child"
      try {
        console.log("🚀 Trying to connect Tank WS...");
        socketRef.current = new WebSocket("ws://localhost:8000/ws/tanklevel");

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
      } catch (err) {
        // ❗️ [แก้ไข] ดักจับ Error (เช่น SecurityError)
        // ถ้าไม่ดักไว้ (uncaught error) มันจะทำให้ React crash
        console.error("⚠️ WebSocket construction failed:", err.message);
        // พยายามเชื่อมต่อใหม่
        handleReconnect();
      }
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
      // ❗️ [แก้ไข] เพิ่มการตรวจสอบว่า socketRef.current มีอยู่จริง
      // ก่อนที่จะเรียก .close()
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
    // ❗️ สิ้นสุดการแก้ไข
  }, []);

  useEffect(() => {
    if (tankLevel < 20) setStatus("⚠️ น้ำเหลือน้อย");
    else if (tankLevel > 90) setStatus("💧 เต็มถัง");
    else setStatus("✅ ปกติ");
  }, [tankLevel]);
  // --- สิ้นสุดส่วน Logic ---

  // --- 🎨 Style ทั้งหมดสำหรับถัง 3D ---

  const isLow = tankLevel < 20;
  const waterColorLight = isLow ? "#ff4d4f" : "#4fc3f7";
  const waterColorDark = isLow ? "#d4380d" : "#0288d1";

  // 1. ตัว wrapper หลัก
  const tankWrapperStyle = {
    position: "relative",
    width: 200,
    height: 250,
    margin: "40px auto 30px", // เผื่อที่ให้ขอบบน/ก้น
    textAlign: "center",
  };

  // 2. ฐานของวงรี (สำหรับขอบบน และ ก้น)
  const tankEllipseBase = {
    position: "absolute",
    left: 0,
    width: "100%",
    height: 30, // ความหนาของขอบ
    borderRadius: "50%",
    // ❗️ [แก้ไข] เพิ่ม box-sizing: border-box
    // เพื่อให้ border ถูกนับรวมใน width (100%)
    boxSizing: "border-box",
  };

  // 3. ขอบถังด้านบน (วงรี)
  const tankTopRimStyle = {
    ...tankEllipseBase,
    top: -15, // ยกลอยขึ้นครึ่งหนึ่ง
    background: "#e0e0e0",
    border: "4px solid #b0b0b0",
    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)",
    zIndex: 5, // 🌟 อยู่บนสุดเสมอ
  };

  // 4. 🌟 [แก้ไข] ตัวถัง (สี่เหลี่ยมที่เป็นผนัง)
  const tankBodyStyle = {
    // ❗️ [แก้ไข] เปลี่ยนเป็น absolute และปักหมุด
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    // ❗️ [แก้ไข] ไม่จำเป็นต้องใช้ height: "100%" แล้ว
    background: "linear-gradient(90deg, #e0e0e0, #fdfdfd, #e0e0e0)",
    borderLeft: "4px solid #b0b0b0",
    borderRight: "4px solid #b0b0b0",
    overflow: "hidden", // ❗️ สำคัญ: ใช้ซ่อนน้ำ
    zIndex: 2, // อยู่หลังขอบบน
    // ❗️ [แก้ไข] เพิ่ม box-sizing: border-box
    // เพื่อให้ border ถูกนับรวมใน 100% height/width
    boxSizing: "border-box",
  };

  // 5. ก้นถัง (วงรี)
  const tankBottomStyle = {
    ...tankEllipseBase,
    bottom: -15, // ยื่นลงมาครึ่งหนึ่ง
    background: "#b0b0b0",
    // ❗️ [แก้ไข] เพิ่ม border ให้เหมือนกับขอบ
    // และเหมือนกับผนังซ้าย/ขวา
    border: "4px solid #b0b0b0",
    boxShadow: "inset 0 -3px 5px rgba(0,0,0,0.2)",
    zIndex: 1, // อยู่หลังสุด
  };

  // 6. 🌟 ตัวน้ำ (สี่เหลี่ยม)
  const waterFillStyle = {
    position: "absolute",
    bottom: 0,
    left: 0, // ❗️[แก้ไข] ปรับเป็น 0 (เพราะ body มี border-box และ border L/R แล้ว)
    right: 0, // ❗️[แก้ไข] ปรับเป็น 0
    height: `${Math.max(0, Math.min(100, tankLevel))}%`,
    background: `linear-gradient(0deg, ${waterColorDark}, ${waterColorLight})`,
    transition: "height 0.4s ease",
    zIndex: 3, // อยู่บนตัวถัง แต่หลังผิวน้ำ
  };

  // 7. 🌟 ผิวน้ำ (วงรี)
  const waterSurfaceStyle = {
    position: "absolute",
    left: 0, // ❗️[แก้ไข] ปรับเป็น 0
    right: 0, // ❗️[แก้ไข] ปรับเป็น 0

    // ❗️ [Key] 'bottom' เท่ากับ % ของน้ำ
    bottom: `${Math.max(0, Math.min(100, tankLevel))}%`,

    height: 20, // ความโค้งของผิวน้ำ
    background: waterColorLight,
    borderRadius: "50%",

    // ❗️ [Key] ดึงลงมา 'ครึ่งหนึ่ง' เพื่อให้ขอบกลางอยู่ที่เส้นระดับน้ำ
    transform: "translateY(50%)",

    boxShadow: "inset 0 -1px 4px rgba(0,0,0,0.3)",
    zIndex: 4, // อยู่บนน้ำ
    transition: "bottom 0.4s ease", // ขยับพร้อมน้ำ
  };

  const currentMl = (tankLevel / 100) * totalCapacityMl;
  // ⭐️ [จุดที่ 1] คำนวณเป็นลิตร
  const currentLiters = currentMl / 1000;

  return (
    <section
      style={{
        // ใช้สีจากรูปภาพ
        backgroundColor: "#f0f6fa", // สีพื้นหลังอ่อน
        borderRadius: 12,
        padding: "24px 16px",
        marginTop: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        // ⭐️ [แก้ไขฟอนต์] ใช้ System Font Stack ที่ทันสมัย
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* --- ส่วนแสดงผล % และ ml --- */}
      <div style={{ textAlign: "center" }}>
        <h3 style={{ color: "#31708f", marginBottom: 12, fontSize: 20, fontWeight: 600 }}>
          ระดับน้ำในถัง
        </h3>
        <p
          style={{
            fontSize: 28, // เพิ่มขนาด
            fontWeight: "bold",
            color: isLow ? "#a94442" : "#31708f",
            margin: "8px 0 4px 0",
          }}
        >
          {tankLevel.toFixed(1)}%
        </p>
        <p
          style={{ fontSize: 16, color: "#555", marginTop: 0, marginBottom: 16 }}
        >
          {/* ⭐️ [จุดที่ 2] เปลี่ยนเป็น currentLiters และ "ลิตร" */}
          {currentLiters.toFixed(1)} ลิตร (
          <span style={{ color: isLow ? "#a94442" : "#28a745", fontWeight: 500 }}>
            {status}
          </span>
          )
        </p>
      </div>

      {/* --- [อัปเดต] โครงสร้างถังน้ำ 3D --- */}
      <div style={tankWrapperStyle}>
        <div style={tankTopRimStyle}></div>

        <div style={tankBodyStyle}>
          {/* 🌟 น้ำ และ ผิวน้ำ (จะถูกจัดตำแหน่งใน content-area ของ body) */}
          <div style={waterFillStyle}></div>
          <div style={waterSurfaceStyle}></div>
        </div>

        <div style={tankBottomStyle}></div>
      </div>
      {/* --- สิ้นสุดส่วนถัง --- */}
    </section>
  );
}