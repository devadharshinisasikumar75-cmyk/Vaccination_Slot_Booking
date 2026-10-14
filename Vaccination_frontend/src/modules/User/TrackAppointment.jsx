import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./TrackAppointment.css";

function TrackAppointment() {
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setMessage("Please login to track your appointment.");
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/bookings/user/${userId}/latest`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load appointment."
          );
        }

        if (!data || !data.id) {
          setAppointment(null);
          setMessage(
            "You have not booked any appointment yet."
          );
          return;
        }

        setAppointment(data);
        setMessage("");
      } catch (error) {
        console.error("Tracking error:", error);
        setAppointment(null);
        setMessage(
          error.message || "Unable to load appointment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, []);

  const formatDate = (date) => {
    if (!date || date === "-") {
      return "-";
    }

    const parts = date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  const getStatus = () => {
    if (!appointment?.status) {
      return "Pending";
    }

    const status = appointment.status.toLowerCase();

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusDescription = () => {
    const status = (appointment?.status || "pending").toLowerCase();

    if (status === "confirmed") {
      return "Your vaccination appointment has been confirmed.";
    }

    if (status === "completed") {
      return "Your vaccination has been completed successfully.";
    }

    if (status === "cancelled") {
      return "This vaccination appointment has been cancelled.";
    }

    return "Your appointment has been booked and is waiting for confirmation.";
  };

  const status = (appointment?.status || "pending").toLowerCase();

  return (
    <div className="track-page">
      <header className="track-header">
        <div className="track-brand">
          <div className="track-brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="24"
              height="24"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M12 8v4l3 2"
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
          className="track-back"
          onClick={() => navigate("/user-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="track-content">
        <div className="track-heading">
          <div className="track-heading-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="30"
              height="30"
            >
              <path
                d="M4 12h4l2-7 4 14 2-7h4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1>Track Appointment</h1>
            <p>
              Check the current status of your vaccination
              booking.
            </p>
          </div>
        </div>

        <div className="track-card">
          {loading && (
            <div className="track-message">
              Loading appointment status...
            </div>
          )}

          {!loading && !appointment && (
            <div className="track-empty">
              <div className="track-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width="38"
                  height="38"
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

              <h3>No Appointment Found</h3>

              <p>
                {message || "No appointment is available."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/book-slot")}
              >
                Book a Slot
              </button>
            </div>
          )}

          {!loading && appointment && (
            <>
              <div className="track-summary">
                <div>
                  <span>Vaccine</span>
                  <strong>
                    {appointment.vaccine || "Vaccination"}
                  </strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {formatDate(
                      appointment.bookingDate ||
                        appointment.date
                    )}
                  </strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>
                    {appointment.bookingTime ||
                      appointment.time ||
                      "-"}
                  </strong>
                </div>
              </div>

              <div className="track-status-box">
                <div className="status-circle">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    width="28"
                    height="28"
                  >
                    <path
                      d="M5 12.5L9.5 17 19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <span>Current Status</span>
                  <h2>{getStatus()}</h2>
                  <p>{getStatusDescription()}</p>
                </div>
              </div>

              <div className="tracking-progress">
                <h3>Appointment Progress</h3>

                <div className="progress-timeline">
                  <div className="progress-step active">
                    <div className="progress-dot">✓</div>

                    <div className="progress-content">
                      <strong>Appointment Booked</strong>
                      <span>
                        Your vaccination slot has been
                        successfully booked.
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      status === "confirmed" ||
                      status === "completed"
                        ? "progress-step active"
                        : "progress-step"
                    }
                  >
                    <div className="progress-dot">
                      {status === "confirmed" ||
                      status === "completed"
                        ? "✓"
                        : "2"}
                    </div>

                    <div className="progress-content">
                      <strong>Appointment Confirmed</strong>
                      <span>
                        Healthcare staff will confirm
                        your appointment.
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      status === "completed"
                        ? "progress-step active"
                        : "progress-step"
                    }
                  >
                    <div className="progress-dot">
                      {status === "completed" ? "✓" : "3"}
                    </div>

                    <div className="progress-content">
                      <strong>Vaccination Completed</strong>
                      <span>
                        Your vaccination will be marked
                        completed after receiving the vaccine.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="track-details">
                <div>
                  <span>Vaccination Center</span>
                  <strong>
                    {appointment.center || "-"}
                  </strong>
                </div>

                <div>
                  <span>Appointment ID</span>
                  <strong>#{appointment.id || "-"}</strong>
                </div>

                <div>
                  <span>Appointment Status</span>
                  <strong>{getStatus()}</strong>
                </div>
              </div>

              <div className="track-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/my-appointments")
                  }
                >
                  View My Appointments
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="track-footer">
        © 2026 VaxCare. Vaccination Slot Booking & Tracking
        Platform.
      </footer>
    </div>
  );
}

export default TrackAppointment;