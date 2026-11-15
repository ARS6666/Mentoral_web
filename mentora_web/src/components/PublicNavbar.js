import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PublicNavbar({ activeSection = "" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, profile } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const navLinks = [
    { id: "features", label: "امکانات", isSection: true },
    // { id: "preview", label: "دمو و پیش‌نمایش", isSection: true },
    { id: "loop", label: "چگونه کار می‌کند", isSection: true },
    { path: "/aboutus", label: "درباره ما", isSection: false },
    { path: "/subscriptionplans", label: "تعرفه‌ها", isSection: false },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background: "rgba(245, 246, 243, 0.94)",
        borderBottom: "1px solid var(--pd-border, #E1E5E1)",
        transition: "all 0.2s ease",
      }}
    >
      <div
        className="m-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "var(--pd-text-main, #121A18)",
            flexShrink: 0,
          }}
        >
          <img
            src="/logo-mark.png"
            alt="Mentora"
            style={{ width: "34px", height: "34px", objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "-0.5px",
              color: "#182523",
            }}
          >
            منتورا
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          className="d-none d-md-flex"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          {navLinks.map((item) => {
            const isLinkActive = item.isSection
              ? activeSection === item.id
              : location.pathname === item.path;

            if (item.isSection) {
              return (
                <span
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="m-nav-link"
                  style={{
                    color: isLinkActive ? "var(--pd-mint, #3A8778)" : undefined,
                    fontWeight: isLinkActive ? 800 : 600,
                  }}
                >
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className="m-nav-link"
                style={{
                  color: isLinkActive ? "var(--pd-mint, #3A8778)" : undefined,
                  fontWeight: isLinkActive ? 800 : 600,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAuthenticated ? (
            <Link
              to="/home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                background: "#FFFFFF",
                border: "1px solid var(--pd-border, #E1E5E1)",
                borderRadius: "14px",
                padding: "5px 14px 5px 6px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(18, 26, 24, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#3A8778",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "var(--pd-text-main, #121A18)",
                      maxWidth: "100px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile?.name || "حساب من"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "10.5px",
                    color: "var(--pd-mint, #3A8778)",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {profile?.subscription_days > 0
                    ? `${profile.subscription_days} روز اشتراک`
                    : "ورود به داشبورد"}
                </span>
              </div>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "var(--pd-mint, #3A8778)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {profile?.name ? profile.name.slice(0, 1) : <User size={18} />}
              </div>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="m-nav-link d-none d-sm-inline-flex"
                style={{ fontWeight: 700 }}
              >
                ورود
              </Link>
              <Link
                to="/signin"
                className="m-btn-mint"
                style={{ padding: "9px 20px", fontSize: "14px", flexShrink: 0 }}
              >
                شروع رایگان
              </Link>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="d-md-none"
            style={{
              background: "transparent",
              border: "1px solid var(--pd-border, #E1E5E1)",
              borderRadius: "10px",
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--pd-text-main, #121A18)",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="منو"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          className="d-md-none"
          style={{
            background: "#F5F6F3",
            borderBottom: "1px solid var(--pd-border, #E1E5E1)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {isAuthenticated && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid var(--pd-border, #E1E5E1)",
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#3A8778",
                  }}
                />
                <span style={{ fontSize: "13px", fontWeight: 800 }}>
                  {profile?.name || "کاربر منتورا"}
                </span>
              </div>
              <Link
                to="/home"
                className="m-btn-mint"
                style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                داشبورد من
              </Link>
            </div>
          )}

          {navLinks.map((item) => {
            if (item.isSection) {
              return (
                <span
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="m-nav-link"
                >
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className="m-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "6px",
                paddingTop: "14px",
                borderTop: "1px solid var(--pd-border, #E1E5E1)",
              }}
            >
              <Link
                to="/login"
                style={{
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "10px",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  border: "1.5px solid var(--pd-mint, #3A8778)",
                  color: "var(--pd-mint, #3A8778)",
                  background: "#FFFFFF",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                ورود
              </Link>
              <Link
                to="/signin"
                className="m-btn-mint"
                style={{
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "10px",
                  textAlign: "center",
                  textDecoration: "none",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                شروع رایگان
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
