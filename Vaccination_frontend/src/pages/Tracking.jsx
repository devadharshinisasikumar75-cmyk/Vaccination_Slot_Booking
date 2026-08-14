import "./Tracking.css";

function Tracking() {
  return (
    <div className="tracking-page">
      <div className="tracking-box">
        <h1>Vaccination Booking Status</h1>

        <div className="booking-info">
          <p><strong>Booking ID:</strong> VACC-001</p>
          <p><strong>Vaccine:</strong> Covaxin</p>
          <p><strong>Center:</strong> City Health Center</p>
          <p><strong>Date:</strong> 20-08-2026</p>
          <p><strong>Time:</strong> 10:00 AM - 11:00 AM</p>
        </div>

        <div className="status-section">
          <h3>Booking Status</h3>
          <div className="status pending">Pending</div>
        </div>

        <button className="back-btn">Back to Dashboard</button>
      </div>
    </div>
  );
}

export default Tracking;