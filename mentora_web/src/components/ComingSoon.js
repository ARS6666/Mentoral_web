import React from "react";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";

const ComingSoon = () => {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <>
      <Helmet>
        <title>به‌زودی | منتورا</title>
        <meta
          name="description"
          content="این بخش از منتورا به‌زودی با قابلیت‌های جدید در دسترس قرار می‌گیرد."
        />
      </Helmet>

      <style>{`
        .coming-page {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px 60px;
          direction: rtl;
          overflow: hidden;
        }

        .coming-wrapper {
          width: min(100%, 560px);
          position: relative;
        }

        .coming-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: var(--primary, #e53935);
          opacity: 0.055;
          filter: blur(55px);
          pointer-events: none;
        }

        .coming-card {
          position: relative;
          z-index: 1;
          width: 100%;
          padding: 46px 38px 38px;
          text-align: center;
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow:
            0 24px 60px rgba(31, 41, 55, 0.09),
            0 4px 14px rgba(31, 41, 55, 0.035);
          backdrop-filter: blur(12px);
        }

        .coming-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 92px;
          height: 92px;
          margin-bottom: 23px;
          border-radius: 27px;
          color: var(--neon, #fff);
          background:
            radial-gradient(
              circle at 35% 25%,
              rgba(255, 255, 255, 0.18),
              transparent 34%
            ),
            linear-gradient(
              145deg,
              var(--bg-ink, #172033),
              #242d42
            );
          box-shadow:
            0 16px 30px rgba(23, 32, 51, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .coming-icon-wrap::before {
          content: "";
          position: absolute;
          inset: -7px;
          border: 1px solid rgba(229, 57, 53, 0.12);
          border-radius: 31px;
        }

        .coming-icon {
          animation: comingFloat 3s ease-in-out infinite;
        }

        @keyframes comingFloat {
          0%,
          100% {
            transform: translateY(0) rotate(-3deg);
          }

          50% {
            transform: translateY(-5px) rotate(3deg);
          }
        }

        .coming-spark {
          position: absolute;
          top: 8px;
          left: 8px;
          color: var(--primary, #e53935);
          animation: comingSpark 2s ease-in-out infinite;
        }

        @keyframes comingSpark {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.8) rotate(0);
          }

          50% {
            opacity: 1;
            transform: scale(1) rotate(12deg);
          }
        }

        .coming-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 12px;
          padding: 7px 11px;
          border: 1px solid rgba(229, 57, 53, 0.11);
          border-radius: 999px;
          color: var(--primary, #e53935);
          background: rgba(229, 57, 53, 0.06);
          font-size: 10px;
          font-weight: 900;
        }

        .coming-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary, #e53935);
          box-shadow: 0 0 0 4px rgba(229, 57, 53, 0.08);
        }

        .coming-title {
          margin: 0 0 12px;
          color: #172033;
          font-size: clamp(25px, 5vw, 31px);
          line-height: 1.4;
          font-weight: 900;
          letter-spacing: -0.6px;
        }

        .coming-description {
          max-width: 450px;
          margin: 0 auto;
          color: #7b8497;
          font-size: 13px;
          line-height: 2;
          font-weight: 500;
        }

        .coming-divider {
          width: 55px;
          height: 3px;
          margin: 22px auto;
          border-radius: 99px;
          background: linear-gradient(
            90deg,
            var(--primary, #e53935),
            var(--primary-dark, #c62828)
          );
          opacity: 0.8;
        }

        .coming-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-width: 160px;
          min-height: 47px;
          padding: 0 18px;
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 13px;
          color: #3b4558;
          background: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(31, 41, 55, 0.055);
          transition:
            transform 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .coming-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(229, 57, 53, 0.07) 50%,
            transparent 75%
          );
          transform: translateX(130%);
          transition: transform 0.55s ease;
        }

        .coming-button:hover::before {
          transform: translateX(-130%);
        }

        .coming-button:hover {
          color: var(--primary, #e53935);
          border-color: rgba(229, 57, 53, 0.2);
          box-shadow: 0 10px 24px rgba(31, 41, 55, 0.09);
          transform: translateY(-2px);
        }

        .coming-button:active {
          transform: translateY(0);
        }

        .coming-button svg {
          transition: transform 0.2s ease;
        }

        .coming-button:hover svg {
          transform: translateX(3px);
        }

        .coming-footer {
          margin-top: 19px;
          color: #a0a7b5;
          font-size: 10px;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .coming-page {
            min-height: calc(100vh - 60px);
            padding: 22px 12px 40px;
          }

          .coming-card {
            padding: 38px 22px 28px;
            border-radius: 22px;
          }

          .coming-icon-wrap {
            width: 82px;
            height: 82px;
            border-radius: 24px;
          }

          .coming-icon-wrap::before {
            border-radius: 28px;
          }

          .coming-title {
            font-size: 25px;
          }

          .coming-description {
            font-size: 12px;
            line-height: 2;
          }

          .coming-button {
            width: 100%;
          }
        }

        @media (max-width: 360px) {
          .coming-card {
            padding: 32px 17px 24px;
          }

          .coming-icon-wrap {
            width: 74px;
            height: 74px;
            margin-bottom: 19px;
          }

          .coming-title {
            font-size: 23px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .coming-icon,
          .coming-spark {
            animation: none;
          }

          .coming-button,
          .coming-button::before,
          .coming-button svg {
            transition: none;
          }
        }
      `}</style>

      <main className="coming-page">
        <div className="coming-wrapper">
          <div className="coming-glow" />

          <section className="coming-card">
            <div className="coming-icon-wrap">
              <Sparkles className="coming-spark" size={15} />
              <Rocket
                className="coming-icon"
                size={40}
                strokeWidth={1.7}
              />
            </div>

            <div className="coming-badge">
              <span className="coming-badge-dot" />
              در حال آماده‌سازی
            </div>

            <h1 className="coming-title">
              به‌زودی در منتورا!
            </h1>

            <p className="coming-description">
              ما در حال آماده‌سازی یک تجربه جدید برای شما هستیم.
              این بخش به‌زودی با قابلیت‌های کاربردی و جذاب در دسترس
              قرار خواهد گرفت.
            </p>

            <div className="coming-divider" />

            <button
              type="button"
              className="coming-button"
              onClick={handleBack}
            >
              <span>بازگشت به صفحه قبل</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>

            <div className="coming-footer">
              منتورا؛ مسیر هوشمندتر یادگیری
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ComingSoon;