import React, { useState } from "react";
import {
  Shield,
  BookOpen,
  Settings,
  GraduationCap,
} from "lucide-react";

export default function Profile({ profile, onUpdateProfile, onResetAll }) {
  const [grade, setGrade] = useState(profile.grade);
  const [major, setMajor] = useState(profile.major);
  const [targetRank, setTargetRank] = useState(profile.targetRank);
  const [studyHours, setStudyHours] = useState(profile.studyHours);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaved(true);

    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, major, targetRank, studyHours }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateProfile(data.profile);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        setIsSaved(false);
      }
    } catch (err) {
      console.error("خطا در بروزرسانی پروفایل", err);
      setIsSaved(false);
    }
  };

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "800px",
        fontFamily: "Tahoma, Arial, sans-serif",
        direction: "rtl",
      }}
    >
      <div className="d-flex flex-column gap-4">
        {/* Top profile identity frame */}
        <div
          className="bg-white border shadow-sm text-center p-4"
          style={{ borderRadius: "24px", borderColor: "#f1f3f5" }}
        >
          <div
            className="mx-auto d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{
              height: "70px",
              width: "70px",
              borderRadius: "50%",
              background: "linear-gradient(to top right, #6255f5, #4f46e5)",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            {profile.major ? profile.major.charAt(0) : "U"}
          </div>
          <div className="mt-3">
            <h3 className="mb-1 fw-bolder text-dark" style={{ fontSize: "16px" }}>
              داوطلب کنکور منتورا
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
              پایه تحصیلی {profile.grade} • رشته {profile.major}
            </p>
          </div>
        </div>

        {/* Main settings form */}
        <form
          onSubmit={handleSave}
          className="bg-white border shadow-sm p-4 text-end"
          style={{ borderRadius: "24px", borderColor: "#f1f3f5" }}
        >
          <h3
            className="d-flex align-items-center justify-content-end gap-2 fw-bold text-dark mb-4"
            style={{ fontSize: "13px" }}
          >
            تنظیمات برنامه و هدف‌گذاری شما
            <Settings size={15} color="#6255f5" />
          </h3>

          {/* Grade Toggle */}
          <div className="mb-4">
            <label
              className="d-flex align-items-center justify-content-end gap-2 text-muted fw-bold mb-2"
              style={{ fontSize: "11px" }}
            >
              پایه تحصیلی
              <GraduationCap size={13} color="#a855f7" />
            </label>
            <div className="row g-2">
              {["یازدهم", "دوازدهم"].map((g) => (
                <div key={g} className="col-6">
                  <button
                    type="button"
                    onClick={() => setGrade(g)}
                    className="btn w-100 fw-bold transition-all"
                    style={{
                      fontSize: "12px",
                      borderRadius: "12px",
                      padding: "10px",
                      border: grade === g ? "1px solid #6255f5" : "1px solid #f1f3f5",
                      background: grade === g ? "rgba(98,85,245,0.05)" : "#f8f9fa",
                      color: grade === g ? "#6255f5" : "#4b5563",
                    }}
                  >
                    پایه {g}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Major Toggle */}
          <div className="mb-4">
            <label
              className="d-flex align-items-center justify-content-end gap-2 text-muted fw-bold mb-2"
              style={{ fontSize: "11px" }}
            >
              رشته تحصیلی
              <BookOpen size={13} color="#a855f7" />
            </label>
            <div className="row g-2">
              {["تجربی", "ریاضی"].map((m) => (
                <div key={m} className="col-6">
                  <button
                    type="button"
                    onClick={() => setMajor(m)}
                    className="btn w-100 fw-bold transition-all"
                    style={{
                      fontSize: "12px",
                      borderRadius: "12px",
                      padding: "10px",
                      border: major === m ? "1px solid #6255f5" : "1px solid #f1f3f5",
                      background: major === m ? "rgba(98,85,245,0.05)" : "#f8f9fa",
                      color: major === m ? "#6255f5" : "#4b5563",
                    }}
                  >
                    رشته {m}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Input Target Rank */}
          <div className="mb-4">
            <label className="d-block text-muted fw-bold mb-2" style={{ fontSize: "11px" }}>
              رتبه یا تراز فرضی هدف
            </label>
            <input
              type="text"
              value={targetRank}
              onChange={(e) => setTargetRank(e.target.value)}
              className="form-control text-end fw-bold"
              style={{
                fontSize: "12px",
                borderRadius: "12px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #f1f3f5",
                padding: "12px",
              }}
            />
          </div>

          {/* Slider Daily Hours */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span
                className="fw-bold"
                style={{
                  fontSize: "12px",
                  color: "#6255f5",
                  backgroundColor: "rgba(98,85,245,0.1)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {studyHours} ساعت
              </span>
              <span className="text-muted fw-bold" style={{ fontSize: "11px" }}>
                ساعت همگام مطالعه
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="form-range"
              style={{ accentColor: "#6255f5" }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 text-white fw-bold py-3 mt-2"
            style={{
              backgroundColor: "#6255f5",
              borderRadius: "14px",
              fontSize: "13px",
              border: "none",
            }}
          >
            {isSaved ? "✓ با موفقیت ذخیره شد" : "ذخیره‌سازی اطلاعات کاربری"}
          </button>
        </form>

        {/* Security Card */}
        <div
          className="bg-white border shadow-sm p-4 text-end"
          style={{ borderRadius: "24px", borderColor: "#f1f3f5" }}
        >
          <h3
            className="d-flex align-items-center justify-content-end gap-2 fw-bold text-dark mb-3"
            style={{ fontSize: "13px" }}
          >
            حفاظت اطلاعات و اکوسیستم
            <Shield size={15} color="#6255f5" />
          </h3>
          <p className="text-muted mb-4" style={{ fontSize: "11px", lineHeight: "1.8" }}>
            اطلاعات شما به صورت محلی در بستر کوکی‌ها و توکن‌های پلتفرم و ایمپلنت والدین بر طبق حریم خصوصی منتورا حفاظت می‌شود. هیچ معلم یا دانش‌آموز غیر مجازی به گزارش‌های تراز آزمون‌ها دسترسی نخواهد داشت.
          </p>
          <button
            type="button"
            onClick={onResetAll}
            className="btn w-100 fw-bold py-3"
            style={{
              fontSize: "12px",
              color: "#ef4444",
              border: "1px solid #fee2e2",
              borderRadius: "14px",
              backgroundColor: "transparent",
            }}
          >
            بازنشانی کامل حساب کاربری
          </button>
        </div>
      </div>
    </div>
  );
}
