import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../config/api";
import "./Tracking.css";

function Tracking() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Please log in first");
        navigate("/login");
        return;
      }

      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch bookings");
          return;
        }

        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Booking tracking error:", err);
        setError("Backend is not running");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  return (
    <div className="tracking-page">
      <div className="tracking-box">
        <h1>Vaccination Booking Status</h1>

        {loading && <p>Loading bookings...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && bookings.length === 0 && (
          <p>No bookings found. <button onClick={() => navigate("/slot-booking")}>Book Now</button></p>
        )}

        {!loading && bookings.length > 0 && (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <p><strong>Booking ID:</strong> VACC-{booking.id}</p>
                <p><strong>Vaccine:</strong> {booking.vaccine}</p>
                <p><strong>Center:</strong> {booking.center}</p>
                <p><strong>Date:</strong> {booking.bookingDate}</p>
                <p><strong>Time:</strong> {booking.bookingTime}</p>
                <div className="status-section">
                  <h4>Status</h4>
                  <div className={`status ${booking.status.toLowerCase()}`}>{booking.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Tracking;