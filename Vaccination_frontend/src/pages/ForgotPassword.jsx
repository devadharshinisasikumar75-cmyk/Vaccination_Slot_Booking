import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState("email");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (stage === "otp") {
      otpInputRef.current?.focus();
    }
  }, [stage]);

  const post = async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "The request could not be completed.");
    }
    return data;
  };

  const runRequest = async (action) => {
    setLoading(true);
    setMessage("");
    setIsSuccess(false);
    try {
      const result = await action();
      setMessage(result.message || "");
      setIsSuccess(true);
      return true;
    } catch (error) {
      setMessage(error.message || "The backend could not be reached.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    const sent = await runRequest(() =>
      post("/api/password/forgot/send-otp", { email: email.trim() })
    );
    if (sent) setStage("otp");
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    const verified = await runRequest(() =>
      post("/api/password/forgot/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      })
    );
    if (verified) setStage("password");
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    const reset = await runRequest(() =>
      post("/api/password/forgot/reset", {
        email: email.trim(),
        otp: otp.trim(),
        password,
      })
    );
    if (reset) setStage("done");
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-card">
        <h1>Reset your password</h1>
        <p>We will email you a one-time code to verify your account.</p>

        {stage === "email" && (
          <form onSubmit={sendOtp}>
            <label htmlFor="reset-email">Email address</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        )}

        {stage === "otp" && (
          <form onSubmit={verifyOtp}>
            <label htmlFor="reset-otp">Six-digit code</label>
            <input
              id="reset-otp"
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoCapitalize="off"
              spellCheck={false}
              value={otp}
              onChange={(event) =>
                setOtp(event.currentTarget.value.replace(/\D/g, "").slice(0, 6))
              }
              onPaste={(event) => {
                event.preventDefault();
                setOtp(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
              }}
              minLength={6}
              maxLength={6}
              pattern="[0-9]{6}"
              aria-label="Six-digit password reset code"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify code"}
            </button>
          </form>
        )}

        {stage === "password" && (
          <form onSubmit={resetPassword}>
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Change password"}
            </button>
          </form>
        )}

        {stage === "done" && <Link to="/login">Return to login</Link>}

        {message && (
          <p
            className={isSuccess ? "forgot-success" : "forgot-error"}
            role="status"
          >
            {message}
          </p>
        )}

        {stage !== "done" && (
          <Link to="/login" className="forgot-back-link">
            Back to login
          </Link>
        )}
      </section>
    </main>
  );
}

export default ForgotPassword;
