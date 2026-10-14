import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./MyProfile.css";

function MyProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState(
    localStorage.getItem("userName") || ""
  );

  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );

  const [role] = useState(
    localStorage.getItem("userRole") || "USER"
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(localStorage.getItem("userName") || "");
    setEmail(localStorage.getItem("userEmail") || "");
  }, []);

  const getRoleText = () => {
    const currentRole = role.toUpperCase();

    if (currentRole === "HEALTHCARE_STAFF") {
      return "Healthcare Staff";
    }

    if (currentRole === "ADMIN") {
      return "Admin";
    }

    return "User";
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setError("Please login again.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update profile."
        );
      }

      const updatedUser = data?.user || data;

      const updatedName =
        updatedUser?.name || name.trim();

      const updatedEmail =
        updatedUser?.email ||
        email.trim().toLowerCase();

      localStorage.setItem("userName", updatedName);
      localStorage.setItem("userEmail", updatedEmail);

      setName(updatedName);
      setEmail(updatedEmail);

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.message || "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(localStorage.getItem("userName") || "");
    setEmail(localStorage.getItem("userEmail") || "");
    setMessage("");
    setError("");
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-brand">
          <div className="profile-brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="24"
              height="24"
            >
              <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h2>VaxCare</h2>
            <span>Vaccination Portal</span>
          </div>
        </div>

        <button
          type="button"
          className="profile-back"
          onClick={() => navigate("/user-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="profile-content">
        <div className="profile-heading">
          <div className="profile-heading-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="30"
              height="30"
            >
              <circle
                cx="12"
                cy="8"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1>My Profile</h1>
            <p>
              View and update your VaxCare profile information.
            </p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {(name || "U").charAt(0).toUpperCase()}
          </div>

          <div className="profile-user-info">
            <h2>{name || "User"}</h2>
            <span>{getRoleText()}</span>
          </div>

          <form
            className="profile-form"
            onSubmit={handleSave}
          >
            <div className="profile-field">
              <label htmlFor="profile-name">Full Name</label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Email</label>

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
              />
            </div>

            <div className="profile-field">
              <label>Role</label>

              <input
                type="text"
                value={getRoleText()}
                readOnly
              />
            </div>

            {message && (
              <div className="profile-message success">
                {message}
              </div>
            )}

            {error && (
              <div className="profile-message error">
                {error}
              </div>
            )}

            <div className="profile-actions">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="profile-footer">
        © 2026 VaxCare. Vaccination Slot Booking & Tracking
        Platform.
      </footer>
    </div>
  );
}

export default MyProfile;