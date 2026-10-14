import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../config/auth";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const userName =
    localStorage.getItem("userName") || "Administrator";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">

      {/* ================= HEADER ================= */}

      <header className="admin-header">

        <div className="admin-brand">

          <div className="admin-logo">
            <svg viewBox="0 0 24 24">
              <path d="M18 2L6 14" />
              <path d="M6 14l-2 6 6-2" />
              <path d="M18 2c1.5 1.5 1.5 3.5 0 5L9 16" />
            </svg>
          </div>

          <div>
            <h1>VaxCare</h1>
            <p>Administration Portal</p>
          </div>

        </div>

        <div className="admin-header-right">

          <div className="admin-profile">

            <div className="admin-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <span>Welcome back</span>
              <strong>{userName}</strong>
            </div>

          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <svg viewBox="0 0 24 24">
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M19 4h2v16h-2" />
            </svg>

            Logout
          </button>

        </div>

      </header>


      {/* ================= WELCOME ================= */}

      <section className="admin-welcome">

        <div className="admin-welcome-content">

          <span>ADMINISTRATOR DASHBOARD</span>

          <h2>
            Welcome, <strong>{userName}</strong>
          </h2>

          <p>
            Manage users, healthcare staff, vaccination centers,
            vaccines and system reports from one centralized dashboard.
          </p>

        </div>

        <div className="admin-welcome-icon">

          <svg viewBox="0 0 24 24">
            <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>

        </div>

      </section>


      {/* ================= DASHBOARD CARDS ================= */}

      <section className="admin-cards">


        {/* 1. OVERVIEW */}

        <div className="admin-card blue-card">

          <div className="admin-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>

          <span className="admin-card-label">
            SYSTEM OVERVIEW
          </span>

          <h3>Dashboard Overview</h3>

          <p>
            View important system statistics and
            vaccination activity at a glance.
          </p>

          <button
            className="admin-card-action"
            onClick={() => navigate("/admin/overview")}
          >
            View Overview
            <span>→</span>
          </button>

        </div>


        {/* 2. USERS */}

        <div className="admin-card purple-card">

          <div className="admin-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="8" r="4" />
              <path d="M2.5 21c0-4 2.8-7 6.5-7s6.5 3 6.5 7" />
              <path d="M16 8h6" />
              <path d="M19 5v6" />
            </svg>
          </div>

          <span className="admin-card-label">
            USER MANAGEMENT
          </span>

          <h3>Manage Users</h3>

          <p>
            View registered users and manage their
            account information and access.
          </p>

          <button
            className="admin-card-action"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
            <span>→</span>
          </button>

        </div>


        {/* 3. HEALTHCARE STAFF */}

        <div className="admin-card mint-card">

          <div className="admin-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4" />
              <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" />
              <path d="M19 8v6" />
              <path d="M16 11h6" />
            </svg>
          </div>

          <span className="admin-card-label">
            STAFF MANAGEMENT
          </span>

          <h3>Healthcare Staff</h3>

          <p>
            Manage healthcare staff accounts and
            monitor staff access to the system.
          </p>

          <button
            className="admin-card-action"
            onClick={() => navigate("/admin/staff")}
          >
            Manage Staff
            <span>→</span>
          </button>

        </div>


        {/* 4. VACCINATION CENTERS */}

        <div className="admin-card pink-card">

          <div className="admin-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 21h18" />
              <path d="M5 21V7h14v14" />
              <path d="M9 7V4h6v3" />
              <path d="M9 11h2" />
              <path d="M13 11h2" />
              <path d="M9 15h2" />
              <path d="M13 15h2" />
              <path d="M10 21v-3h4v3" />
            </svg>
          </div>

          <span className="admin-card-label">
            CENTER MANAGEMENT
          </span>

          <h3>Vaccination Centers</h3>

          <p>
            Add, update and manage vaccination centers
            available on the platform.
          </p>

          <button
            className="admin-card-action"
            onClick={() => navigate("/admin/centers")}
          >
            Manage Centers
            <span>→</span>
          </button>

        </div>


        {/* 5. VACCINES */}

        <div className="admin-card orange-card">

          <div className="admin-icon">
            <svg viewBox="0 0 24 24">
              <path d="M18 3L6 15" />
              <path d="M6 15l-2 6 6-2" />
              <path d="M18 3c1.5 1.5 1.5 3.5 0 5L9 17" />
              <path d="M14 7l3 3" />
              <path d="M7 17l3 3" />
            </svg>
          </div>

          <span className="admin-card-label">
            VACCINE MANAGEMENT
          </span>

          <h3>Vaccine Management</h3>

          <p>
            Manage vaccine information, availability
            and vaccination details.
          </p>

          <button
            className="admin-card-action"
            onClick={() => navigate("/admin/vaccines")}
          >
            Manage Vaccines
            <span>→</span>
          </button>

        </div>


        {/* 6. REPORTS */}

        <div className="admin-card teal-card">

          <div className="admin-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 20V10" />
              <path d="M10 20V5" />
              <path d="M16 20v-8" />
              <path d="M3 20h18" />
              <path d="M4 7l5-3 5 2 6-4" />
            </svg>
          </div>

          <span className="admin-card-label">
            REPORTS & ANALYTICS
          </span>

          <h3>Reports & Analytics</h3>

          <p>
            Analyze vaccination activity, appointments
            and overall system performance.
          </p>

          <button
            className="admin-card-action"
            onClick={() => navigate("/admin/reports")}
          >
            View Reports
            <span>→</span>
          </button>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="admin-footer">

        © 2026 <strong>VaxCare</strong>
        <span> · </span>
        Administration Portal

      </footer>

    </div>
  );
}

export default AdminDashboard;