import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../config/auth";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <div className="user-dashboard">

      {/* Header */}
      <header className="user-header">
        <div className="user-brand">
          <div className="user-brand-icon">
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

          <div>
            <h2>VaxCare</h2>
            <span>Vaccination Portal</span>
          </div>
        </div>

        <div className="user-header-right">
          <div className="welcome-user">
            <span>Welcome back</span>
            <strong>{userName}</strong>
          </div>

          <div className="user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 3v18" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="user-main">

        <section className="user-welcome">
          <div>
            <span className="section-label">USER DASHBOARD</span>

            <h1>
              Hello, <span>{userName}</span> 👋
            </h1>

            <p>
              Manage your vaccination appointments, track your bookings
              and keep your vaccination records organized.
            </p>
          </div>
        </section>

        {/* Dashboard Cards */}
        <section className="user-cards">

          {/* Book Slot */}
          <div className="user-card blue-card">
            <div className="card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <path d="M12 13v5" />
                <path d="M9.5 15.5h5" />
              </svg>
            </div>

            <h3>Book Vaccination Slot</h3>

            <p>
              Find an available vaccination slot and book your appointment.
            </p>

            <button onClick={() => navigate("/book-slot")}>
              Book Now
              <span>→</span>
            </button>
          </div>

          {/* Appointments */}
          <div className="user-card purple-card">
            <div className="card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <path d="M8 14h3" />
                <path d="M8 17h6" />
              </svg>
            </div>

            <h3>My Appointments</h3>

            <p>
              View and manage all your vaccination appointments.
            </p>

            <button onClick={() => navigate("/my-appointments")}>
              View Appointments
              <span>→</span>
            </button>
          </div>

          {/* Track */}
          <div className="user-card mint-card">
            <div className="card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <h3>Track Appointment</h3>

            <p>
              Check the latest status and progress of your appointment.
            </p>

            <button onClick={() => navigate("/track-appointment")}>
              Track Now
              <span>→</span>
            </button>
          </div>

          {/* Vaccination Status */}
          <div className="user-card pink-card">
            <div className="card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
                <path d="M8.5 12l2.2 2.2 4.8-5" />
              </svg>
            </div>

            <h3>Vaccination Status</h3>

            <p>
              View your vaccination history and current status.
            </p>

            <button onClick={() => navigate("/vaccination-status")}>
              View Status
              <span>→</span>
            </button>
          </div>

          {/* Profile */}
          <div className="user-card orange-card">
            <div className="card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
              </svg>
            </div>

            <h3>My Profile</h3>

            <p>
              View your personal information and account details.
            </p>

            <button onClick={() => navigate("/my-profile")}>
              View Profile
              <span>→</span>
            </button>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="user-footer">
        <span>© 2026 VaxCare</span>
        <span>Vaccination Slot Booking & Tracking Platform</span>
      </footer>

    </div>
  );
}

export default UserDashboard;