import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./MyAppointments.css";

function MyAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setMessage("Please login to view your appointments.");
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/bookings/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load appointments."
          );
        }

        const bookingList = Array.isArray(data)
          ? data
          : Array.isArray(data?.bookings)
          ? data.bookings
          : [];

        const sortedBookings = [...bookingList].sort(
          (a, b) => Number(b.id || 0) - Number(a.id || 0)
        );

        setAppointments(sortedBookings);
        setMessage("");
      } catch (error) {
        console.error("Appointments error:", error);
        setAppointments([]);
        setMessage(
          error.message || "Unable to load appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (date) => {
    if (!date || date === "-") {
      return "Date not available";
    }

    const parts = date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  const getStatusClass = (status) => {
    const value = (status || "PENDING").toLowerCase();

    if (value === "confirmed") return "confirmed";
    if (value === "completed") return "completed";
    if (value === "cancelled") return "cancelled";

    return "pending";
  };

  const getStatusText = (status) => {
    const value = (status || "PENDING").toLowerCase();

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="appointments-page">
      <header className="appointments-header">
        <div className="appointments-brand">
          <div className="appointments-brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="24"
              height="24"
            >
              <path
                d="M6 3h12v18H6z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M9 7h6M9 11h6M9 15h4"
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
          className="appointments-back"
          onClick={() => navigate("/user-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="appointments-content">
        <div className="appointments-heading">
          <div className="appointments-heading-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="30"
              height="30"
            >
              <rect
                x="4"
                y="5"
                width="16"
                height="15"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 3v4M16 3v4M4 9h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1>My Appointments</h1>
            <p>
              View and manage your vaccination appointments.
            </p>
          </div>
        </div>

        <div className="appointments-card">
          {loading && (
            <div className="appointment-message">
              Loading appointments...
            </div>
          )}

          {!loading && message && (
            <div className="appointment-message error">
              {message}
            </div>
          )}

          {!loading &&
            !message &&
            appointments.length === 0 && (
              <div className="empty-appointments">
                <div className="empty-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    width="32"
                    height="32"
                  >
                    <rect
                      x="4"
                      y="5"
                      width="16"
                      height="15"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8 3v4M16 3v4M4 9h16"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h3>No Appointments Yet</h3>

                <p>
                  You have not booked any vaccination
                  appointments.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/book-slot")}
                >
                  Book a Slot
                </button>
              </div>
            )}

          {!loading &&
            !message &&
            appointments.length > 0 && (
              <div className="appointment-list">
                {appointments.map((appointment) => (
                  <div
                    className="appointment-item"
                    key={appointment.id}
                  >
                    <div className="appointment-main">
                      <div className="appointment-vaccine-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          width="28"
                          height="28"
                        >
                          <path
                            d="M19 3l2 2-4 4-2-2 4-4z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.5 8.5L4 18c-.6.6-.6 1.4 0 2s1.4.6 2 0l9.5-9.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div className="appointment-details">
                        <h3>
                          {appointment.vaccine || "Vaccination"}
                        </h3>

                        <p>
                          📍{" "}
                          {appointment.center ||
                            "Vaccination Center"}
                        </p>

                        <span>
                          📅{" "}
                          {formatDate(
                            appointment.bookingDate ||
                              appointment.date
                          )}
                          {" • "}
                          🕐{" "}
                          {appointment.bookingTime ||
                            appointment.time ||
                            "Time not available"}
                        </span>

                        <small>
                          Appointment ID: #{appointment.id}
                        </small>
                      </div>
                    </div>

                    <div
                      className={`appointment-status ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>

      <footer className="appointments-footer">
        © 2026 VaxCare. Vaccination Slot Booking & Tracking
        Platform.
      </footer>
    </div>
  );
}

export default MyAppointments;