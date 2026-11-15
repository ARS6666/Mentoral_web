import React from "react";
import {
  Sparkles,
  BookOpen,
  CalendarDays,
  Target,
  Flame,
  ArrowLeft,
  CheckCircle2,
  MessageCircleMore,
  BarChart3,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Helmet } from "react-helmet-async";

export default function Home({ profile: profileProp }) {
  const { profile: contextProfile, tasks, stats } = useApp();
  const profile = profileProp || contextProfile;
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedCount = safeTasks.filter((task) => task?.completed).length;

  const studentName = safeProfile.name || "دانش‌آموز عزیز";
  const major = safeProfile.major || "عمومی";
  const targetRank = safeProfile.targetRank || "ثبت نشده";
  const studyHours = safeProfile.studyHours || 6;
  const streak = stats?.streakCount ?? 0;

  const todayProgress =
    safeTasks.length > 0
      ? Math.round((completedCount / safeTasks.length) * 100)
      : (stats?.todayProgress ?? 0);

  const formattedDate = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const hubCards = [
    {
      title: "برنامه امروز",
      desc: "بررسی تسک‌های زمان‌بندی‌شده، ثبت انجام کارها و پیگیری ریتم روزانه.",
      icon: <CheckCircle2 size={22} />,
      color: "#3A8778",
      bg: "rgba(58, 135, 120, 0.12)",
      badge: safeTasks.length > 0 ? `${completedCount} از ${safeTasks.length} انجام شده` : "برنامه فعال",
      ref: "/today",
    },
    {
      title: "معلم هوشمند",
      desc: "پاسخ فوری به اشکالات درسی، تحلیل تست‌ها و یادگیری مفهومی مباحث.",
      icon: <MessageCircleMore size={22} />,
      color: "#3A8778",
      bg: "rgba(58, 135, 120, 0.12)",
      badge: "پاسخگوی ۲۴/۷",
      ref: "/tutor",
    },
    {
      title: "دستیار برنامه‌ریزی",
      desc: "تنظیم و اصلاح برنامه هفتگی مطالعه بر اساس نقاط ضعف و توان هفتگی.",
      icon: <CalendarDays size={22} />,
      color: "#3A8778",
      bg: "rgba(58, 135, 120, 0.12)",
      badge: "برنامه‌ریزی تطبیقی",
      ref: "/planningassistant",
    },
    {
      title: "گزارش عملکرد",
      desc: "تحلیل درصد تسلط مباحث، مقایسه رشد هفتگی و پیشنهادهای هوشمند مرور.",
      icon: <BarChart3 size={22} />,
      color: "#3A8778",
      bg: "rgba(58, 135, 120, 0.12)",
      badge: "تحلیل تحصیلی",
      ref: "/reports",
    },
  ];

  return (
    <>
      <Helmet>
        <title>میز کار من | منتورا</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          direction: "rtl",
          textAlign: "right",
          padding: "10px 0 42px",
          fontFamily: "'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Minimal Hero Header */}
        <header
          style={{
            background:
              "radial-gradient(circle at 90% 15%, rgba(78, 154, 137, 0.18), transparent 35%), linear-gradient(135deg, #1F2E2A, #182523)",
            borderRadius: "24px",
            padding: "clamp(24px, 4vw, 36px)",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(18, 26, 24, 0.12)",
            marginBottom: "24px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(78, 154, 137, 0.2)",
                border: "1px solid rgba(78, 154, 137, 0.35)",
                color: "#8CF2CE",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <Sparkles size={13} />
              {formattedDate}
            </div>

            <div style={{ fontSize: "12.5px", color: "rgba(245, 246, 243, 0.75)" }}>
              رشته <strong>{major}</strong> • هدف رتبه <strong>{targetRank}</strong>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: "600px" }}>
              <h1
                style={{
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 900,
                  margin: "0 0 8px",
                  lineHeight: "1.4",
                  letterSpacing: "-0.5px",
                }}
              >
                سلام {studentName} 👋
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "13.5px",
                  color: "rgba(245, 246, 243, 0.82)",
                  lineHeight: "1.85",
                }}
              >
                امروز یک فرصت تازه برای پیشرفت است. با تمرکز روی برنامه امروز، مسیر موفقیتت را هموارتر کن.
              </p>
            </div>

            {/* Single Clear Primary Action */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                to="/today"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#3A8778",
                  color: "#FFFFFF",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(58, 135, 120, 0.35)",
                  transition: "background 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2F7063";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#3A8778";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>شروع مطالعه امروز</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>

          {/* Sleek 1-line Progress Bar */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                marginBottom: "8px",
                color: "rgba(245, 246, 243, 0.85)",
              }}
            >
              <span>پیشرفت کارهای امروز</span>
              <strong>
                {safeTasks.length > 0
                  ? `${completedCount} از ${safeTasks.length} کار تکمیل شده (${todayProgress}٪)`
                  : "هنوز تسکی ثبت نشده"}
              </strong>
            </div>

            <div
              style={{
                height: "6px",
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${todayProgress}%`,
                  height: "100%",
                  background: "#4E9A89",
                  borderRadius: "999px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        </header>

        {/* 4 Clean Stats Chips */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 4px 14px rgba(18, 26, 24, 0.02)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Flame size={18} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "#55625F" }}>استمرار مطالعه</span>
              <strong style={{ fontSize: "16px", color: "#121A18", fontWeight: 800 }}>{streak} روز پیوسته</strong>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 4px 14px rgba(18, 26, 24, 0.02)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background: "rgba(58, 135, 120, 0.12)",
                color: "#3A8778",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "#55625F" }}>هدف مطالعه روزانه</span>
              <strong style={{ fontSize: "16px", color: "#121A18", fontWeight: 800 }}>{studyHours} ساعت</strong>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 4px 14px rgba(18, 26, 24, 0.02)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background: "rgba(59, 130, 246, 0.12)",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "#55625F" }}>هدف رتبه کنکور</span>
              <strong style={{ fontSize: "16px", color: "#121A18", fontWeight: 800 }}>{targetRank}</strong>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 4px 14px rgba(18, 26, 24, 0.02)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOpen size={18} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "#55625F" }}>رشته تحصیلی</span>
              <strong style={{ fontSize: "16px", color: "#121A18", fontWeight: 800 }}>{major}</strong>
            </div>
          </div>
        </section>

        {/* Clean Hub Navigation Grid (4 Clickable Cards - No inner duplicate buttons) */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#121A18", margin: 0 }}>
              بخش‌های اصلی مطالعه
            </h2>
            <span style={{ fontSize: "12px", color: "#55625F" }}>دسترسی سریع و منظم</span>
          </div>

          <div className="row g-3">
            {hubCards.map((card, idx) => (
              <div className="col-12 col-md-6" key={idx}>
                <Link
                  to={card.ref}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "#FFFFFF",
                    border: "1px solid #E1E5E1",
                    borderRadius: "18px",
                    padding: "22px",
                    height: "100%",
                    textDecoration: "none",
                    color: "inherit",
                    boxShadow: "0 4px 14px rgba(18, 26, 24, 0.02)",
                    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "#CBD3CB";
                    e.currentTarget.style.boxShadow = "0 10px 26px rgba(18, 26, 24, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#E1E5E1";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(18, 26, 24, 0.02)";
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: card.bg,
                          color: card.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {card.icon}
                      </div>

                      <span
                        style={{
                          fontSize: "11.5px",
                          color: "#3A8778",
                          background: "rgba(58, 135, 120, 0.1)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontWeight: 700,
                        }}
                      >
                        {card.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#121A18", margin: "0 0 6px" }}>
                      {card.title}
                    </h3>

                    <p style={{ fontSize: "12.5px", color: "#55625F", lineHeight: "1.8", margin: 0 }}>
                      {card.desc}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid #F0F2F0",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#3A8778",
                    }}
                  >
                    <span>ورود به بخش</span>
                    <ArrowLeft size={14} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
