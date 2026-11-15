import React from "react";
import { BookOpen, Target, Sparkles } from "lucide-react";

export default function StudyLoading(props) {
  const {
    title = "در حال بارگذاری...",
    subtitle = "لطفاً کمی صبر کنید",
    fullScreen = true,
  } = props;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        direction: "rtl",
        minHeight: fullScreen ? "100vh" : "320px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "90px",
            height: "90px",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              border: "2px solid rgba(95,240,192,0.5)",
              animation: "studyPulse 2s infinite",
            }}
          />
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "22px",
              background: "var(--bg-ink)",
              color: "var(--neon)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <BookOpen size={30} />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "22px",
            right: "22px",
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "var(--primary-tint)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "studyFloat 2.6s ease-in-out infinite",
          }}
        >
          <Target size={18} />
        </div>

        <div
          style={{
            position: "absolute",
            top: "72px",
            left: "24px",
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "var(--secondary-tint)",
            color: "var(--info)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "studyFloat 2.8s ease-in-out infinite",
          }}
        >
          <Sparkles size={18} />
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
          {title}
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
          {subtitle}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "8px",
            height: "52px",
            marginBottom: "20px",
          }}
        >
          {[0, 0.15, 0.3, 0.45, 0.6].map((delay) => (
            <div
              key={delay}
              style={{
                width: "10px",
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(to top, var(--primary), var(--neon))",
                transformOrigin: "bottom",
                animation: "studyBounce 1s ease-in-out infinite",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {[0, 0.2, 0.4].map((delay) => (
            <span
              key={delay}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--primary)",
                display: "inline-block",
                animation: "studyDots 1.2s infinite ease-in-out",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>

        <div className="caption" style={{ fontWeight: 600 }}>
          منتورا در حال چیدن مسیر موفقیت تو است
        </div>
      </div>

      <style>
        {`
          @keyframes studyBounce {
            0%, 100% { transform: scaleY(0.45); opacity: 0.5; }
            50% { transform: scaleY(1); opacity: 1; }
          }

          @keyframes studyPulse {
            0% { transform: scale(0.9); opacity: 0.5; }
            70% { transform: scale(1.4); opacity: 0; }
            100% { transform: scale(1.5); opacity: 0; }
          }

          @keyframes studyFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes studyDots {
            0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
