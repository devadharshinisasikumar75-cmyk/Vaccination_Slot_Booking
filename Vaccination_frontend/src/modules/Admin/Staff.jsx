import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Staff.css";

function Staff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/staff`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load staff accounts.");
      }
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Unable to load staff accounts.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleAddStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create staff account.");
      }
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
      setMessage("Healthcare staff account created. Share the initial password securely.");
      await loadStaff();
    } catch (error) {
      setMessage(error.message || "Unable to create staff account.");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="staff-page">
      <header className="staff-header">
        <div>
          <h2>VaxCare</h2>
          <span>Healthcare Staff Management</span>
        </div>
        <button onClick={() => navigate("/admin-dashboard")}>
          ← Back to Dashboard
        </button>
      </header>

      <main className="staff-content">
        <div className="staff-heading">
          <div className="staff-icon">🏥</div>
          <div>
            <h1>Healthcare Staff</h1>
            <p>Only accounts created by an administrator can use the staff portal.</p>
          </div>
        </div>

        <div className="staff-card">
          <div className="staff-top">
            <div>
              <h2>Staff Members</h2>
              <p>{staff.length} healthcare staff accounts</p>
            </div>
            <button
              className="add-staff-btn"
              type="button"
              onClick={() => {
                setShowForm((visible) => !visible);
                setMessage("");
                setIsError(false);
              }}
            >
              + Add Staff
            </button>
          </div>

          {message && (
            <p className={isError ? "staff-message staff-error" : "staff-message"}>
              {message}
            </p>
          )}

          {showForm && (
            <form className="staff-form" onSubmit={handleAddStaff}>
              <div className="form-group">
                <label htmlFor="staff-name">Staff Name</label>
                <input
                  id="staff-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="staff-email">Email Address</label>
                <input
                  id="staff-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="staff-password">Initial Password</label>
                <input
                  id="staff-password"
                  type="password"
                  minLength={12}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-staff-btn" disabled={saving}>
                  {saving ? "Creating..." : "Create Staff Account"}
                </button>
                <button
                  type="button"
                  className="cancel-staff-btn"
                  onClick={() => {
                    setShowForm(false);
                    setForm({ name: "", email: "", password: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="staff-table">
            <div className="staff-row staff-title">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
            </div>
            {loading ? (
              <div className="staff-empty">Loading staff accounts...</div>
            ) : staff.length === 0 ? (
              <div className="staff-empty">No healthcare staff have been assigned yet.</div>
            ) : (
              staff.map((person) => (
                <div className="staff-row" key={person.id}>
                  <span className="staff-name">{person.name}</span>
                  <span>{person.email}</span>
                  <span><span className="role-badge">{person.role}</span></span>
                  <span><span className="active-badge">{person.status}</span></span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Staff;
