import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../config/auth";
import "./HealthcareDashboard.css";

function HealthcareDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <div className="healthcare-dashboard">

      <header className="healthcare-header">
        <div className="healthcare-brand">
          <div className="brand-logo">✓</div>
          <div>
            <h2>VaxCare</h2>
            <span>Healthcare Portal</span>
          </div>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="healthcare-main">

        <div className="healthcare-welcome">
          <h1>Healthcare Dashboard</h1>
          <p>
            Manage vaccination appointments, patients, slots and reports.
          </p>
        </div>

        <div className="healthcare-grid">

          {/* Appointments */}
          <div className="healthcare-card blue-card">
            <div className="card-icon">
              <span>▣</span>
            </div>

            <span className="card-category">APPOINTMENTS</span>

            <h2>Appointments</h2>

            <p>
              View and manage scheduled vaccination appointments.
            </p>

            <button onClick={() => navigate("/healthcare/appointments")}>
              View Appointments
              <span>→</span>
            </button>
          </div>


          {/* Appointment Requests */}
          <div className="healthcare-card purple-card">
            <div className="card-icon">
              <span className="request-icon">▤</span>
            </div>

            <span className="card-category">
              APPOINTMENT MANAGEMENT
            </span>

            <h2>Appointment Requests</h2>

            <p>
              Review vaccination requests and update appointment decisions.
            </p>

            <button onClick={() => navigate("/healthcare/requests")}>
              Review Requests
              <span>→</span>
            </button>
          </div>


          {/* Patient Records */}
          <div className="healthcare-card pink-card">
            <div className="card-icon">
              <span>♙</span>
            </div>

            <span className="card-category">
              PATIENT MANAGEMENT
            </span>

            <h2>Patient Records</h2>

            <p>
              View patient details and vaccination records.
            </p>

            <button onClick={() => navigate("/healthcare/patients")}>
              View Patients
              <span>→</span>
            </button>
          </div>


          {/* Manage Slots */}
          <div className="healthcare-card orange-card">
            <div className="card-icon">
              <span>⊞</span>
            </div>

            <span className="card-category">
              SLOT MANAGEMENT
            </span>

            <h2>Manage Slots</h2>

            <p>
              Create, update and manage available vaccination slots.
            </p>

            <button onClick={() => navigate("/healthcare/manage-slots")}>
              Manage Slots
              <span>→</span>
            </button>
          </div>


          {/* Vaccination Reports */}
          <div className="healthcare-card cyan-card">
            <div className="card-icon">
              <span>▥</span>
            </div>

            <span className="card-category">
              ANALYTICS
            </span>

            <h2>Vaccination Reports</h2>

            <p>
              View vaccination statistics and healthcare reports.
            </p>

            <button onClick={() => navigate("/healthcare/reports")}>
              View Reports
              <span>→</span>
            </button>
          </div>

        </div>
      </main>

      <footer className="healthcare-footer">
        © 2026 VaxCare. Vaccination Slot Booking & Tracking Platform.
      </footer>

    </div>
  );
}

export default HealthcareDashboard;