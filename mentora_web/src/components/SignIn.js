import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeClosed,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Lock,
  Phone,
  User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Helmet } from "react-helmet-async";
import { normalizePhoneNumber } from "../utils/phone";

const Signin = () => {
  const navigate = useNavigate();
  const { register } = useApp();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!fullName.trim()) {
      setError("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      return;
    }

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل 8 کاراکتر باشد.");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({ fullName: fullName.trim(), phone: normalizedPhone, password, confirmPassword });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err?.message || "خطا در ثبت‌نام. لطفاً مجدداً تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>ثبت‌نام و عضویت | منتورا</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .m-auth-page {
          min-height: 100vh;
          background: #F5F6F3;
          direction: rtl;
          font-family: 'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        .m-auth-topbar {
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(225, 229, 225, 0.7);
          background: rgba(245, 246, 243, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .m-auth-container {
          max-width: 1060px;
          width: 100%;
          margin: 0 auto;
          padding: clamp(20px, 3.5vw, 44px) 20px;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .m-auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(20px, 3vw, 36px);
          width: 100%;
          align-items: stretch;
        }

        .m-auth-visual {
          background: #182523;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: clamp(28px, 4vw, 44px);
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 24px 60px rgba(18, 26, 24, 0.16);
          position: relative;
          overflow: hidden;
        }

        .m-auth-card {
          background: #FFFFFF;
          border: 1px solid #E1E5E1;
          border-radius: 28px;
          padding: clamp(28px, 4.5vw, 44px) clamp(22px, 4.5vw, 38px);
          box-shadow: 0 16px 45px rgba(24, 37, 35, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .m-auth-input {
          width: 100%;
          padding: 12px 42px 12px 16px;
          border-radius: 14px;
          border: 1.5px solid #DCE3DE;
          background: #FAFBF9;
          font-size: 14px;
          font-weight: 600;
          color: #121A18;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .m-auth-input:focus {
          border-color: #3A8778;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(58, 135, 120, 0.12);
        }

        .m-auth-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 14px;
          background: linear-gradient(90deg, #3A8778, #2F7063);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(58, 135, 120, 0.28);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: inherit;
        }
        .m-auth-btn:hover:not(:disabled) {
          background: #2F7063;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(58, 135, 120, 0.38);
        }
        .m-auth-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .m-auth-grid {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }
          .m-auth-visual {
            order: 2;
            padding: 24px 20px;
          }
          .m-auth-card {
            order: 1;
          }
        }
      `}</style>

      <div className="m-auth-page">
        {/* Soft Background Art Gradients */}
        <div
          style={{
            position: "absolute",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(58, 135, 120, 0.09) 0%, transparent 70%)",
            top: "-120px",
            right: "-120px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(78, 154, 137, 0.08) 0%, transparent 70%)",
            bottom: "-120px",
            left: "-120px",
            pointerEvents: "none",
          }}
        />

        {/* Minimal Navigation Topbar */}
        <header className="m-auth-topbar">
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#182523",
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

          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#55625F",
              textDecoration: "none",
              fontSize: "13.5px",
              fontWeight: 700,
              padding: "7px 14px",
              borderRadius: "10px",
              border: "1px solid #E1E5E1",
              background: "#FFFFFF",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#182523";
              e.currentTarget.style.borderColor = "#CBD3CB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#55625F";
              e.currentTarget.style.borderColor = "#E1E5E1";
            }}
          >
            <ArrowRight size={16} />
            <span>صفحه اصلی</span>
          </Link>
        </header>

        {/* Main Split Grid */}
        <main className="m-auth-container">
          <div className="m-auth-grid">
            {/* RIGHT COLUMN: MODERN MINIMAL GRAPHIC PANEL */}
            <section className="m-auth-visual">
              {/* Artistic Ambient Glows */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "320px",
                  height: "320px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(58, 135, 120, 0.35) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-60px",
                  left: "-60px",
                  width: "280px",
                  height: "280px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(78, 154, 137, 0.2) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* Top Section: Brand + Short Catchphrase */}
              <div style={{ position: "relative", zIndex: 2 }}>
                {/* <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(58, 135, 120, 0.18)",
                    color: "#4E9A89",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "1px solid rgba(78, 154, 137, 0.35)",
                    marginBottom: "22px",
                  }}
                >
                  <Sparkles size={14} color="#4E9A89" />
                  <span>شروع رایگان مطالعه</span>
                </div> */}

                <h2
                  style={{
                    fontSize: "clamp(24px, 2.6vw, 32px)",
                    fontWeight: 900,
                    lineHeight: 1.35,
                    color: "#FFFFFF",
                    margin: "0 0 12px 0",
                    letterSpacing: "-0.5px",
                  }}
                >
                  آینده رو هوشمندانه بساز
                </h2>

                <div
                  style={{
                    width: "40px",
                    height: "3px",
                    background: "#4E9A89",
                    borderRadius: "999px",
                    margin: "0 0 16px 0",
                  }}
                />

                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "rgba(245, 246, 243, 0.82)",
                    margin: 0,
                  }}
                >
                  ثبت‌نام رایگان در کمتر از ۱ دقیقه؛ بدون نیاز به کارت بانکی.
                </p>
              </div>

              {/* Middle Section: Pure Visual Futuristic Geometric Artwork (Zero Text, Rich Color & Shapes) */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  margin: "24px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "340px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    padding: "20px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <svg
                    viewBox="0 0 340 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "190px",
                      overflow: "visible",
                    }}
                  >
                    <defs>
                      <radialGradient id="signin-art-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4E9A89" stopOpacity="0.4" />
                        <stop offset="60%" stopColor="#3A8778" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#182523" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="signin-ring-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4E9A89" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#3A8778" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#182523" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="signin-ring-2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A3E6D8" stopOpacity="0.7" />
                        <stop offset="50%" stopColor="#4E9A89" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3A8778" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="signin-facet-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#4E9A89" stopOpacity="0.06" />
                      </linearGradient>
                      <linearGradient id="signin-facet-2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4E9A89" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#182523" stopOpacity="0.1" />
                      </linearGradient>
                      <filter id="signin-neon" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Ambient Glow */}
                    <circle cx="170" cy="100" r="90" fill="url(#signin-art-glow)" />

                    {/* Orbital Rings */}
                    <ellipse
                      cx="170"
                      cy="100"
                      rx="140"
                      ry="54"
                      stroke="url(#signin-ring-1)"
                      strokeWidth="1.2"
                      strokeDasharray="4 6"
                      transform="rotate(-15 170 100)"
                    />
                    <ellipse
                      cx="170"
                      cy="100"
                      rx="125"
                      ry="48"
                      stroke="url(#signin-ring-2)"
                      strokeWidth="1.3"
                      transform="rotate(22 170 100)"
                    />
                    <ellipse
                      cx="170"
                      cy="100"
                      rx="95"
                      ry="38"
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="1"
                    />

                    {/* Dynamic Connection Lines */}
                    <line x1="170" y1="100" x2="245" y2="65" stroke="rgba(78, 154, 137, 0.35)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="170" y1="100" x2="90" y2="135" stroke="rgba(78, 154, 137, 0.35)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="170" y1="100" x2="235" y2="138" stroke="rgba(78, 154, 137, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="170" y1="100" x2="105" y2="62" stroke="rgba(78, 154, 137, 0.25)" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Floating Nodes */}
                    <circle cx="245" cy="65" r="4.5" fill="#A3E6D8" filter="url(#signin-neon)" />
                    <circle cx="245" cy="65" r="2" fill="#FFFFFF" />

                    <circle cx="90" cy="135" r="4" fill="#4E9A89" filter="url(#signin-neon)" />
                    <circle cx="90" cy="135" r="1.8" fill="#FFFFFF" />

                    <circle cx="235" cy="138" r="3.2" fill="#3A8778" />
                    <circle cx="105" cy="62" r="3" fill="#A3E6D8" opacity="0.85" />

                    {/* Central Geometric Core */}
                    <g transform="translate(170 100)">
                      <polygon
                        points="0,-42 34,-18 34,20 0,42 -34,20 -34,-18"
                        fill="rgba(24, 37, 35, 0.75)"
                        stroke="rgba(255, 255, 255, 0.18)"
                        strokeWidth="1.2"
                      />
                      <polygon
                        points="0,0 0,-42 34,-18"
                        fill="url(#signin-facet-1)"
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="0.8"
                      />
                      <polygon
                        points="0,0 34,-18 34,20 0,42"
                        fill="url(#signin-facet-2)"
                        stroke="rgba(78, 154, 137, 0.25)"
                        strokeWidth="0.8"
                      />
                      <polygon
                        points="0,0 0,-42 -34,-18"
                        fill="url(#signin-facet-2)"
                        stroke="rgba(78, 154, 137, 0.3)"
                        strokeWidth="0.8"
                      />
                      <polygon
                        points="0,0 -34,-18 -34,20 0,42"
                        fill="url(#signin-facet-1)"
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="0.8"
                      />

                      {/* Central Glowing Energy Point */}
                      <circle cx="0" cy="0" r="7" fill="#4E9A89" filter="url(#signin-neon)" />
                      <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
                    </g>

                    {/* Ambient Particles */}
                    <circle cx="130" cy="40" r="1.5" fill="#A3E6D8" opacity="0.7" />
                    <circle cx="210" cy="160" r="1.5" fill="#A3E6D8" opacity="0.6" />
                    <circle cx="275" cy="105" r="2" fill="#4E9A89" opacity="0.5" />
                    <circle cx="65" cy="95" r="1.8" fill="#4E9A89" opacity="0.4" />
                  </svg>
                </div>
              </div>

              {/* Bottom Subtle Trust Indicator */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12.5px",
                  color: "rgba(245, 246, 243, 0.65)",
                }}
              >
                <ShieldCheck size={16} color="#4E9A89" />
                <span>پشتیبانی همیشگی و تضمین حفظ حریم خصوصی</span>
              </div>
            </section>

            {/* LEFT COLUMN: CRISP & CLEAN REGISTRATION FORM */}
            <section className="m-auth-card">
              {/* Header & Minimal Switcher */}
              <div style={{ marginBottom: "22px" }}>
                <div
                  style={{
                    background: "#F0F2EE",
                    padding: "4px",
                    borderRadius: "14px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px",
                    marginBottom: "22px",
                    border: "1px solid #E1E5E1",
                  }}
                >
                  <Link
                    to="/login"
                    style={{
                      color: "#55625F",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      textAlign: "center",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    ورود به حساب
                  </Link>
                  <div
                    style={{
                      background: "#FFFFFF",
                      color: "#182523",
                      boxShadow: "0 2px 8px rgba(18, 26, 24, 0.06)",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    ثبت‌نام جدید
                  </div>
                </div>

                {/* <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(58, 135, 120, 0.1)",
                    color: "#3A8778",
                    fontSize: "12px",
                    fontWeight: 800,
                    padding: "4px 12px",
                    borderRadius: "999px",
                    marginBottom: "10px",
                  }}
                >
                  <Zap size={13} />
                  <span>عضویت سریع</span>
                </div> */}

                <h1
                  style={{
                    fontSize: "clamp(22px, 2.4vw, 26px)",
                    fontWeight: 900,
                    color: "#182523",
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.5px",
                  }}
                >
                  ساخت حساب جدید
                </h1>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "#55625F",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  اطلاعات خود را وارد کن تا دستیار مطالعه فعال شود.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#991B1B",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                    lineHeight: 1.5,
                  }}
                >
                  <AlertCircle size={17} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Minimal Form */}
              <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="signup-name"
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#182523",
                      marginBottom: "5px",
                    }}
                  >
                    نام و نام خانوادگی
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#55625F",
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <User size={17} />
                    </span>
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="مثلاً: علی محمدی"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                      className="m-auth-input"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="signup-phone"
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#182523",
                      marginBottom: "5px",
                    }}
                  >
                    شماره موبایل
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#55625F",
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Phone size={17} />
                    </span>
                    <input
                      id="signup-phone"
                      type="tel"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                      className="m-auth-input"
                      style={{
                        direction: "ltr",
                        textAlign: "right",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#182523",
                      marginBottom: "5px",
                    }}
                  >
                    رمز عبور
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#55625F",
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Lock size={17} />
                    </span>
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="حداقل 8 کاراکتر"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="m-auth-input"
                      style={{
                        paddingLeft: "42px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "#7A8582",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                    >
                      {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#182523",
                      marginBottom: "5px",
                    }}
                  >
                    تکرار رمز عبور
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#55625F",
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Lock size={17} />
                    </span>
                    <input
                      id="signup-confirm-password"
                      type={showPassword2 ? "text" : "password"}
                      placeholder="تکرار رمز عبور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="m-auth-input"
                      style={{
                        paddingLeft: "42px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword2(!showPassword2)}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "#7A8582",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={showPassword2 ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                    >
                      {showPassword2 ? <EyeClosed size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="m-auth-btn"
                  style={{ marginTop: "6px" }}
                >
                  {loading ? (
                    <span>در حال ایجاد حساب...</span>
                  ) : (
                    <>
                      <span>ایجاد حساب و شروع رایگان</span>
                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Login */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "18px",
                  paddingTop: "14px",
                  borderTop: "1px solid #EEF1ED",
                  fontSize: "13.5px",
                  color: "#55625F",
                }}
              >
                <span>قبلاً ثبت‌نام کردی؟ </span>
                <Link
                  to="/login"
                  style={{
                    color: "#3A8778",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  ورود به حساب
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Signin;
