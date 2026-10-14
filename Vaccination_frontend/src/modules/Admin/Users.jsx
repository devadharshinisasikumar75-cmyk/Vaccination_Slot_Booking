import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Users.css";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch(`${API_BASE_URL}/api/users`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load users");
        }

        return response.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Users error:", error);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="users-page">

      <header className="users-header">
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

      <main className="users-content">

        <div className="users-heading">
          <div className="users-icon">👥</div>

          <div>
            <h1>User Management</h1>
            <p>View and manage registered users.</p>
          </div>
        </div>

        {loading ? (
          <div className="users-message">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="users-message">
            No users available.
          </div>
        ) : (
          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name || "-"}</td>
                    <td>{user.email || "-"}</td>
                    <td>
                      <span className="user-role">
                        {user.role || "USER"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </main>

      <footer>
        © 2026 VaxCare. Vaccination Slot Booking & Tracking Platform.
      </footer>

    </div>
  );
}

export default Users;