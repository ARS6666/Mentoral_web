import React, { useState, useEffect } from "react";
import { LogOut, Menu, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import NotificationDropdown from "./NotificationDropdown";
export default function AppNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { profile, logout } = useApp();

  // رصد سایز صفحه با listener به‌جای خواندن مستقیم window.innerWidth در JSX
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const studentName = safeProfile.name || "دانش‌آموز عزیز";
  const subscriptionDays = safeProfile.subscription_days || 0;

  const handleMenuClick = () => {
    onToggleSidebar();
  };

  return (
    <nav
      className="navbar px-3 px-md-4"
      style={{
        height: "72px",
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #E1E5E1",
        position: "sticky",
        top: 0,
        zIndex: 1030,
        direction: "rtl",
        fontFamily: "'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <button
            onClick={handleMenuClick}
            aria-label="باز کردن منو"
            type="button"
            className="btn d-flex align-items-center justify-content-center p-0"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: "1px solid #E1E5E1",
              background: "#FFFFFF",
              color: "#121A18",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#CBD3CB";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E1E5E1";
              e.currentTarget.style.transform = "none";
            }}
          >
            <Menu size={20} />
          </button>

          <div className="d-flex align-items-center gap-2">
            <Link
              to="/home"
              aria-label="منتورا"
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                textDecoration: "none",
              }}
            >
              <img
                src="/logo-mark.png"
                alt="منتورا"
                style={{
                  width: "32px",
                  height: "32px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Link>
            <div className="d-flex flex-column">
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 900,
                  color: "#182523",
                  letterSpacing: "-0.4px",
                }}
              >
                منتورا
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          <Link
            to={subscriptionDays > 0 ? "/subscription" : "/subscriptionplans"}
            className="d-flex align-items-center gap-2 px-3 py-2"
            style={{
              background: subscriptionDays > 0 ? "#E7F1EE" : "#FFF8F0",
              border: `1px solid ${subscriptionDays > 0 ? "rgba(58, 135, 120, 0.28)" : "rgba(234, 88, 12, 0.22)"}`,
              borderRadius: "999px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            <Crown
              size={isMobile ? 18 : 16}
              color={subscriptionDays > 0 ? "#3A8778" : "#EA580C"}
            />
            <span
              className="d-none d-md-inline"
              style={{
                fontSize: "12.5px",
                fontWeight: 800,
                color: subscriptionDays > 0 ? "#3A8778" : "#EA580C",
              }}
            >
              {subscriptionDays > 0 ? `${subscriptionDays} روز اشتراک فعال` : "خرید اشتراک"}
            </span>
          </Link>

          <NotificationDropdown />

          <Link
            to="/profile"
            className="d-flex align-items-center"
            style={{
              textDecoration: "none",
              padding: "4px 8px 4px 4px",
              borderRadius: "14px",
              transition: "all 0.2s ease",
            }}
          >
            <div className="d-none d-md-flex flex-column align-items-end mx-2">
              <span
                style={{ fontSize: "13px", fontWeight: 800, color: "#121A18" }}
              >
                {studentName}
              </span>
              <span style={{ fontSize: "11px", color: "#55625F", fontWeight: 600 }}>
                پنل دانش‌آموز
              </span>
            </div>
            <div
              className="d-flex align-items-center justify-content-center text-white"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3A8778, #2F7063)",
                fontSize: "14px",
                fontWeight: 800,
                boxShadow: "0 2px 8px rgba(58, 135, 120, 0.25)",
              }}
            >
              {studentName.slice(0, 1)}
            </div>
          </Link>

          <button
            type="button"
            aria-label="خروج از حساب"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="btn d-flex align-items-center justify-content-center p-0"
            style={{
              borderRadius: "12px",
              border: "1px solid #E1E5E1",
              background: "#FFFFFF",
              color: "#55625F",
              width: "42px",
              height: "42px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#D64545";
              e.currentTarget.style.borderColor = "#FCA5A5";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#55625F";
              e.currentTarget.style.borderColor = "#E1E5E1";
              e.currentTarget.style.transform = "none";
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
