import "./SlotBooking.css";

function SlotBooking() {
  return (
    <div className="booking-page">
      <div className="booking-box">
        <h1>Book Vaccination Slot</h1>
        <p>Select your vaccination details and preferred slot.</p>

        <label>Vaccination Center</label>
        <select>
          <option>Select Center</option>
          <option>City Health Center</option>
          <option>Government Hospital</option>
          <option>Primary Health Center</option>
        </select>

        <label>Vaccine</label>
        <select>
          <option>Select Vaccine</option>
          <option>Covaxin</option>
          <option>Covishield</option>
          <option>Other</option>
        </select>

        <label>Date</label>
        <input type="date" />

        <label>Time Slot</label>
        <select>
          <option>Select Time</option>
          <option>09:00 AM - 10:00 AM</option>
          <option>10:00 AM - 11:00 AM</option>
          <option>11:00 AM - 12:00 PM</option>
          <option>02:00 PM - 03:00 PM</option>
        </select>

        <button className="book-btn">Confirm Booking</button>
      </div>
    </div>
  );
}

export default SlotBooking;