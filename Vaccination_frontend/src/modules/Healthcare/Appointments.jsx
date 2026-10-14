import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Appointments.css";

function Appointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/healthcare/appointments`
      );

      if (!response.ok) {
        throw new Error("Unable to load appointments");
      }

      const data = await response.json();

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Appointments error:", error);
      setMessage("Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      setMessage("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/bookings/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update appointment"
        );
      }

      await fetchAppointments();

      setMessage(
        newStatus === "CONFIRMED"
          ? "Appointment confirmed successfully."
          : "Appointment marked as completed successfully."
      );
    } catch (error) {
      console.error("Status update error:", error);

      setMessage(
        error.message || "Unable to update appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const totalAppointments = appointments.length;

  const isFutureAppointment = (appointment) => {
    const dateValue = appointment.bookingDate || appointment.date;
    const timeValue = appointment.bookingTime || appointment.time || "";
    if (!dateValue || dateValue === "-") return false;

    const [year, month, day] = String(dateValue).split("-").map(Number);
    const startTime = String(timeValue).split(/\s+[-–]\s+/, 2)[0].trim();
    const amPm = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const twentyFourHour = startTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!year || !month || !day || (!amPm && !twentyFourHour)) return false;

    let hours = Number((amPm || twentyFourHour)[1]);
    const minutes = Number((amPm || twentyFourHour)[2]);
    if (amPm) {
      const meridiem = amPm[3].toUpperCase();
      hours = (hours % 12) + (meridiem === "PM" ? 12 : 0);
    }
    return new Date(year, month - 1, day, hours, minutes) > new Date();
  };

  const confirmedAppointments = appointments.filter(
    (appointment) =>
      String(appointment.status).toUpperCase() === "CONFIRMED"
  ).length;

  const pendingAppointments = appointments.filter(
    (appointment) =>
      String(appointment.status).toUpperCase() === "PENDING"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) =>
      String(appointment.status).toUpperCase() === "COMPLETED"
  ).length;

  return (
    <div className="appointments-page">

      {/* Header */}
      <header className="appointments-header">

        <div className="appointments-brand">

          <div className="appointments-logo">
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
            <span>Healthcare Portal</span>
          </div>

        </div>

        <button
          className="appointments-back"
          onClick={() =>
            navigate("/healthcare-dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </header>


      {/* Main */}
      <main className="appointments-main">

        <div className="appointments-title">

          <span>HEALTHCARE STAFF</span>

          <h1>Appointments</h1>

          <p>
            View and manage vaccination appointments assigned
            to your center.
          </p>

        </div>


        {/* Summary Cards */}
        <div className="appointment-summary">

          <div className="summary-card blue">

            <div className="summary-icon">
              📅
            </div>

            <div>
              <h3>{totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>

          </div>


          <div className="summary-card green">

            <div className="summary-icon">
              ✓
            </div>

            <div>
              <h3>{confirmedAppointments}</h3>
              <p>Confirmed</p>
            </div>

          </div>


          <div className="summary-card orange">

            <div className="summary-icon">
              ⏳
            </div>

            <div>
              <h3>{pendingAppointments}</h3>
              <p>Pending</p>
            </div>

          </div>


          <div className="summary-card purple">

            <div className="summary-icon">
              ✓
            </div>

            <div>
              <h3>{completedAppointments}</h3>
              <p>Completed</p>
            </div>

          </div>

        </div>


        {/* Appointment Section */}
        <section className="appointments-section">

          <div className="section-heading">

            <div>
              <h2>Appointment List</h2>

              <p>
                Recent vaccination appointments
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchAppointments}
              disabled={loading}
            >
              ↻ {loading ? "Refreshing..." : "Refresh"}
            </button>

          </div>


          {message && (
            <div
              className={
                message.toLowerCase().includes("successfully")
                  ? "appointment-success"
                  : "appointment-error"
              }
            >
              {message}
            </div>
          )}


          {loading && (
            <div className="appointments-empty">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>Loading Appointments...</h3>

              <p>
                Please wait while the appointments are loaded.
              </p>

            </div>
          )}


          {!loading && appointments.length === 0 && (
            <div className="appointments-empty">

              <div className="empty-icon">
                📅
              </div>

              <h3>No Appointments Yet</h3>

              <p>
                There are currently no vaccination appointments
                available. New appointments will appear here.
              </p>

            </div>
          )}


          {!loading && appointments.length > 0 && (

            <div className="appointment-list">

              {appointments.map((appointment) => {

                const currentStatus =
                  String(
                    appointment.status || "PENDING"
                  ).toUpperCase();

                return (

                  <div
                    className="appointment-item"
                    key={appointment.id}
                  >

                    <div className="appointment-info">

                      <div className="appointment-icon">
                        💉
                      </div>


                      <div className="appointment-details">

                        <div className="appointment-top-row">

                          <h3>
                            {appointment.vaccine ||
                              "Vaccination"}
                          </h3>

                          <span
                            className={`status-badge ${currentStatus.toLowerCase()}`}
                          >
                            {currentStatus}
                          </span>

                        </div>


                        <p className="patient-name">
                          👤{" "}
                          {appointment.userName ||
                            "Patient"}
                        </p>


                        <p>
                          📍{" "}
                          {appointment.center ||
                            "Vaccination Center"}
                        </p>


                        <div className="appointment-meta">

                          <span>
                            📅{" "}
                            {appointment.date ||
                              appointment.bookingDate ||
                              "-"}
                          </span>

                          <span>
                            🕐{" "}
                            {appointment.time ||
                              appointment.bookingTime ||
                              "-"}
                          </span>

                          <span>
                            ID #{appointment.id}
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* Action Buttons */}
                    <div className="appointment-actions">

                      {currentStatus === "PENDING" && (

                        <button
                          className="confirm-btn"
                          onClick={() =>
                            updateStatus(
                              appointment.id,
                              "CONFIRMED"
                            )
                          }
                          disabled={
                            updatingId === appointment.id
                          }
                        >
                          {updatingId === appointment.id
                            ? "Updating..."
                            : "✓ Confirm"}
                        </button>

                      )}


                      {currentStatus === "CONFIRMED" && (

                        <button
                          className="complete-btn"
                          onClick={() =>
                            updateStatus(
                              appointment.id,
                              "COMPLETED"
                            )
                          }
                          disabled={
                            updatingId === appointment.id
                          }
                        >
                          {updatingId === appointment.id
                            ? "Updating..."
                            : "✓ Mark Completed"}
                        </button>

                      )}


                      {currentStatus === "COMPLETED" && (
                        <>
                          <span className="completed-label">
                            ✓ Vaccination Completed
                          </span>
                          {isFutureAppointment(appointment) && (
                            <button
                              className="confirm-btn"
                              onClick={() => updateStatus(appointment.id, "CONFIRMED")}
                              disabled={updatingId === appointment.id}
                            >
                              {updatingId === appointment.id
                                ? "Updating..."
                                : "Restore as confirmed"}
                            </button>
                          )}
                        </>
                      )}

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </section>

      </main>


      <footer className="appointments-footer">
        © 2026 VaxCare • Vaccination Slot Booking & Tracking Platform
      </footer>

    </div>
  );
}

export default Appointments;