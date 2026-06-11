import React from "react";
import {
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Sparkles,
  BookOpen,
  Clock,
} from "lucide-react";

export default function Today({
  profile,
  tasks,
  onToggleTask,
  readinessScore,
  streakCount,
  xpPoints,
  calendarDate,
}) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const currentProgress =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const quote =
    profile.major === "ریاضی"
      ? "موفقیت مجموعه‌ای از حساب‌های کوچک است که روز به روز حل می‌شوند. پرقدرت به تفکر و حل ادامه بده!"
      : "سلول به سلولِ تلاشت تو رو به هدف نزدیک‌تر می‌کنه. امروز با استمرار بیشتری به سمت زیباترین رویاهات حرکت کن!";

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "860px",
        fontFamily: "Tahoma, Arial, sans-serif",
        direction: "rtl",
      }}
    >
      <div className="d-flex flex-column gap-3">
        {/* Calendar and top header bar */}
        <div
          className="d-flex justify-content-between align-items-center bg-white border shadow-sm"
          style={{
            borderRadius: "20px",
            padding: "16px",
            borderColor: "#f1f3f5",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <Calendar size={18} color="#6255f5" />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#374151",
              }}
            >
              {calendarDate || "شنبه ۱۱ خرداد ۱۴۰۵"}
            </span>
          </div>

          <div
            className="d-flex align-items-center gap-2"
            style={{
              background: "#fffbeb",
              padding: "6px 12px",
              borderRadius: "14px",
              border: "1px solid #fde68a",
            }}
          >
            <Flame size={18} color="#f59e0b" fill="#f59e0b" />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#b45309",
              }}
            >
              {streakCount} روز پیاپی
            </span>
          </div>
        </div>

        {/* Hero card */}
        <div
          className="position-relative overflow-hidden text-white"
          style={{
            borderRadius: "28px",
            padding: "20px",
            background: "linear-gradient(to left, #6255f5, #4f46e5)",
            boxShadow: "0 10px 30px rgba(79,70,229,0.25)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-24px",
              left: "-24px",
              width: "96px",
              height: "96px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
            }}
          ></div>

          <div
            style={{
              position: "absolute",
              bottom: "-32px",
              right: "-32px",
              width: "128px",
              height: "128px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
            }}
          ></div>

          <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
            <div className="col-12 col-md-8 mb-3 mb-md-0 text-center text-md-end">
              <span
                className="d-inline-flex align-items-center gap-1"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles size={11} />
                هدف رتبه {profile.targetRank}
              </span>

              <h2
                className="fw-bold mt-3 mb-2"
                style={{
                  fontSize: "24px",
                  letterSpacing: "-0.3px",
                }}
              >
                آمادگی کنکور شما
              </h2>

              <p
                className="mb-0"
                style={{
                  fontSize: "11px",
                  color: "#e0e7ff",
                  lineHeight: "1.9",
                }}
              >
                با تکمیل کارهای برنامه‌ریزی‌شده، شانس موفقیت خود را افزایش دهید.
              </p>
            </div>

            <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-start">
              <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  padding: "18px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  minWidth: "120px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span style={{ fontSize: "32px", fontWeight: 900 }}>
                  {currentProgress}%
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    marginTop: "4px",
                    color: "#ede9fe",
                  }}
                >
                  تکمیل امروز
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-4"
            style={{
              height: "8px",
              width: "100%",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${currentProgress}%`,
                height: "100%",
                background: "#fbbf24",
                borderRadius: "999px",
                transition: "all 0.5s ease",
              }}
            ></div>
          </div>

          <div
            className="d-flex justify-content-between align-items-center mt-3"
            style={{
              fontSize: "11px",
              color: "#ddd6fe",
              fontWeight: 500,
            }}
          >
            <span>کسب تراز کل: {xpPoints} امتیاز</span>
            <span>
              {completedCount} از {tasks.length} کار تکمیل‌شده
            </span>
          </div>
        </div>

        {/* Daily advice */}
        <div
          className="text-end"
          style={{
            background: "rgba(98,85,245,0.05)",
            border: "1px solid rgba(98,85,245,0.15)",
            borderRadius: "20px",
            padding: "16px",
          }}
        >
          <h3
            className="d-flex align-items-center gap-2 mb-2"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#6255f5",
            }}
          >
            <Sparkles size={13} />
            مشاوره روزانه منتورا برای رشته {profile.major}
          </h3>

          <p
            className="mb-0"
            style={{
              fontSize: "12px",
              color: "#374151",
              lineHeight: "1.9",
              fontWeight: 300,
            }}
          >
            {quote}
          </p>
        </div>

        {/* Task list */}
        <div>
          <h3
            className="d-flex align-items-center gap-2 mb-3 px-1"
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            <BookOpen size={16} color="#6255f5" />
            برنامه کارهای امروز شما
          </h3>

          {tasks.length === 0 ? (
            <div
              className="bg-white text-center"
              style={{
                border: "1px dashed #d1d5db",
                borderRadius: "20px",
                padding: "32px",
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              هیچ برنامه‌ای یا کاری برای امروز تعریف نشده است.
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id, !task.completed)}
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    padding: "16px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: task.completed
                      ? "1px solid #bbf7d0"
                      : "1px solid #f1f3f5",
                    background: task.completed ? "#ecfdf5" : "#ffffff",
                    color: task.completed ? "#6b7280" : "#1f2937",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 size={20} color="#10b981" />
                    ) : (
                      <Circle size={20} color="#d1d5db" />
                    )}

                    <div className="d-flex flex-column text-end">
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "#9ca3af" : "#1f2937",
                        }}
                      >
                        {task.title}
                      </span>

                      <span
                        className="d-flex align-items-center gap-1 mt-1"
                        style={{
                          fontSize: "10px",
                          color: "#9ca3af",
                          fontWeight: 500,
                        }}
                      >
                        <Clock size={11} />
                        {task.duration}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "8px",
                      border:
                        task.category === "زیست‌شناسی"
                          ? "1px solid #bbf7d0"
                          : task.category === "فیزیک"
                          ? "1px solid #bfdbfe"
                          : task.category === "شیمی"
                          ? "1px solid #fecdd3"
                          : "1px solid #e9d5ff",
                      background:
                        task.category === "زیست‌شناسی"
                          ? "#ecfdf5"
                          : task.category === "فیزیک"
                          ? "#eff6ff"
                          : task.category === "شیمی"
                          ? "#fff1f2"
                          : "#faf5ff",
                      color:
                        task.category === "زیست‌شناسی"
                          ? "#059669"
                          : task.category === "فیزیک"
                          ? "#2563eb"
                          : task.category === "شیمی"
                          ? "#e11d48"
                          : "#9333ea",
                    }}
                  >
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Focus timer promo */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "20px",
            padding: "16px",
          }}
        >
          <div className="text-center text-md-end">
            <h4
              className="mb-1"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#92400e",
              }}
            >
              حالت تمرکز عمیق (دیپ فوکوس)
            </h4>
            <p
              className="mb-0"
              style={{
                fontSize: "11px",
                color: "rgba(146,64,14,0.85)",
                lineHeight: "1.9",
                fontWeight: 300,
              }}
            >
              واحد مطالعه کوتاه ۲۵ دقیقه‌ای را با تمرکز کامل به پایان برسانید.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              alert("قابلیت تایمر پومودورو عمیق در گام بعدی به منتورا اضافه خواهد شد!");
            }}
            className="btn text-white fw-bold"
            style={{
              background: "#d97706",
              borderRadius: "14px",
              fontSize: "11px",
              padding: "8px 16px",
              border: "none",
            }}
          >
            شروع تایمر
          </button>
        </div>
      </div>
    </div>
  );
}
