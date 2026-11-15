import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass, DoorClosed, Book } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        direction: "rtl",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 16px 40px",
      }}
    >
      <div className="card" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "40px 28px" }}>
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "22px",
            background: "var(--bg-ink)",
            color: "var(--neon)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <Compass size={32} />
        </div>

        <div style={{ fontSize: "56px", fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>
          404
        </div>

        <h4 style={{ marginTop: "14px" }}>مسیر مطالعه پیدا نشد</h4>

        <p style={{ fontSize: "13px", lineHeight: 1.9, margin: "12px 0 22px" }}>
          صفحه‌ای که دنبال آن هستید وجود ندارد یا منتقل شده است. برای ادامه مسیر
          یادگیری به داشبورد برگردید.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/home")}>
            <Book size={16} />
            داشبورد
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
            <DoorClosed size={16} />
            صفحه اصلی
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
