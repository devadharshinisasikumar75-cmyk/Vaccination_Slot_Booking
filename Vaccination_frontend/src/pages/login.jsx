import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { saveAuthSession } from "../config/auth";
import "./login.css";

function Login({ role = "USER" }) {
  const navigate = useNavigate();
  const portal = {
    USER: {
      title: "Login to your VaxCare account",
      endpoint: "/api/login",
      destination: "/user-dashboard",
    },
    HEALTHCARE_STAFF: {
      title: "Healthcare Staff Login",
      endpoint: "/api/staff/login",
      destination: "/healthcare-dashboard",
    },
    ADMIN: {
      title: "Administrator Login",
      endpoint: "/api/admin/login",
      destination: "/admin-dashboard",
    },
  }[role];

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}${portal.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsSuccess(false);
        setMessage(data.message || "Invalid email or password");
        return;
      }

      saveAuthSession(data);

      setIsSuccess(true);
      setMessage("Login successful! Welcome to VaxCare.");

      setTimeout(() => {
        navigate(portal.destination);
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      setIsSuccess(false);
      setMessage(
        "Backend is not running. Please start the Spring Boot server."
      );
    }
  };

  return (
    <div className="login-page">

      {/* Background pastel blobs */}
      <div className="login-blob blob-top"></div>
      <div className="login-blob blob-bottom"></div>

      {/* LEFT SIDE */}
      <div className="login-left">

        <div className="login-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24">
              <path d="M18 2L6 14" />
              <path d="M6 14l-2 6 6-2" />
              <path d="M18 2c1.5 1.5 1.5 3.5 0 5L9 16" />
            </svg>
          </div>

          <span>VaxCare</span>
        </div>

        <div className="login-welcome">

          <span className="welcome-label">
            WELCOME BACK
          </span>

          <h1>
            Your health,
            <br />
            <span>our priority.</span>
          </h1>

          <p>
            Login to manage your vaccination appointments,
            track your booking and keep your vaccination
            records organized.
          </p>

        </div>

        <div className="login-features">

          <div className="login-feature">
            <div className="feature-check">✓</div>

            <div>
              <strong>Easy Booking</strong>
              <small>Book your vaccination slot easily</small>
            </div>
          </div>

          <div className="login-feature">
            <div className="feature-check">✓</div>

            <div>
              <strong>Secure Records</strong>
              <small>Your vaccination details stay organized</small>
            </div>
          </div>

          <div className="login-feature">
            <div className="feature-check">✓</div>

            <div>
              <strong>Quick Tracking</strong>
              <small>Track your appointment anytime</small>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-box">

          <div className="login-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
          </div>

          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            {portal.title}
          </p>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="input-group">

              <label>Email Address</label>

              <div className="input-wrapper">

                <svg viewBox="0 0 24 24">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="M3 7l9 6 9-6" />
                </svg>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="input-group">

              <label>Password</label>

              <div className="input-wrapper">

                <svg viewBox="0 0 24 24">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-visibility-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9 7-.2 1.1-1 2.5-2.3 3.7M6.2 6.2C4.2 7.5 3.2 9.5 3 12c.5 2.5 4 7 9 7 1 0 2-.2 2.9-.5" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>

              </div>

            </div>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>

            <button
              type="submit"
              className="login-submit"
            >
              Login
              <span>→</span>
            </button>

          </form>

          {/* MESSAGE */}
          {message && (
            <div
              className={`login-message ${
                isSuccess
                  ? "login-success"
                  : "login-error"
              }`}
            >

              <span className="message-icon">
                {isSuccess ? "✓" : "!"}
              </span>

              <span>{message}</span>

            </div>
          )}

          {role === "USER" ? (
            <>
              <div className="register-divider">
                <span>Don't have an account?</span>
              </div>

              <button
                type="button"
                className="register-btn"
                onClick={() => navigate("/register")}
              >
                Create New Account
              </button>
              <div className="portal-login-links">
                <button type="button" onClick={() => navigate("/staff/login")}>
                  Healthcare staff login
                </button>
                <button type="button" onClick={() => navigate("/admin/login")}>
                  Admin login
                </button>
              </div>
            </>
          ) : (
            <div className="portal-login-links">
              <button type="button" onClick={() => navigate("/login")}>
                User login
              </button>
              {role === "ADMIN" ? (
                <button type="button" onClick={() => navigate("/staff/login")}>
                  Healthcare staff login
                </button>
              ) : (
                <button type="button" onClick={() => navigate("/admin/login")}>
                  Admin login
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            className="back-home"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;