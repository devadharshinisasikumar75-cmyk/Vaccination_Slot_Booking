import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./VaccinationStatus.css";

function VaccinationStatus() {
  const navigate = useNavigate();

  const [vaccination, setVaccination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchVaccinationStatus = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setMessage("Please login to view your vaccination status.");
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/bookings/user/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load vaccination status."
          );
        }

        const bookings = Array.isArray(data)
          ? data
          : Array.isArray(data?.bookings)
          ? data.bookings
          : [];

        if (bookings.length === 0) {
          setVaccination(null);
          setMessage("You have not booked any vaccination appointment yet.");
          return;
        }

        const sortedBookings = [...bookings].sort(
          (a, b) => Number(b.id || 0) - Number(a.id || 0)
        );

        const latestBooking = sortedBookings[0];

        setVaccination(latestBooking);
        setMessage("");
      } catch (error) {
        console.error("Vaccination status error:", error);

        setVaccination(null);
        setMessage(
          error.message || "Unable to load vaccination status."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinationStatus();
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
    if (!vaccination?.status) {
      return "PENDING";
    }

    return String(vaccination.status).toUpperCase();
  };

  const getStatusClass = () => {
    const status = getStatus().toLowerCase();

    if (status === "confirmed") {
      return "confirmed";
    }

    if (status === "completed") {
      return "completed";
    }

    if (status === "cancelled") {
      return "cancelled";
    }

    return "pending";
  };

  const getStatusDescription = () => {
    const status = getStatus().toLowerCase();

    if (status === "completed") {
      return "Your vaccination has been completed successfully.";
    }

    if (status === "confirmed") {
      return "Your vaccination appointment has been confirmed. Please visit the vaccination center on the scheduled date.";
    }

    if (status === "cancelled") {
      return "This vaccination appointment has been cancelled.";
    }

    return "Your vaccination appointment is booked and waiting for confirmation.";
  };

  return (
    <div className="vaccination-status-page">

      <header className="vaccination-status-header">
        <div className="vaccination-status-brand">

          <div className="vaccination-status-brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="24"
              height="24"
            >
              <path
                d="M19 3l2 2-4 4-2-2 4-4z"
                stroke="currentColor"
                strokeWidth="1.7"
              />

              <path
                d="M13.5 8.5L4 18c-.6.6-.6 1.6 0 2.2.6.6 1.6.6 2.2 0l9.5-9.5"
                stroke="currentColor"
                strokeWidth="1.7"
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
          className="vaccination-status-back"
          onClick={() => navigate("/user-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="vaccination-status-content">

        <div className="vaccination-status-heading">

          <div className="vaccination-status-heading-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="30"
              height="30"
            >
              <path
                d="M5 12.5L9.5 17 19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div>
            <h1>Vaccination Status</h1>

            <p>
              View your current vaccination status and appointment details.
            </p>
          </div>

        </div>

        <div className="vaccination-status-card">

          {loading && (
            <div className="vaccination-message">
              Loading vaccination status...
            </div>
          )}

          {!loading && !vaccination && (
            <div className="vaccination-empty">

              <div className="vaccination-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width="40"
                  height="40"
                >
                  <path
                    d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>

              <h3>No Vaccination Record</h3>

              <p>
                {message ||
                  "Your vaccination appointment details will appear here."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/book-slot")}
              >
                Book Vaccination Slot
              </button>

            </div>
          )}

          {!loading && vaccination && (
            <>

              <div className="vaccination-status-top">

                <div
                  className={`vaccination-status-icon ${getStatusClass()}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    width="32"
                    height="32"
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

                <div className="vaccination-status-text">

                  <span>Current Status</span>

                  <h2 className={getStatusClass()}>
                    {getStatus()}
                  </h2>

                  <p>
                    {getStatusDescription()}
                  </p>

                </div>

              </div>

              <div className="vaccination-info">

                <div className="vaccination-info-item">
                  <span>Vaccine</span>
                  <strong>
                    {vaccination.vaccine || "-"}
                  </strong>
                </div>

                <div className="vaccination-info-item">
                  <span>Date</span>
                  <strong>
                    {formatDate(
                      vaccination.bookingDate ||
                      vaccination.date
                    )}
                  </strong>
                </div>

                <div className="vaccination-info-item">
                  <span>Time</span>
                  <strong>
                    {vaccination.bookingTime ||
                      vaccination.time ||
                      "-"}
                  </strong>
                </div>

                <div className="vaccination-info-item">
                  <span>Vaccination Center</span>
                  <strong>
                    {vaccination.center || "-"}
                  </strong>
                </div>

                <div className="vaccination-info-item">
                  <span>Appointment ID</span>
                  <strong>
                    #{vaccination.id || "-"}
                  </strong>
                </div>

              </div>

              <div className="vaccination-status-note">

                <div className="vaccination-note-icon">
                  ✓
                </div>

                <div>
                  <strong>Appointment Information</strong>

                  <p>
                    Keep your appointment details safe and visit the
                    vaccination center at the scheduled date and time.
                  </p>
                </div>

              </div>

            </>
          )}

        </div>

      </main>

      <footer className="vaccination-status-footer">
        VaxCare • Vaccination Slot Booking and Tracking Platform
      </footer>

    </div>
  );
}

export default VaccinationStatus;