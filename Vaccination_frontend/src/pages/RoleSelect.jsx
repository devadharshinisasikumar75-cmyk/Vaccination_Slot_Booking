import { useNavigate } from "react-router-dom";
import "./RoleSelect.css";

function RoleSelect() {
  const navigate = useNavigate();
  const assignedRole = localStorage.getItem("userRole");

  const selectRole = (role) => {
    if (!localStorage.getItem("accessToken") || role !== assignedRole) {
      return;
    }
    localStorage.setItem("selectedRole", role);

    if (role === "USER") {
      navigate("/user-dashboard");
    } else if (role === "HEALTHCARE_STAFF") {
      navigate("/healthcare-dashboard");
    } else if (role === "ADMIN") {
      navigate("/admin-dashboard");
    }
  };

  return (
    <div className="role-page">

      {/* Background decorations */}
      <div className="role-blob role-blob-one"></div>
      <div className="role-blob role-blob-two"></div>

      <div className="role-box">

        {/* Logo */}
        <div className="role-brand">
          <div className="role-brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2L6 14" />
              <path d="M6 14l-2 6 6-2" />
              <path d="M18 2c1.5 1.5 1.5 3.5 0 5L9 16" />
            </svg>
          </div>

          <span>VaxCare</span>
        </div>

        {/* Heading */}
        <div className="role-heading">
          <span className="role-label">WELCOME TO VAXCARE</span>

          <h1>
            Select Your <span>Role</span>
          </h1>

          <p>
            Choose your role to access the features designed for you.
          </p>
        </div>

        {/* Role Cards */}
        <div className="role-container">

          {/* USER */}
          <div
            className={`role-card user-card${assignedRole === "USER" ? "" : " role-card-disabled"}`}
            aria-disabled={assignedRole !== "USER"}
            onClick={() => selectRole("USER")}
          >
            <div className="role-icon">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
              </svg>

            </div>

            <div className="role-content">
              <h2>User</h2>

              <p>
                Book vaccination slots, manage appointments
                and track your vaccination status.
              </p>
            </div>

            <div className="role-arrow">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </div>
          </div>


          {/* HEALTHCARE STAFF */}
          <div
            className={`role-card healthcare-card${assignedRole === "HEALTHCARE_STAFF" ? "" : " role-card-disabled"}`}
            aria-disabled={assignedRole !== "HEALTHCARE_STAFF"}
            onClick={() => selectRole("HEALTHCARE_STAFF")}
          >
            <div className="role-icon">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21h18" />
                <path d="M5 21V6h14v15" />
                <path d="M9 6V3h6v3" />
                <path d="M9 11h6" />
                <path d="M12 8v6" />
              </svg>

            </div>

            <div className="role-content">
              <h2>Healthcare Staff</h2>

              <p>
                Manage vaccination slots, appointments
                and vaccination records.
              </p>
            </div>

            <div className="role-arrow">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </div>
          </div>


          {/* ADMIN */}
          <div
            className={`role-card admin-card${assignedRole === "ADMIN" ? "" : " role-card-disabled"}`}
            aria-disabled={assignedRole !== "ADMIN"}
            onClick={() => selectRole("ADMIN")}
          >
            <div className="role-icon">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l2 2h3v3l2 2-2 2v3h-3l-2 2-2-2H7v-3l-2-2 2-2V5h3l2-2z" />
                <circle cx="12" cy="10" r="2.5" />
                <path d="M9 17h6" />
              </svg>

            </div>

            <div className="role-content">
              <h2>Admin</h2>

              <p>
                Manage users, healthcare staff, vaccines
                and vaccination centers.
              </p>
            </div>

            <div className="role-arrow">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </div>
          </div>

        </div>

        {/* Back */}
        <button
          className="role-back"
          onClick={() => navigate("/login")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M11 18l-6-6 6-6" />
          </svg>

          Back to Login
        </button>

      </div>
    </div>
  );
}

export default RoleSelect;