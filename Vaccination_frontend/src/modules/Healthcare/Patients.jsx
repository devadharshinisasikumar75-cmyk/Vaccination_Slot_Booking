import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Patients.css";

function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [usersResponse, appointmentsResponse] = await Promise.all([
        authenticatedFetch(`${API_BASE_URL}/api/users`),
        authenticatedFetch(`${API_BASE_URL}/api/healthcare/appointments`),
      ]);

      if (!usersResponse.ok) {
        throw new Error("Unable to load patient records.");
      }

      if (!appointmentsResponse.ok) {
        throw new Error("Unable to load vaccination details.");
      }

      const usersData = await usersResponse.json();
      const appointmentsData = await appointmentsResponse.json();

      const users = Array.isArray(usersData) ? usersData : [];
      const appointments = Array.isArray(appointmentsData)
        ? appointmentsData
        : [];

      const patientUsers = users.filter(
        (user) =>
          !user.role ||
          String(user.role).toUpperCase() === "USER"
      );

      const patientRecords = patientUsers.map((user) => {
        const userAppointments = appointments
          .filter(
            (appointment) =>
              Number(appointment.userId) === Number(user.id)
          )
          .sort(
            (a, b) =>
              Number(b.id || 0) - Number(a.id || 0)
          );

        const latestAppointment = userAppointments[0];

        return {
          id: user.id,
          name: user.name || "Patient",
          email: user.email || "-",
          vaccine: latestAppointment?.vaccine || "-",
          date:
            latestAppointment?.bookingDate ||
            latestAppointment?.date ||
            "-",
          time:
            latestAppointment?.bookingTime ||
            latestAppointment?.time ||
            "-",
          center: latestAppointment?.center || "-",
          status: latestAppointment?.status || "No Appointment",
          appointmentId: latestAppointment?.id || null,
        };
      });

      setPatients(patientRecords);
    } catch (error) {
      console.error("Patient records error:", error);
      setPatients([]);
      setMessage(
        error.message ||
          "Unable to load patient records. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date || date === "-") {
      return "-";
    }

    const parts = String(date).split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "confirmed") {
      return "confirmed";
    }

    if (value === "completed") {
      return "completed";
    }

    if (value === "cancelled") {
      return "cancelled";
    }

    if (value === "pending") {
      return "pending";
    }

    return "no-appointment";
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div className="patients-brand">
          <div className="patients-brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
              <path d="M16 11c2.8 0 5 2.1 5 5" />
              <path d="M16 5.5a2.5 2.5 0 0 1 0 5" />
            </svg>
          </div>

          <div>
            <h2>VaxCare</h2>
            <span>Healthcare Portal</span>
          </div>
        </div>

        <button
          type="button"
          className="patients-back"
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

      <main className="patients-content">
        <div className="patients-heading">
          <div className="patients-heading-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M15 20c.2-2.8 2-4.7 4.5-4.7 1 0 1.8.2 2.5.7" />
            </svg>
          </div>

          <div>
            <span>HEALTHCARE STAFF</span>
            <h1>Patient Records</h1>
            <p>
              View registered patients and their vaccination details.
            </p>
          </div>
        </div>

        <div className="patients-toolbar">
          <div>
            <strong>{patients.length}</strong>
            <span>Registered Patients</span>
          </div>

          <button
            type="button"
            className="patients-refresh"
            onClick={fetchPatients}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 11a8.1 8.1 0 0 0-15.5-3" />
              <path d="M4 4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 3" />
              <path d="M20 20v-4h-4" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="patients-card patients-empty">
            <div className="patients-loading"></div>
            <h3>Loading Patient Records...</h3>
            <p>
              Please wait while we load registered patient details.
            </p>
          </div>
        ) : message ? (
          <div className="patients-card patients-empty">
            <div className="patients-empty-icon error-icon">
              !
            </div>
            <h3>Unable to Load Records</h3>
            <p>{message}</p>
            <button
              type="button"
              onClick={fetchPatients}
              className="patients-action-btn"
            >
              Try Again
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="patients-card patients-empty">
            <div className="patients-empty-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M15 20c.2-2.8 2-4.7 4.5-4.7 1 0 1.8.2 2.5.7" />
              </svg>
            </div>

            <h3>No Patients Found</h3>
            <p>
              No registered patient records are available currently.
            </p>
          </div>
        ) : (
          <div className="patients-list">
            {patients.map((patient) => (
              <div className="patient-card" key={patient.id}>
                <div className="patient-card-top">
                  <div className="patient-avatar">
                    {patient.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="patient-main-info">
                    <h2>{patient.name}</h2>
                    <p>{patient.email}</p>
                  </div>

                  <span
                    className={`patient-status ${getStatusClass(
                      patient.status
                    )}`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div className="patient-details">
                  <div className="patient-detail">
                    <span>Patient ID</span>
                    <strong>#{patient.id}</strong>
                  </div>

                  <div className="patient-detail">
                    <span>Vaccine</span>
                    <strong>{patient.vaccine}</strong>
                  </div>

                  <div className="patient-detail">
                    <span>Date</span>
                    <strong>{formatDate(patient.date)}</strong>
                  </div>

                  <div className="patient-detail">
                    <span>Time</span>
                    <strong>{patient.time}</strong>
                  </div>

                  <div className="patient-detail patient-detail-wide">
                    <span>Vaccination Center</span>
                    <strong>{patient.center}</strong>
                  </div>

                  <div className="patient-detail">
                    <span>Appointment ID</span>
                    <strong>
                      {patient.appointmentId
                        ? `#${patient.appointmentId}`
                        : "-"}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="patients-footer">
        © 2026 VaxCare. Vaccination Slot Booking & Tracking Platform.
      </footer>
    </div>
  );
}

export default Patients;