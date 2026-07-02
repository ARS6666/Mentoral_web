import React from "react";
import { Heart, Instagram, Send, Mail } from "lucide-react";

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white mt-4"
      style={{
        fontFamily: "Vazir, sans-serif",
        borderTop: "1px solid #eef2f7",
      }}
      aria-label="فوتر سایت منتورا"
    >
      <style>
        {`
          .footer-container {
            padding: 28px 16px;
          }

          .footer-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
          }

          @media (min-width: 768px) {
            .footer-container {
              padding: 42px 0;
            }

            .footer-grid {
              grid-template-columns: 2fr 1fr 1fr 1fr;
              gap: 40px;
              align-items: flex-start;
            }
          }

          .footer-section-title {
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 14px;
            color: #111827;
          }

          .footer-link {
            display: block;
            color: #6b7280;
            text-decoration: none;
            font-size: 13px;
            margin-bottom: 10px;
            transition: all .2s ease;
          }

          .footer-link:hover {
            color: #6255f5;
            transform: translateX(-2px);
          }

          .footer-socials {
            display: flex;
            gap: 14px;
            margin-top: 12px;
          }

          .footer-socials a {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            background: #f8fafc;
            border: 1px solid #eef2f7;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all .2s ease;
          }

          .footer-socials a:hover {
            background: #6255f5;
            border-color: #6255f5;
            transform: translateY(-2px);
          }

          .footer-socials a:hover svg {
            color: #fff !important;
          }

          .footer-trust-column {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .trust-box {
            background: #fff;
            border: 1px solid #eef2f7;
            border-radius: 18px;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 110px;
            transition: all .25s ease;
            box-shadow: 0 4px 12px rgba(15,23,42,0.03);
          }

          .trust-box:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 24px rgba(15,23,42,0.08);
          }

          .trust-box img {
            max-width: 100px;
            max-height: 100px;
            object-fit: contain;
          }

          .footer-about-text {
            font-size: 12px;
            color: #6b7280;
            line-height: 2;
            margin: 0;
          }

          .footer-bottom {
            border-top: 1px solid #f3f4f6;
            margin-top: 32px;
            padding-top: 18px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
          }

          @media (max-width: 767px) {

            .footer-section {
              text-align: center;
            }

            .footer-socials {
              justify-content: center;
            }

            .footer-trust-column {
              align-items: center;
            }

            .trust-box {
              width: 180px;
            }
          }
        `}
      </style>

      <div
        className="container"
        style={{
          maxWidth: "1150px",
          direction: "rtl",
        }}
      >
        <div className="footer-container">

          <div className="footer-grid">

            {/* درباره منتورا */}
            <div className="footer-section">
              <h2
                className="d-flex align-items-center gap-2 mb-3 justify-content-center justify-content-md-start"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "#6255f5",
                }}
              >
                <img
                  src="/logo-mark.png"
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "28px",
                    height: "28px",
                    objectFit: "contain",
                  }}
                />
                منتورا
              </h2>

              <p className="footer-about-text">
                منتورا یک پلتفرم هوشمند برنامه‌ریزی درسی و مدیریت مطالعه است
                که به دانش‌آموزان کمک می‌کند تمرکز، برنامه‌ریزی و پیشرفت
                تحصیلی خود را بهتر مدیریت کنند.
              </p>
            </div>

            {/* دسترسی سریع */}
            <div className="footer-section">
              <h6 className="footer-section-title">
                دسترسی سریع
              </h6>

              <a href="/home" className="footer-link">
                داشبورد اصلی
              </a>

              <a href="/reports" className="footer-link">
                تحلیل عملکرد
              </a>

              <a href="/subscription" className="footer-link">
                ارتقای اشتراک
              </a>

              <a href="/aboutus" className="footer-link">
                درباره ما
              </a>
            </div>

            {/* ارتباط با ما */}
            <div className="footer-section">
              <h6 className="footer-section-title">
                ارتباط با ما
              </h6>

              <a
                href="mailto:mentora.support1@gmail.com"
                className="footer-link d-flex align-items-center gap-2 justify-content-center justify-content-md-start"
              >
                <Mail size={15} />
                mentora.support1@gmail.com
              </a>

              <div className="footer-socials">
                <a
                  href="https://www.instagram.com/mentoralearn"
                  aria-label="اینستاگرام منتورا"
                >
                  <Instagram size={18} color="#6b7280" />
                </a>

                <a
                  href="https://t.me/MentoraSupport1"
                  aria-label="تلگرام منتورا"
                >
                  <Send size={18} color="#6b7280" />
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h6 className="footer-section-title">
                مجوزها و پرداخت
              </h6>

              <div className="footer-trust-column">

                <div className="trust-box">
                  <a
                    referrerPolicy="origin"
                    target="_blank"
                    rel="noreferrer"
                    href="https://trustseal.enamad.ir/?id=752644&Code=eBufEsExjpps5gNxuGQsvuudVlFSQBug"
                  >
                    <img
                      referrerPolicy="origin"
                      src="https://trustseal.enamad.ir/logo.aspx?id=752644&Code=eBufEsExjpps5gNxuGQsvuudVlFSQBug"
                      alt="نماد اعتماد الکترونیکی"
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                </div>

                <div className="trust-box">
                  <img
                    // src="https://i.pravatar.cc/100?img=12"
                    alt="درگاه پرداخت امن"
                  />
                </div>

              </div>
            </div>

          </div>

          <div className="footer-bottom">
            تمامی حقوق محفوظ است © {currentYear} | ساخته شده با{" "}
            <Heart
              size={12}
              color="#ef4444"
              className="d-inline"
            />{" "}
            برای دانش‌آموزان پرتلاش
          </div>

        </div>
      </div>
    </footer>
  );
}
