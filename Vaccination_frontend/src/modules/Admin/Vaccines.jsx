import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./Vaccines.css";

function Vaccines() {
  const navigate = useNavigate();
  const [vaccines, setVaccines] = useState([]);
  const [form, setForm] = useState({
    vaccineName: "",
    manufacturer: "",
    dose: "",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loadVaccines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/catalog/vaccines`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load vaccines.");
      }
      setVaccines(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Unable to load vaccines.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVaccines();
  }, [loadVaccines]);

  const handleAddVaccine = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/catalog/vaccines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save vaccine.");
      }
      setForm({ vaccineName: "", manufacturer: "", dose: "", description: "" });
      setShowForm(false);
      setMessage("Vaccine saved to the database.");
      await loadVaccines();
    } catch (error) {
      setMessage(error.message || "Unable to save vaccine.");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vaccines-page">
      <header className="vaccines-header">
        <div>
          <h2>VaxCare</h2>
          <span>Vaccine Management</span>
        </div>
        <button onClick={() => navigate("/admin-dashboard")}>← Back to Dashboard</button>
      </header>

      <main className="vaccines-content">
        <div className="vaccines-heading">
          <div className="vaccines-icon">💉</div>
          <div>
            <h1>Vaccine Management</h1>
            <p>Add the real vaccines offered by your organization.</p>
          </div>
        </div>

        <section className="vaccines-card">
          <div className="vaccines-top">
            <div>
              <h2>Available Vaccines</h2>
              <p>{vaccines.length} vaccines registered in the database.</p>
            </div>
            <button
              className="add-vaccine-btn"
              type="button"
              onClick={() => {
                setShowForm((visible) => !visible);
                setMessage("");
                setIsError(false);
              }}
            >
              + Add Vaccine
            </button>
          </div>

          {message && <p className={isError ? "catalog-message catalog-error" : "catalog-message"}>{message}</p>}

          {showForm && (
            <form className="catalog-form" onSubmit={handleAddVaccine}>
              <label>
                Vaccine name
                <input
                  value={form.vaccineName}
                  onChange={(event) => setForm({ ...form, vaccineName: event.target.value })}
                  required
                />
              </label>
              <label>
                Manufacturer
                <input
                  value={form.manufacturer}
                  onChange={(event) => setForm({ ...form, manufacturer: event.target.value })}
                />
              </label>
              <label>
                Dose
                <input
                  value={form.dose}
                  onChange={(event) => setForm({ ...form, dose: event.target.value })}
                />
              </label>
              <label>
                Description
                <input
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>
              <button type="submit" className="add-vaccine-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Vaccine"}
              </button>
            </form>
          )}

          {loading ? (
            <p className="catalog-empty">Loading vaccines...</p>
          ) : vaccines.length === 0 ? (
            <p className="catalog-empty">No vaccines yet. Add your actual vaccine catalog above.</p>
          ) : (
            <div className="vaccine-grid">
              {vaccines.map((vaccine) => (
                <article className="vaccine-item" key={vaccine.id}>
                  <h3>{vaccine.vaccineName}</h3>
                  <p>{vaccine.description || "No description provided."}</p>
                  <span>{vaccine.available ? "Available" : "Unavailable"}</span>
                  {vaccine.manufacturer && <p>Manufacturer: {vaccine.manufacturer}</p>}
                  {vaccine.dose && <p>Dose: {vaccine.dose}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Vaccines;
