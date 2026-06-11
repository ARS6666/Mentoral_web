import React, { useState } from "react";

const Login = ({ onSubmit, onNavigateToSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password, remember });
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        className="w-100 bg-white border shadow"
        style={{
          maxWidth: "420px",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
          borderColor: "#e2e8f0",
        }}
      >
        <div className="text-center mb-4">
          <h1
            className="fw-bold mb-2"
            style={{
              fontSize: "30px",
              color: "#0f172a",
            }}
          >
            Welcome Back
          </h1>
          <p
            className="mb-0"
            style={{
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            Log in to continue to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{
                fontSize: "14px",
                color: "#334155",
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "14px 16px",
                borderRadius: "14px",
                borderColor: "#cbd5e1",
                fontSize: "14px",
              }}
            />
          </div>

          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{
                fontSize: "14px",
                color: "#334155",
              }}
            >
              Password
            </label>

            <div className="position-relative d-flex align-items-center">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: "14px 16px",
                  paddingRight: "72px",
                  borderRadius: "14px",
                  borderColor: "#cbd5e1",
                  fontSize: "14px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="btn position-absolute"
                style={{
                  right: "12px",
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: "13px",
                  boxShadow: "none",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
            <label
              className="d-flex align-items-center gap-2"
              style={{
                fontSize: "14px",
                color: "#475569",
              }}
            >
              <input
                type="checkbox"
                className="form-check-input m-0"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span style={{ fontSize: "14px" }}>Remember me</span>
            </label>

            <button
              type="button"
              className="btn p-0"
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{
              marginTop: "6px",
              padding: "14px 18px",
              borderRadius: "14px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "15px",
            }}
          >
            Log In
          </button>
        </form>

        <div className="mt-4 d-flex justify-content-center align-items-center gap-2 flex-wrap">
          <span
            style={{
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Don’t have an account?
          </span>
          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="btn p-0 fw-bold"
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              fontSize: "14px",
              boxShadow: "none",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
