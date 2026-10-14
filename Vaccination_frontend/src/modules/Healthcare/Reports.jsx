import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Reports.css";

function Reports() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authenticatedFetch(`${API_BASE_URL}/api/reports/healthcare`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid report data");
        }

        setAppointments(data);
      })
      .catch((error) => {
        console.error("Reports error:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatus = (appointment) => {
    return String(appointment?.status || "PENDING")
      .trim()
      .toUpperCase();
  };

  return (
    <div className="healthcare-reports-page">

      <header className="reports-header">
        <div>
          <h2>VaxCare</h2>
          <span>Healthcare Portal</span>
        </div>

        <button
          onClick={() => navigate("/healthcare-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="reports-content">

        <div className="reports-heading">
          <div className="reports-icon">▥</div>

          <div>
            <h1>Vaccination Reports</h1>
            <p>
              View vaccination appointment reports.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="report-loading">
            Loading reports...
          </div>
        ) : error ? (
          <div className="report-loading">
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="report-loading">
            No vaccination reports available.
          </div>
        ) : (
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
        )}

      </main>

      <footer>
        © 2026 VaxCare. Vaccination Slot Booking & Tracking Platform.
      </footer>

    </div>
  );
}

export default Reports;