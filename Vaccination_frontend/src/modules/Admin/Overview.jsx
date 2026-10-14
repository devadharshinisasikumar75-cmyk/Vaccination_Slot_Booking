import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Overview.css";

function Overview() {
  const navigate = useNavigate();

  const [staffCount, setStaffCount] = useState(0);

  const loadStaffCount = () => {
    const savedStaff = localStorage.getItem("healthcareStaff");

    if (savedStaff) {
      try {
        const staff = JSON.parse(savedStaff);
        setStaffCount(Array.isArray(staff) ? staff.length : 0);
      } catch {
        setStaffCount(0);
      }
    } else {
      setStaffCount(0);
    }
  };

  useEffect(() => {
    loadStaffCount();

    const handleStorageChange = () => {
      loadStaffCount();
    };

    window.addEventListener("storage", handleStorageChange);

    const timer = setInterval(() => {
      loadStaffCount();
    }, 300);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="admin-module-page">

      <header className="admin-module-header">
        <div>
          <h2>VaxCare</h2>
          <span>Admin Portal</span>
        </div>

        <button
          onClick={() => navigate("/admin-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="admin-module-content">

        <div className="module-heading">
          <div className="module-icon">▣</div>

          <div>
            <h1>Dashboard Overview</h1>
            <p>
              Monitor the overall vaccination platform activity.
            </p>
          </div>
        </div>

        <div className="overview-grid">

          <div className="overview-card blue">
            <span>Total Users</span>
            <strong>3</strong>
            <p>Registered users</p>
          </div>

          <div className="overview-card purple">
            <span>Healthcare Staff</span>
            <strong>{staffCount}</strong>
            <p>Active healthcare staff</p>
          </div>

          <div className="overview-card green">
            <span>Vaccination Centers</span>
            <strong>4</strong>
            <p>Available centers</p>
          </div>

          <div className="overview-card orange">
            <span>Total Vaccines</span>
            <strong>5</strong>
            <p>Vaccines available</p>
          </div>

        </div>

        <div className="overview-info">

          <h2>System Overview</h2>

          <p>
            VaxCare helps administrators manage registered
            users, healthcare staff, vaccination centers and
            available vaccines through a centralized platform.
          </p>

          <div className="overview-buttons">

            <button
              onClick={() => navigate("/admin/users")}
            >
              Manage Users →
            </button>

            <button
              onClick={() => navigate("/admin/staff")}
            >
              Manage Staff →
            </button>

            <button
              onClick={() => navigate("/admin/centers")}
            >
              Manage Centers →
            </button>

            <button
              onClick={() => navigate("/admin/vaccines")}
            >
              Manage Vaccines →
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Overview;