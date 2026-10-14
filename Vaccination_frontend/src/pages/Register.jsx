import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { saveAuthSession } from "../config/auth";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const hasValidOtp = /^\d{6}$/.test(otp);

  useEffect(() => {
    if (otpSent && !emailVerified) {
      otpInputRef.current?.focus();
    }
  }, [otpSent, emailVerified]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "email") {
      setOtpSent(false);
      setEmailVerified(false);
      setOtp("");
    }
  };

  const handleSendOtp = async () => {
    setMessage("");
    setIsSuccess(false);

    if (!formData.email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/otp/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to send OTP.");
        return;
      }

      setOtpSent(true);
      setEmailVerified(false);
      setMessage("OTP sent successfully. Check your email.");
      setIsSuccess(true);
    } catch (error) {
      console.error("OTP send error:", error);
      setMessage(
        "Backend is not running. Start the Spring Boot app first."
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setMessage("");
    setIsSuccess(false);

    if (!hasValidOtp) {
      setMessage("Enter the six-digit OTP using number keys.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/otp/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid or expired OTP.");
        return;
      }

      setEmailVerified(true);
      setMessage("Email verified successfully.");
      setIsSuccess(true);
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage(
        "Backend is not running. Start the Spring Boot app first."
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (!emailVerified) {
      setMessage("Please verify your email with OTP first.");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setIsSuccess(true);
      setMessage("Registration successful! Redirecting...");

      saveAuthSession(data);

      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setIsSuccess(false);
      setMessage(
        "Backend is not running. Start the Spring Boot app first."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-left">

        <div
          className="register-brand"
          onClick={() => navigate("/")}
        >
          <div className="register-brand-icon">
            <svg viewBox="0 0 24 24">
              <path d="M18 2L6 14" />
              <path d="M6 14l-2 6 6-2" />
              <path d="M18 2c1.5 1.5 1.5 3.5 0 5L9 16" />
            </svg>
          </div>

          <span>VaxCare</span>
        </div>

        <div className="register-left-content">

          <span className="register-label">
            JOIN VAXCARE
          </span>

          <h1>
            Start your
            <br />
            <span>health journey.</span>
          </h1>

          <p>
            Create your VaxCare account and make your
            vaccination appointments simple, organized
            and easy to track.
          </p>

          <div className="register-features">

            <div className="register-feature">
              <div className="register-check">✓</div>

              <div>
                <strong>Easy Registration</strong>
                <span>Create your account in seconds</span>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-check">✓</div>

              <div>
                <strong>Book Vaccination</strong>
                <span>Find and book available slots easily</span>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-check">✓</div>

              <div>
                <strong>Track Everything</strong>
                <span>Keep your vaccination records organized</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className="register-right">

        <div className="register-card">

          <div className="register-icon">
            <svg viewBox="0 0 24 24">
              <path d="M15 12h6" />
              <path d="M18 9l3 3-3 3" />
              <path d="M21 12H9" />
              <path d="M13 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8" />
            </svg>
          </div>

          <h2>Create Account</h2>

          <p className="register-subtitle">
            Create your VaxCare account
          </p>

          <form onSubmit={handleRegister}>

            <div className="register-input-group">

              <label>Full Name</label>

              <div className="register-input-box">

                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

              </div>

            </div>

            <div className="register-input-group">

              <label>Email Address</label>

              <div className="register-input-box">

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

              <button
                type="button"
                className="otp-button"
                onClick={handleSendOtp}
                disabled={loading || emailVerified}
              >
                {emailVerified
                  ? "Email Verified ✓"
                  : loading
                  ? "Sending..."
                  : otpSent
                  ? "Resend OTP"
                  : "Send OTP"}
              </button>

            </div>

            {!emailVerified && (
              <div className="register-input-group">

                <label htmlFor="signup-otp">Enter OTP</label>

                <div className="register-input-box">

                  <svg viewBox="0 0 24 24">
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="3"
                    />
                    <path d="M8 12h8" />
                  </svg>

                  <input
                    className="otp-code-input"
                    id="signup-otp"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoCapitalize="off"
                    spellCheck={false}
                    aria-label="Six-digit email verification code"
                    value={otp}
                    onChange={(event) => {
                      setOtp(event.currentTarget.value.replace(/\D/g, "").slice(0, 6));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (otpSent && hasValidOtp && !loading) {
                          handleVerifyOtp();
                        } else if (!hasValidOtp) {
                          setMessage("Enter all 6 digits from the email, then verify.");
                          setIsSuccess(false);
                        } else if (!otpSent) {
                          setMessage("Click Send OTP first, then enter the emailed code.");
                          setIsSuccess(false);
                        }
                      }
                    }}
                    onPaste={(event) => {
                      event.preventDefault();
                      const pastedOtp = event.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(pastedOtp);
                    }}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    autoFocus={otpSent && !emailVerified}
                    required
                  />

                </div>

                <button
                  type="button"
                  className="otp-verify-button"
                  onClick={handleVerifyOtp}
                  disabled={!otpSent || loading}
                >
                  {loading ? "Verifying..." : otpSent ? "Verify OTP" : "Send OTP first"}
                </button>

              </div>
            )}

            <div className="register-input-group">

              <label>Password</label>

              <div className="register-input-box">

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
                  placeholder="Create a password"
                  minLength="8"
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

              <small className="password-hint">
                Minimum 8 characters
              </small>

            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={!emailVerified || loading}
            >
              <span>
                {loading ? "Creating Account..." : "Create Account"}
              </span>

              <span className="register-arrow">
                →
              </span>
            </button>

          </form>

          {message && (
            <div
              className={`register-message ${
                isSuccess
                  ? "register-success"
                  : "register-error"
              }`}
            >
              <span className="register-message-icon">
                {isSuccess ? "✓" : "!"}
              </span>

              <span>{message}</span>
            </div>
          )}

          <div className="register-divider">
            <span>Already have an account?</span>
          </div>

          <button
            className="register-login-button"
            onClick={() => navigate("/login")}
          >
            Login to Your Account
          </button>

          <button
            className="register-back-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default Register;