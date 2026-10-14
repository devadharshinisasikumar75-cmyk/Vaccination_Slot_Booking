import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Reports.css";

function Reports() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/reports/healthcare`
      );

      const data = await response.json();

      console.log("REPORT DATA:", data);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load vaccination reports."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid report data received from backend.");
      }

      setAppointments(data);
    } catch (error) {
      console.error("REPORT ERROR:", error);
      setAppointments([]);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatus = (appointment) => {
    return String(appointment?.status || "PENDING")
      .trim()
      .toUpperCase();
  };

  const totalAppointments = appointments.length;

  const confirmedAppointments = appointments.filter(
    (appointment) => getStatus(appointment) === "CONFIRMED"
  ).length;

  const pendingAppointments = appointments.filter(
    (appointment) => getStatus(appointment) === "PENDING"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => getStatus(appointment) === "COMPLETED"
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) => getStatus(appointment) === "CANCELLED"
  ).length;

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div className="reports-brand">
          <div className="reports-brand-icon">✓</div>

          <div>
            <h2>VaxCare</h2>
            <span>Healthcare Portal</span>
          </div>
        </div>

        <button
          className="reports-back"
          onClick={() => navigate("/healthcare-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="reports-content">
        <div className="reports-heading">
          <div className="reports-heading-icon">▥</div>

          <div>
            <h1>Vaccination Reports</h1>

            <p>
              View vaccination appointment statistics
              and healthcare reports.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="reports-message">
            Loading vaccination reports...
          </div>
        ) : error ? (
          <div className="reports-message reports-error">
            {error}
          </div>
        ) : (
          <>
            <div className="report-cards">
              <div className="report-card blue-report">
                <div className="report-number">
                  {totalAppointments}
                </div>

                <h3>Total Appointments</h3>

                <p>
                  Total vaccination appointments
                </p>
              </div>

              <div className="report-card green-report">
                <div className="report-number">
                  {confirmedAppointments}
                </div>

                <h3>Confirmed</h3>

                <p>
                  Confirmed vaccination appointments
                </p>
              </div>

              <div className="report-card orange-report">
                <div className="report-number">
                  {pendingAppointments}
                </div>

                <h3>Pending</h3>

                <p>
                  Appointments waiting for confirmation
                </p>
              </div>

              <div className="report-card purple-report">
                <div className="report-number">
                  {completedAppointments}
                </div>

                <h3>Completed</h3>

                <p>
                  Successfully completed vaccinations
                </p>
              </div>

              <div className="report-card red-report">
                <div className="report-number">
                  {cancelledAppointments}
                </div>

                <h3>Cancelled</h3>

                <p>
                  Cancelled vaccination appointments
                </p>
              </div>
            </div>

            <div className="report-section">
              <div className="report-section-title">
                <h2>Vaccination Report</h2>

                <p>
                  Detailed vaccination appointment information.
                </p>
              </div>

              {appointments.length === 0 ? (
                <div className="report-empty">
                  <div className="report-empty-icon">
                    📊
                  </div>

                  <h3>
                    No Report Data Available
                  </h3>

                  <p>
                    No vaccination appointments are
                    available yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="report-summary">
                    <div className="summary-box">
                      <strong>
                        {totalAppointments}
                      </strong>
                      <span>Total</span>
                    </div>

                    <div className="summary-box">
                      <strong>
                        {confirmedAppointments}
                      </strong>
                      <span>Confirmed</span>
                    </div>

                    <div className="summary-box">
                      <strong>
                        {pendingAppointments}
                      </strong>
                      <span>Pending</span>
                    </div>

                    <div className="summary-box">
                      <strong>
                        {completedAppointments}
                      </strong>
                      <span>Completed</span>
                    </div>

                    <div className="summary-box">
                      <strong>
                        {cancelledAppointments}
                      </strong>
                      <span>Cancelled</span>
                    </div>
                  </div>

                  <div className="report-table-wrapper">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Vaccine</th>
                          <th>Center</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {appointments.map((appointment) => {
                          const status = getStatus(appointment);

                          return (
                            <tr key={appointment.id}>
                              <td>
                                {appointment.userName || "User"}
                              </td>

                              <td>
                                {appointment.vaccine || "-"}
                              </td>

                              <td>
                                {appointment.center || "-"}
                              </td>

                              <td>
                                {appointment.bookingDate || "-"}
                              </td>

                              <td>
                                {appointment.bookingTime || "-"}
                              </td>

                              <td>
                                <span
                                  className={`status-badge status-${status.toLowerCase()}`}
                                >
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="reports-footer">
        © 2026 VaxCare. Vaccination Slot Booking & Tracking Platform.
      </footer>
    </div>
  );
}

export default Reports;