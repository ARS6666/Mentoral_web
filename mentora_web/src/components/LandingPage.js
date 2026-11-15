import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Brain,
  CalendarCheck2,
  BookOpenCheck,
  BarChart3,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Bot,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import PublicNavbar from "./PublicNavbar";

export default function LandingPage() {
  const { isAuthenticated } = useApp();
  const [activePreviewTab, setActivePreviewTab] = useState("tutor");
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive todo list state for the "Today" preview tab
  const [tasks, setTasks] = useState([
    { id: 1, text: "حل ۲۰ تست فیزیک (حرکت‌شناسی)", done: true, tag: "فیزیک" },
    { id: 2, text: "مرور زیست‌شناسی فصل ۲ (تنفس سلولی)", done: true, tag: "زیست" },
    { id: 3, text: "آزمون مبحثی شیمی دوازدهم", done: false, tag: "شیمی" },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };
  const faqs = [
    {
      q: "منتورا برای چه پایه‌ها و رشته‌هایی طراحی شده؟",
      a: "منتورا به طور اختصاصی برای پایه‌های دهم، یازدهم، دوازدهم و داوطلبان کنکور سراسری (رشته‌های تجربی، ریاضی و انسانی) بهینه‌سازی و منطبق بر کتب رسمی آموزش و پرورش ساخته شده است.",
    },
    {
      q: "معلم هوشمند چگونه سؤالات را حل می‌کند؟",
      a: "می‌توانید متن سؤال یا تصویر آن را ارسال کنید. سیستم با تحلیل فرمول‌ها و گزینه‌ها، پاسخ تشریحی را مرحله‌به‌مرحله با نمایش صحیح فرمول‌های ریاضی و فیزیک به شما آموزش می‌دهد.",
    },
    {
      q: "برنامه‌ریزی منتورا چه تفاوتی با برنامه‌های معمولی دارد؟",
      a: "برنامه منتورا تطبیقی است؛ یعنی بر اساس ساعات خالی روزمره، نقاط ضعف شناسایی‌شده و سرعت واقعی تست‌زنی شما چیده می‌شود و هر هفته خود را با عملکردتان تنظیم می‌کند.",
    },
    {
      q: "آیا استفاده اولیه و تست رایگان وجود دارد؟",
      a: "بله، می‌توانید در کمتر از یک دقیقه ثبت‌نام کنید و امکانات اصلی مانند چت با معلم هوشمند، ساخت برنامه و حل تست را بدون هزینه تست نمایید.",
    },
  ];

  return (
    <div
      className="mentora-app"
      style={{
        direction: "rtl",
        fontFamily: "'Vazir', 'Vazirmatn', system-ui, sans-serif",
        background: "#F5F6F3",
        color: "#121A18",
        minHeight: "100vh",
      }}
    >
      <Helmet>
        <title>منتورا | همراه هوشمند برنامه‌ریزی و کنکور</title>
        <meta
          name="description"
          content="پلتفرم هوشمند مطالعه و کنکور ایران. برنامه‌ریزی تطبیقی، معلم هوشمند ۲۴/۷ و تحلیل دقیق عملکرد."
        />
      </Helmet>

      <style>{`
        :root {
          --pd-dark: #182523;
          --pd-dark-card: #1F2E2A;
          --pd-canvas: #F5F6F3;
          --pd-surface: #FFFFFF;
          --pd-border: #E1E5E1;
          --pd-mint: #3A8778;
          --pd-mint-hover: #2F7063;
          --pd-mint-light: #E7F1EE;
          --pd-text-main: #121A18;
          --pd-text-muted: #55625F;
        }

        .m-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .m-nav-link {
          color: var(--pd-text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 8px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .m-nav-link:hover {
          color: var(--pd-text-main);
          background: rgba(18, 26, 24, 0.04);
        }

        .m-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(58, 135, 120, 0.12);
          color: #4E9A89;
          font-size: 12.5px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid rgba(78, 154, 137, 0.25);
          margin-bottom: 20px;
        }
        .m-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4E9A89;
        }

        .m-btn-mint {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #3A8778;
          color: #FFFFFF !important;
          font-weight: 700;
          font-size: 14.5px;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(58, 135, 120, 0.25);
        }
        .m-btn-mint:hover {
          background: #2F7063;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(58, 135, 120, 0.35);
        }

        .m-btn-ghost-dark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF !important;
          font-weight: 600;
          font-size: 14.5px;
          padding: 12px 22px;
          border-radius: 12px;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.18);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .m-btn-ghost-dark:hover {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.35);
        }

        .m-card {
          background: #FFFFFF;
          border: 1px solid var(--pd-border);
          border-radius: 18px;
          padding: 32px 28px;
          transition: all 0.2s ease;
        }
        .m-card:hover {
          border-color: #CBD3CB;
          box-shadow: 0 10px 30px rgba(18, 26, 24, 0.04);
          transform: translateY(-2px);
        }

        .m-mint-line {
          width: 44px;
          height: 3px;
          background: #4E9A89;
          border-radius: 999px;
          margin: 16px auto 20px;
        }

        .m-section {
          padding: 92px 0;
        }
        @media (max-width: 768px) {
          .m-section {
            padding: 60px 0;
          }
        }
      `}</style>

      {/* HEADER NAVIGATION */}
      <PublicNavbar />

      {/* =========================================================================
          HERO SECTION (Dark Slate #182523)
          ========================================================================= */}
      <section
        style={{
          background: "var(--pd-dark)",
          color: "#FFFFFF",
          padding: "80px 0 90px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="m-container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          {/* Badge */}
          <div className="m-badge">
            <span className="m-badge-dot" />
            <span>یک مربی هوشمند برای کل مسیر کنکور و مدرسه</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "clamp(32px, 5.2vw, 58px)",
              fontWeight: 900,
              lineHeight: 1.25,
              margin: "0 0 16px",
              letterSpacing: "-0.5px",
            }}
          >
            با برنامه درس بخون، خیلی راحت‌تر نتیجه بگیر
          </h1>

          <div className="m-mint-line" />

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(16px, 1.8vw, 18.5px)",
              lineHeight: 1.85,
              color: "rgba(245, 246, 243, 0.82)",
              maxWidth: "680px",
              margin: "0 auto 36px",
            }}
          >
            وقتی هر روز بدونی دقیقاً قراره چی بخونی و هر سؤالی رو همون لحظه بتونی بپرسی، مسیر کنکور و یادگیری خیلی سبک‌تر و راحت‌تر جلو میره.
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "56px",
            }}
          >
            <Link
              to={isAuthenticated ? "/home" : "/signin"}
              className="m-btn-mint"
              style={{ padding: "14px 32px", fontSize: "16px" }}
            >
              {isAuthenticated ? "ورود به داشبورد" : "شروع رایگان مطالعه"}
              <ArrowLeft size={18} />
            </Link>
          </div>

          {/* =========================================================================
              INTERACTIVE APP PREVIEW CARD (Visual Demo)
              ========================================================================= */}
          <div
            id="preview"
            style={{
              maxWidth: "840px",
              margin: "0 auto",
              background: "var(--pd-dark-card)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
              textAlign: "right",
            }}
          >
            {/* Card Header with Interactive Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(0, 0, 0, 0.15)",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E06C75", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5C07B", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#98C379", display: "inline-block" }} />
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginRight: "10px", fontFamily: "monospace" }}>
                  Mentora Live Demo
                </span>
              </div>

              {/* Tab buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  maxWidth: "100%",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                }}
              >
                {[
                  { id: "tutor", label: "معلم هوشمند ۲۴/۷", icon: <Bot size={15} /> },
                  { id: "today", label: "برنامه امروز", icon: <CalendarCheck2 size={15} /> },
                  { id: "analytics", label: "تحلیل تسلط", icon: <BarChart3 size={15} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id)}
                    style={{
                      background: activePreviewTab === tab.id ? "rgba(78, 154, 137, 0.25)" : "transparent",
                      border: activePreviewTab === tab.id ? "1px solid #4E9A89" : "1px solid transparent",
                      color: activePreviewTab === tab.id ? "#4E9A89" : "rgba(255, 255, 255, 0.65)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: Tutor Preview */}
            {activePreviewTab === "tutor" && (
              <div style={{ padding: "clamp(16px, 3.5vw, 26px)" }}>
                {/* User Message */}
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "18px" }}>
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "14px 14px 2px 14px",
                      padding: "12px 18px",
                      maxWidth: "92%",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: "#FFFFFF",
                      wordBreak: "break-word",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                      دانش‌آموز (سؤال تستی):
                    </div>
                    سلام، این سؤال فیزیک حرکت با شتاب ثابت چرا گزینه‌ی ۳ نمیشه؟ عکسش رو هم فرستادم.
                  </div>
                </div>

                {/* AI Tutor Response */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      background: "rgba(58, 135, 120, 0.14)",
                      border: "1px solid rgba(78, 154, 137, 0.35)",
                      borderRadius: "14px 14px 14px 2px",
                      padding: "16px 20px",
                      maxWidth: "92%",
                      fontSize: "14px",
                      lineHeight: 1.8,
                      color: "#FFFFFF",
                      wordBreak: "break-word",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4E9A89", fontWeight: 800, marginBottom: "8px", fontSize: "13px" }}>
                      <Sparkles size={16} />
                      معلم هوشمند منتورا:
                    </div>
                    سلام! نکته‌ی کلیدی در علامت شتاب است. چون متحرک در حال ترمز کردن است، <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px", color: "#62B8A5" }}>a = -2 m/s²</code> قرار می‌گیرد.
                    <div style={{ marginTop: "8px", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", fontSize: "13px" }}>
                      فرمول مستقل از زمان: <strong>v² - v₀² = 2aΔx</strong>
                      <br />
                      بنابراین مسافت توقف برابر با <strong>۲۵ متر</strong> می‌شود (گزینه ۲ صحیح است).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Today Tasks Preview */}
            {activePreviewTab === "today" && (
              <div style={{ padding: "clamp(16px, 3.5vw, 26px)" }}>
                <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "16px" }}>
                  برنامه تطبیقی امروز شما (روی تسک‌ها کلیک کنید تا وضعیت تغییر کند):
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: task.done ? "rgba(78, 154, 137, 0.12)" : "rgba(255, 255, 255, 0.05)",
                        border: task.done ? "1px solid rgba(78, 154, 137, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        cursor: "pointer",
                        gap: "10px",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "6px",
                            border: task.done ? "none" : "2px solid rgba(255, 255, 255, 0.3)",
                            background: task.done ? "#4E9A89" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                            flexShrink: 0,
                          }}
                        >
                          {task.done && <Check size={14} />}
                        </div>
                        <span
                          style={{
                            fontSize: "13.5px",
                            color: task.done ? "rgba(255, 255, 255, 0.6)" : "#FFFFFF",
                            textDecoration: task.done ? "line-through" : "none",
                            wordBreak: "break-word",
                          }}
                        >
                          {task.text}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "6px",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "#4E9A89",
                          flexShrink: 0,
                        }}
                      >
                        {task.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Analytics Preview */}
            {activePreviewTab === "analytics" && (
              <div style={{ padding: "clamp(16px, 3.5vw, 26px)" }}>
                <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "16px" }}>
                  نمودار تسلط علمی و پیشرفت واقعی بدون حدس و گمان:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "14px" }}>
                  {[
                    { subject: "زیست‌شناسی", score: "۸۲٪", desc: "تسلط کامل بر ژنتیک و گیاهی", color: "#4E9A89" },
                    { subject: "شیمی", score: "۷۴٪", desc: "نیاز به مرور سینتیک و تعادل", color: "#5AA897" },
                    { subject: "ریاضی و فیزیک", score: "۶۸٪", desc: "پیشرفت +۱۲٪ در دو هفته اخیر", color: "#8BB5A8" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "14px",
                        padding: "18px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{stat.subject}</span>
                        <span style={{ fontSize: "16px", fontWeight: 900, color: stat.color }}>{stat.score}</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "999px", overflow: "hidden", marginBottom: "10px" }}>
                        <div style={{ width: stat.score, height: "100%", background: stat.color, borderRadius: "999px" }} />
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>{stat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4 CORE ENGINES / FEATURES (Light Paper #F5F6F3)
          ========================================================================= */}
      <section id="features" className="m-section">
        <div className="m-container">
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 52px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--pd-mint)", marginBottom: "8px" }}>
              امکانات کلیدی
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 900, margin: "0 0 12px" }}>
              چهار ابزار قدرتمند، در یک تجربه ساده
            </h2>
            <p style={{ fontSize: "15px", color: "var(--pd-text-muted)", margin: 0 }}>
              به جای سردرگمی بین چند اپلیکیشن، کتاب تست و مشاور حضوری، همه‌چیز یکپارچه کنار توست.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                icon: <CalendarCheck2 size={24} />,
                title: "برنامه‌ریز تطبیقی",
                desc: "برنامه‌ای که هر روز با ساعت مطالعه، سرعت تست‌زنی و اهداف هفتگی خودت تنظیم می‌شود.",
              },
              {
                icon: <Brain size={24} />,
                title: "معلم هوشمند ۲۴/۷",
                desc: "پاسخ فوری به سؤالات تستی و مفهومی؛ تایپ کن یا عکس سؤال را بفرست و گام‌به‌گام یاد بگیر.",
              },
              {
                icon: <BookOpenCheck size={24} />,
                title: "بانک تست طبقه‌بندی‌شده",
                desc: "هزاران تست استاندارد به تفکیک پایه و مبحث با رندر دقیق فرمول‌های ریاضی و فیزیک.",
              },
              {
                icon: <BarChart3 size={24} />,
                title: "گزارش شفاف پیشرفت",
                desc: "شناسایی نقاط ضعف و خطاهای پرتکرار بدون حدس و گمان، قابل فهم برای دانش‌آموز و والدین.",
              },
            ].map((f, i) => (
              <div key={i} className="m-card">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "var(--pd-mint-light)",
                    color: "var(--pd-mint)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px", color: "var(--pd-text-main)" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--pd-text-muted)", margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (Simple 3-step loop)
          ========================================================================= */}
      <section id="loop" className="m-section" style={{ background: "#ECEFEA", borderTop: "1px solid var(--pd-border)", borderBottom: "1px solid var(--pd-border)" }}>
        <div className="m-container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--pd-mint)", marginBottom: "8px" }}>
              مسیر یادگیری
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 900, margin: "0 0 12px" }}>
              چگونه کار می‌کند؟
            </h2>
            <p style={{ fontSize: "15px", color: "var(--pd-text-muted)", margin: 0 }}>
              یک حلقه بسته و هدفمند که در هر تکرار، مسیر تو را دقیق‌تر و هموارتر می‌سازد.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                num: "۰۱",
                title: "سنجش و ثبت هدف",
                desc: "رشته، پایه و هدف قبولی‌ات را انتخاب می‌کنی تا منتورا شناختی دقیق از شرایطت پیدا کند.",
              },
              {
                num: "۰۲",
                title: "مطالعه و رفع اشکال",
                desc: "برنامه روزانه‌ات را اجرا می‌کنی، تست می‌زنی و هرجا گیر کردی از معلم هوشمند سؤال می‌پرسی.",
              },
              {
                num: "۰۳",
                title: "تحلیل و بازتنظیم خودکار",
                desc: "نتیجه تست‌ها به تحلیل تسلط تبدیل شده و برنامه هفته بعد بر پایه نقاط ضعفت بهینه می‌شود.",
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--pd-border)",
                  borderRadius: "16px",
                  padding: "30px 24px",
                }}
              >
                <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 900, color: "var(--pd-mint)", marginBottom: "12px" }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px", color: "var(--pd-text-main)" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--pd-text-muted)", margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MINIMAL BEFORE & AFTER COMPARISON
          ========================================================================= */}
      <section className="m-section">
        <div className="m-container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
            <h2 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", fontWeight: 900, margin: "0 0 12px" }}>
              چرا منتورا؟
            </h2>
            <p style={{ fontSize: "15px", color: "var(--pd-text-muted)", margin: 0 }}>
              تفاوت مسیر درس خواندن سنتی در برابر مطالعه هدفمند با هوش مصنوعی
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "24px",
              maxWidth: "880px",
              margin: "0 auto",
            }}
          >
            {/* Old Way */}
            <div
              style={{
                background: "#EAECEA",
                border: "1px solid #D8DDD8",
                borderRadius: "18px",
                padding: "32px 26px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#85918E", marginBottom: "8px" }}>
                روش سنتی
              </div>
              <h3 style={{ fontSize: "19px", fontWeight: 800, marginBottom: "20px", color: "var(--pd-text-main)" }}>
                ابزارهای پراکنده و خسته‌کننده
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "برنامه‌های ثابت روی کاغذ که بعد از چند روز رها می‌شوند",
                  "سؤالاتی که همان شب پیش می‌آیند اما بی‌پاسخ می‌مانند",
                  "تست‌زنی فله‌ای بدون آگاهی از علت غلط زدن گزینه‌ها",
                  "اضطراب خانواده از ندانستن وضعیت واقعی پیشرفت",
                ].map((item, idx) => (
                  <li key={idx} style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--pd-text-muted)", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#A0AAA7" }}>✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mentora Way */}
            <div
              style={{
                background: "#FFFFFF",
                border: "2px solid var(--pd-mint)",
                borderRadius: "18px",
                padding: "32px 26px",
                boxShadow: "0 10px 30px rgba(58, 135, 120, 0.08)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--pd-mint)", marginBottom: "8px" }}>
                با منتورا
              </div>
              <h3 style={{ fontSize: "19px", fontWeight: 800, marginBottom: "20px", color: "var(--pd-text-main)" }}>
                یک همراه هوشمند و پیوسته
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "برنامه منعطف که با ساعات آزاد و توان واقعی خودت تنظیم می‌شود",
                  "معلم هوشمند ۲۴ ساعته؛ عکس سؤال را بفرست و پاسخ فوری بگیر",
                  "تحلیل علل اشتباهات تستی و رندر دقیق فرمول‌های ریاضی",
                  "گزارش‌های شفاف و روشن از میزان تسلط بر هر مبحث",
                ].map((item, idx) => (
                  <li key={idx} style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--pd-text-main)", display: "flex", gap: "8px", fontWeight: 600 }}>
                    <span style={{ color: "var(--pd-mint)", fontWeight: 900 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION
          ========================================================================= */}
      <section id="faqs" className="m-section" style={{ borderTop: "1px solid var(--pd-border)" }}>
        <div className="m-container" style={{ maxWidth: "780px" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <h2 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", fontWeight: 900, margin: "0 0 10px" }}>
              سؤالات متداول
            </h2>
            <p style={{ fontSize: "15px", color: "var(--pd-text-muted)", margin: 0 }}>
              پاسخ به پرتکرارترین پرسش‌های دانش‌آموزان و والدین
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid var(--pd-border)",
                    borderRadius: "14px",
                    overflow: "hidden",
                    transition: "all 0.2s",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      padding: "20px 22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "right",
                      fontSize: "15.5px",
                      fontWeight: 800,
                      color: "var(--pd-text-main)",
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--pd-mint)" /> : <ChevronDown size={18} color="#888" />}
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: "0 22px 20px",
                        fontSize: "14.5px",
                        lineHeight: 1.85,
                        color: "var(--pd-text-muted)",
                        borderTop: "1px solid #F0F2EF",
                        paddingTop: "14px",
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CTA (Dark Slate #182523)
          ========================================================================= */}
      <section
        style={{
          background: "var(--pd-dark)",
          color: "#FFFFFF",
          padding: "88px 0",
          textAlign: "center",
        }}
      >
        <div className="m-container" style={{ maxWidth: "680px" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4.4vw, 46px)",
              fontWeight: 900,
              margin: "0 0 16px",
              lineHeight: 1.3,
            }}
          >
            آماده‌ای مسیر درس خواندنت را متحول کنی؟
          </h2>

          <div className="m-mint-line" />

          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              lineHeight: 1.8,
              color: "rgba(245, 246, 243, 0.72)",
              margin: "0 0 36px",
            }}
          >
            همین امروز بدون نیاز به نصب برنامه یا پرداخت هزینه، با شماره موبایلت وارد شو و مطالعه هوشمند را تجربه کن.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              justifyContent: "center",
            }}
          >
            <Link
              to={isAuthenticated ? "/home" : "/signin"}
              className="m-btn-mint"
              style={{ padding: "14px 34px", fontSize: "16px" }}
            >
              {isAuthenticated ? "ورود به حساب کاربری" : "ورود و شروع رایگان"}
              <ArrowLeft size={18} />
            </Link>
            <Link
              to="/subscriptionplans"
              className="m-btn-ghost-dark"
              style={{ padding: "14px 28px", fontSize: "16px" }}
            >
              مشاهده تعرفه‌ها و پلن‌ها
            </Link>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer
        style={{
          background: "#ECEFEA",
          borderTop: "1px solid var(--pd-border)",
          padding: "32px 0",
        }}
      >
        <div
          className="m-container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo-mark.png" alt="Mentora" style={{ width: "26px", height: "26px" }} />
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--pd-text-main)" }}>
              منتورا · دستیار هوشمند مطالعه و کنکور
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <Link to="/aboutus" className="m-nav-link" style={{ fontSize: "13px" }}>
              درباره ما
            </Link>
            <Link to="/subscriptionplans" className="m-nav-link" style={{ fontSize: "13px" }}>
              تعرفه‌ها
            </Link>
            <Link to="/blog" className="m-nav-link" style={{ fontSize: "13px" }}>
              بلاگ
            </Link>
            <Link to="/support" className="m-nav-link" style={{ fontSize: "13px" }}>
              پشتیبانی
            </Link>
          </div>

          <div style={{ fontSize: "12px", color: "var(--pd-text-muted)" }}>
            © {new Date().getFullYear()} تمامی حقوق برای منتورا محفوظ است.
          </div>
        </div>
      </footer>
    </div>
  );
}
