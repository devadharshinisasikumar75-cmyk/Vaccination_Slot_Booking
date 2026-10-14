import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Centers.css";

function Centers() {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [form, setForm] = useState({ centerName: "", location: "", contact: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loadCenters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/catalog/centers`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load vaccination centers.");
      }
      setCenters(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Unable to load vaccination centers.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  const handleAddCenter = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/catalog/centers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save vaccination center.");
      }
      setForm({ centerName: "", location: "", contact: "" });
      setShowForm(false);
      setMessage("Vaccination center saved to the database.");
      await loadCenters();
    } catch (error) {
      setMessage(error.message || "Unable to save vaccination center.");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="centers-page">
      <header className="centers-header">
        <div>
          <h2>VaxCare</h2>
          <span>Vaccination Center Management</span>
        </div>
        <button onClick={() => navigate("/admin-dashboard")}>← Back to Dashboard</button>
      </header>

      <main className="centers-content">
        <div className="centers-heading">
          <div className="centers-icon">⌖</div>
          <div>
            <h1>Vaccination Centers</h1>
            <p>Add the real vaccination locations used by your organization.</p>
          </div>
        </div>

        <section className="centers-card">
          <div className="centers-top">
            <div>
              <h2>Available Centers</h2>
              <p>{centers.length} centers registered in the database.</p>
            </div>
            <button
              className="add-center-btn"
              type="button"
              onClick={() => {
                setShowForm((visible) => !visible);
                setMessage("");
                setIsError(false);
              }}
            >
              + Add Center
            </button>
          </div>

          {message && <p className={isError ? "catalog-message catalog-error" : "catalog-message"}>{message}</p>}

          {showForm && (
            <form className="catalog-form" onSubmit={handleAddCenter}>
              <label>
                Center name
                <input
                  value={form.centerName}
                  onChange={(event) => setForm({ ...form, centerName: event.target.value })}
                  required
                />
              </label>
              <label>
                Address / location
                <input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </label>
              <label>
                Contact
                <input
                  value={form.contact}
                  onChange={(event) => setForm({ ...form, contact: event.target.value })}
                />
              </label>
              <button type="submit" className="add-center-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Center"}
              </button>
            </form>
          )}

          {loading ? (
            <p className="catalog-empty">Loading centers...</p>
          ) : centers.length === 0 ? (
            <p className="catalog-empty">No centers yet. Add your actual locations above.</p>
          ) : (
            <div className="center-list">
              {centers.map((center) => (
                <article className="center-item" key={center.id}>
                  <div>
                    <h3>{center.centerName}</h3>
                    <p>{center.location || "Location not provided"}</p>
                    {center.contact && <p>Contact: {center.contact}</p>}
                  </div>
                  <span>{center.available ? "Active" : "Inactive"}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Centers;
