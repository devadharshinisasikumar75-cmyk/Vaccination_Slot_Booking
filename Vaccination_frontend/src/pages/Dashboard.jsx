import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Vaccination Dashboard</h1>
        <button className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <h2>Welcome!</h2>
        <p>Manage your vaccination appointments easily.</p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Book a Slot</h3>
            <p>Find an available vaccination slot and book your appointment.</p>
            <button>Book Now</button>
          </div>

          <div className="dashboard-card">
            <h3>My Booking</h3>
            <p>View your vaccination appointment details.</p>
            <button>View Booking</button>
          </div>

          <div className="dashboard-card">
            <h3>Track Status</h3>
            <p>Track your vaccination booking status.</p>
            <button>Track Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;