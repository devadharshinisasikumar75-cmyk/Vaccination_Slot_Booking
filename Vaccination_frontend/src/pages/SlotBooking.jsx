import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../config/api";
import "./SlotBooking.css";

function SlotBooking() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    center: "",
    vaccine: "",
    bookingDate: "",
    bookingTime: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const centers = ["City Health Center", "Government Hospital", "Primary Health Center"];
  const vaccines = ["Covaxin", "Covishield", "Other"];

  // Fetch available slots on mount
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/slots/available`);
        const data = await response.json();
        if (response.ok) {
          setAvailableSlots(data.slots || []);
        }
      } catch (error) {
        console.error("Could not fetch slots:", error);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, []);

  // Filter slots when center or date changes
  useEffect(() => {
    if (formData.center || formData.bookingDate) {
      const filtered = availableSlots.filter(slot => {
        const centerMatch = !formData.center || slot.center === formData.center;
        const dateMatch = !formData.bookingDate || slot.date === formData.bookingDate;
        return centerMatch && dateMatch;
      });
      setFilteredSlots(filtered);
    } else {
      setFilteredSlots([]);
    }
  }, [formData.center, formData.bookingDate, availableSlots]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlotSelect = (slot) => {
    setFormData({
      ...formData,
      bookingDate: slot.date,
      bookingTime: slot.time,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.center || !formData.vaccine || !formData.bookingDate || !formData.bookingTime) {
      setMessage("Please fill all fields");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("Please log in first");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId),
          center: formData.center,
          vaccine: formData.vaccine,
          bookingDate: formData.bookingDate,
          bookingTime: formData.bookingTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Booking failed");
        return;
      }

      setMessage("Booking confirmed successfully!");
      setTimeout(() => navigate("/tracking"), 1000);
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("Backend is not running. Start the Spring Boot app first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-box">
        <h1>Book Vaccination Slot</h1>
        <p>Select your vaccination details and preferred slot.</p>

        <form onSubmit={handleSubmit}>
          <label>Vaccination Center</label>
          <select
            name="center"
            value={formData.center}
            onChange={handleChange}
            required
          >
            <option value="">Select Center</option>
            {centers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label>Vaccine</label>
          <select
            name="vaccine"
            value={formData.vaccine}
            onChange={handleChange}
            required
          >
            <option value="">Select Vaccine</option>
            {vaccines.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {formData.center && (
            <>
              <label>Available Slots</label>
              {slotsLoading ? (
                <p>Loading slots...</p>
              ) : filteredSlots.length === 0 ? (
                <p style={{ color: "#ef4444" }}>No slots available for this center</p>
              ) : (
                <div className="slots-grid">
                  {filteredSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`slot-card ${formData.bookingDate === slot.date && formData.bookingTime === slot.time ? "selected" : ""}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <div className="slot-date">{slot.date}</div>
                      <div className="slot-time">{slot.time}</div>
                      <div className="slot-availability">
                        {slot.available}/{slot.capacity} available
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <button type="submit" className="book-btn" disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>

        {message && (
          <p
            style={{
              color: message.includes("success") ? "green" : "red",
              marginTop: "10px",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default SlotBooking;