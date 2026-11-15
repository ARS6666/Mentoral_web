import React from "react";

// Error Boundary سطح اپلیکیشن — به‌جای صفحه سفید، پیام خطای طراحی‌شده نمایش می‌دهد
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary:", error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-canvas, #F5F6F3)",
          direction: "rtl",
          padding: "24px",
        }}
      >
        <div
          className="card"
          style={{ maxWidth: "420px", width: "100%", textAlign: "center", padding: "32px" }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-ink, #182523)",
              color: "var(--neon, #4E9A89)",
              fontSize: "28px",
            }}
          >
            ⚠️
          </div>
          <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>یک مشکل پیش آمد</h2>
          <p style={{ fontSize: "14px", marginBottom: "20px" }}>
            متأسفانه خطای غیرمنتظره‌ای رخ داد. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            بارگذاری مجدد صفحه
          </button>
        </div>
      </div>
    );
  }
}
