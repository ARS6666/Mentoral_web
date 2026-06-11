import React, { useState } from "react";

const Signin = ({ onSubmit, onNavigateToLogin }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        fullName,
        email,
        password,
        confirmPassword,
      });
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100" 
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        padding: "24px",
        fontFamily: "Inter, Arial, sans-serif"
      }}
    >
      <div 
        className="card border-0 shadow-lg w-100" 
        style={{
          maxWidth: "460px",
          borderRadius: "24px",
          padding: "32px",
          backgroundColor: "#ffffff",
          border: "1px solid #dbeafe"
        }}
      >
        <div className="text-center mb-4">
          <h1 className="fw-bold mb-2" style={{ fontSize: "30px", color: "#0f172a" }}>
            Create Account
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Sign up and start your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={{ fontSize: "14px", color: "#334155" }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-control"
              style={inputStyle}
              required
            />
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={{ fontSize: "14px", color: "#334155" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              style={inputStyle}
              required
            />
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={{ fontSize: "14px", color: "#334155" }}>
              Password
            </label>
            <div className="position-relative d-flex align-items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ ...inputStyle, paddingRight: "72px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="btn position-absolute end-0 border-0 bg-transparent fw-bold"
                style={{ color: "#2563eb", fontSize: "13px", marginRight: "12px" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={{ fontSize: "14px", color: "#334155" }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              style={inputStyle}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn w-100 fw-bold mt-2" 
            style={{
              padding: "14px 18px",
              borderRadius: "14px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
              border: "none"
            }}
          >
            Sign Up
          </button>
        </form>

        <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
          <span style={{ color: "#64748b", fontSize: "14px" }}>
            Already have an account?
          </span>
          <button 
            type="button" 
            onClick={onNavigateToLogin} 
            className="btn btn-link p-0 fw-bold text-decoration-none"
            style={{ color: "#2563eb", fontSize: "14px" }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  backgroundColor: "#ffffff"
};

export default Signin;
