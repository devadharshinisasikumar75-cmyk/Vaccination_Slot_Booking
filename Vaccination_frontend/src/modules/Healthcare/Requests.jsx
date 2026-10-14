import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Requests.css";

function Requests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =========================================================
  // LOAD PENDING APPOINTMENT REQUESTS
  // =========================================================
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/healthcare/appointments`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load appointment requests."
        );
      }

      const appointments = Array.isArray(data) ? data : [];

      // Only PENDING appointments are shown as requests
      const pendingRequests = appointments.filter(
        (appointment) =>
          String(appointment.status || "PENDING").toUpperCase() ===
          "PENDING"
      );

      setRequests(pendingRequests);
    } catch (error) {
      console.error("Request loading error:", error);

      setRequests([]);

      setMessage(
        error.message ||
          "Unable to load appointment requests. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =========================================================
  // UPDATE REQUEST STATUS
  // =========================================================
  const updateRequestStatus = async (id, status) => {
    try {
      setMessage("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/bookings/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update appointment request."
        );
      }

      if (status === "CONFIRMED") {
        setMessage("Appointment request confirmed successfully.");
      } else {
        setMessage("Appointment request cancelled successfully.");
      }

      // Remove processed request from this page
      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => Number(request.id) !== Number(id)
        )
      );
    } catch (error) {
      console.error("Status update error:", error);

      setMessage(
        error.message || "Unable to update appointment request."
      );
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parts = String(date).split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  // =========================================================
  // PAGE
  // =========================================================
  return (
    <div className="requests-page">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="requests-header">

        <div className="requests-brand">

          <div className="requests-brand-icon">
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
          className="requests-back-btn"
          onClick={() => navigate("/healthcare-dashboard")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M11 18l-6-6 6-6" />
          </svg>

          Back to Dashboard
        </button>

      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="requests-content">

        {/* PAGE HEADING */}
        <div className="requests-heading">

          <div className="requests-heading-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="3"
              />

              <path d="M8 9h8" />
              <path d="M8 13h5" />
              <path d="M8 17h4" />
            </svg>

          </div>

          <div>
            <span>HEALTHCARE STAFF</span>

            <h1>Appointment Requests</h1>

            <p>
              Review and manage pending vaccination
              appointment requests.
            </p>
          </div>

        </div>


        {/* =====================================================
            MESSAGE
        ====================================================== */}
        {message && (
          <div
            className={
              message.toLowerCase().includes("successfully") ||
              message.toLowerCase().includes("confirmed") ||
              message.toLowerCase().includes("cancelled")
                ? "requests-success"
                : "requests-error"
            }
          >
            {message}
          </div>
        )}


        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading ? (
          <div className="requests-empty">

            <div className="loading-circle"></div>

            <h3>Loading Requests...</h3>

            <p>
              Please wait while we load appointment requests.
            </p>

          </div>
        ) : requests.length === 0 ? (

          /* ===================================================
             NO REQUESTS
          ==================================================== */
          <div className="requests-empty">

            <div className="empty-icon">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4h12v16H6z" />
                <path d="M9 8h6" />
                <path d="M9 12h6" />
                <path d="M9 16h4" />
              </svg>

            </div>

            <h3>No Pending Requests</h3>

            <p>
              There are currently no appointment requests
              waiting for approval.
            </p>

            <button
              className="refresh-btn"
              onClick={fetchRequests}
            >
              Refresh Requests
            </button>

          </div>

        ) : (

          /* ===================================================
             REQUEST LIST
          ==================================================== */
          <div className="requests-list">

            {requests.map((request) => (

              <div
                className="request-card"
                key={request.id}
              >

                {/* =================================================
                    REQUEST TOP
                ================================================== */}
                <div className="request-top">

                  <div className="patient-icon">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                      />

                      <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                    </svg>

                  </div>


                  <div className="patient-info">

                    <h2>
                      {request.userName ||
                        request.name ||
                        "Patient"}
                    </h2>

                    <p>
                      {request.email ||
                        request.userEmail ||
                        "Patient details"}
                    </p>

                  </div>


                  <span className="pending-badge">
                    Pending
                  </span>

                </div>


                {/* =================================================
                    REQUEST DETAILS
                ================================================== */}
                <div className="request-details">

                  <div className="detail-item">

                    <span className="detail-label">
                      Vaccine
                    </span>

                    <strong>
                      {request.vaccine ||
                        "Not specified"}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span className="detail-label">
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        request.bookingDate ||
                        request.date
                      )}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span className="detail-label">
                      Time
                    </span>

                    <strong>
                      {request.bookingTime ||
                        request.time ||
                        "Not specified"}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span className="detail-label">
                      Vaccination Center
                    </span>

                    <strong>
                      {request.center ||
                        "Not specified"}
                    </strong>

                  </div>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================== */}
                <div className="request-actions">

                  {/* REJECT */}
                  <button
                    className="reject-btn"
                    onClick={() =>
                      updateRequestStatus(
                        request.id,
                        "CANCELLED"
                      )
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>

                    Reject
                  </button>


                  {/* CONFIRM */}
                  <button
                    className="approve-btn"
                    onClick={() =>
                      updateRequestStatus(
                        request.id,
                        "CONFIRMED"
                      )
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5L9.5 17L19 7" />
                    </svg>

                    Confirm
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="requests-footer">

        <p>
          © 2026 VaxCare. Vaccination Slot Booking &
          Tracking Platform.
        </p>

      </footer>

    </div>
  );
}

export default Requests;