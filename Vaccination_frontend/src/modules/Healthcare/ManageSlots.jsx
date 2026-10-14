import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./ManageSlots.css";

function ManageSlots() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [centers, setCenters] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [slotForm, setSlotForm] = useState({
    center: "",
    vaccine: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: "20",
  });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/slots`
      );

      if (!response.ok) {
        throw new Error("Failed to load vaccination slots.");
      }

      const data = await response.json();

      const slotList = Array.isArray(data)
        ? data
        : Array.isArray(data?.slots)
          ? data.slots
          : [];

      setSlots(slotList);
    } catch (error) {
      console.error("Slots error:", error);
      setSlots([]);
      setError(
        error.message ||
          "Unable to load vaccination slots."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [centerResponse, vaccineResponse] = await Promise.all([
          authenticatedFetch(`${API_BASE_URL}/api/catalog/centers`),
          authenticatedFetch(`${API_BASE_URL}/api/catalog/vaccines`),
        ]);
        const [centerData, vaccineData] = await Promise.all([
          centerResponse.json(),
          vaccineResponse.json(),
        ]);
        if (!centerResponse.ok || !vaccineResponse.ok) {
          throw new Error("Unable to load vaccination centers and vaccines.");
        }
        setCenters(Array.isArray(centerData) ? centerData.filter((center) => center.available) : []);
        setVaccines(Array.isArray(vaccineData) ? vaccineData.filter((vaccine) => vaccine.available) : []);
      } catch (loadError) {
        setFormMessage(loadError.message || "Unable to load slot options.");
      }
    };
    fetchCatalogs();
  }, []);

  const updateSlotForm = (event) => {
    const { name, value } = event.target;
    setSlotForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCreateSlot = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormMessage("");
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...slotForm,
          capacity: Number(slotForm.capacity),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create slot.");
      }
      setSlotForm((previous) => ({
        ...previous,
        date: "",
        startTime: "",
        endTime: "",
      }));
      setShowForm(false);
      setFormMessage("Slot created successfully.");
      await fetchSlots();
    } catch (createError) {
      setFormMessage(createError.message || "Unable to create slot.");
    } finally {
      setSaving(false);
    }
  };

  const getAvailable = (slot) => {
    if (typeof slot.available === "number") {
      return slot.available;
    }

    return Math.max(
      0,
      Number(slot.capacity || 0) -
        Number(slot.booked || 0)
    );
  };

  const getStatus = (slot) => {
    return getAvailable(slot) > 0
      ? "Available"
      : "Full";
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parts = String(date).split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  const formatTime = (time) => {
    if (!time) return "";
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(":").map(Number);
      return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    return time;
  };

  const formatSlotTime = (slot) => {
    if (slot.startTime && slot.endTime) {
      return `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;
    }
    if (slot.time?.includes(" - ")) {
      return slot.time.split(" - ").map(formatTime).join(" – ");
    }
    return formatTime(slot.time) || "-";
  };

  const getToday = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  };

  return (
    <div className="manage-slots-page">

      <header className="slots-header">
        <div>
          <h2>VaxCare</h2>
          <span>Healthcare Portal</span>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/healthcare-dashboard")
          }
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="slots-content">

        <div className="slots-heading">
          <div className="slots-icon">
            +
          </div>

          <div>
            <h1>Manage Slots</h1>
            <p>
              View vaccination dates, timings and slot availability.
            </p>
          </div>
        </div>

        <div className="slots-card">

          <div className="slots-create-header">
            <div>
              <h2>Scheduled Slots</h2>
              <p>Create slots for centers registered by the administrator.</p>
            </div>
            <button type="button" className="slots-add-btn" onClick={() => setShowForm((value) => !value)}>
              + Add Slot
            </button>
          </div>

          {formMessage && <p className="slots-form-message">{formMessage}</p>}

          {showForm && (
            <form className="slots-create-form" onSubmit={handleCreateSlot}>
              <label>
                Vaccination center
                <select
                  name="center"
                  value={slotForm.center}
                  onChange={updateSlotForm}
                  required
                >
                  <option value="">Select center</option>
                  {centers.map((center) => (
                    <option value={center.centerName} key={center.id}>{center.centerName}</option>
                  ))}
                </select>
              </label>
              <label>
                Vaccine
                <select
                  name="vaccine"
                  value={slotForm.vaccine}
                  onChange={updateSlotForm}
                  required
                >
                  <option value="">Select vaccine</option>
                  {vaccines.map((vaccine) => (
                    <option value={vaccine.vaccineName} key={vaccine.id}>
                      {vaccine.vaccineName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input
                  type="date"
                  min={getToday()}
                  value={slotForm.date}
                  name="date"
                  onChange={updateSlotForm}
                  required
                />
              </label>
              <label>
                Start time
                <input
                  type="time"
                  value={slotForm.startTime}
                  name="startTime"
                  onChange={updateSlotForm}
                  required
                />
              </label>
              <label>
                End time
                <input
                  type="time"
                  value={slotForm.endTime}
                  name="endTime"
                  min={slotForm.startTime || undefined}
                  onChange={updateSlotForm}
                  required
                />
              </label>
              <label>
                Capacity
                <input
                  type="number"
                  min="1"
                  value={slotForm.capacity}
                  name="capacity"
                  onChange={updateSlotForm}
                  required
                />
              </label>
              <button type="submit" className="slots-submit-btn" disabled={saving || centers.length === 0 || vaccines.length === 0}>
                {saving ? "Saving..." : "Save Slot"}
              </button>
            </form>
          )}

          {showForm && centers.length === 0 && (
            <p className="slots-form-message">Add an active vaccination center in the admin Vaccination Centers module before creating slots.</p>
          )}
          {showForm && vaccines.length === 0 && (
            <p className="slots-form-message">Add an active vaccine in the admin Vaccine Management module before creating slots.</p>
          )}

          {loading ? (
            <div className="slots-empty">
              <div className="slots-loading"></div>
              <h3>Loading Vaccination Slots...</h3>
              <p>
                Please wait while the available slots are loaded.
              </p>
            </div>
          ) : error ? (
            <div className="slots-empty">
              <div className="slots-error-icon">
                !
              </div>

              <h3>Unable to Load Slots</h3>

              <p>{error}</p>

              <button
                type="button"
                className="slots-retry-btn"
                onClick={fetchSlots}
              >
                Try Again
              </button>
            </div>
          ) : slots.length === 0 ? (
            <div className="slots-empty">
              <div className="slots-empty-icon">
                📅
              </div>

              <h3>No Slots Available</h3>

              <p>
                No vaccination slots are available currently.
              </p>
            </div>
          ) : (
            <div className="slots-table-wrapper">

              <table>
                <thead>
                  <tr>
                    <th>Center</th>
                    <th>Vaccine</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Capacity</th>
                    <th>Booked</th>
                    <th>Available</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {slots.map((slot) => {
                    const available =
                      getAvailable(slot);

                    const status =
                      getStatus(slot);

                    return (
                      <tr key={slot.id}>

                        <td>
                          <strong>
                            {slot.center || "-"}
                          </strong>
                        </td>

                        <td>{slot.vaccine || "-"}</td>

                        <td>
                          {formatDate(slot.date)}
                        </td>

                        <td>
                          {formatSlotTime(slot)}
                        </td>

                        <td>
                          {slot.capacity ?? 0}
                        </td>

                        <td>
                          {slot.booked ?? 0}
                        </td>

                        <td>
                          <strong>
                            {available}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              status === "Available"
                                ? "available-badge"
                                : "full-badge"
                            }
                          >
                            {status}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>
          )}

        </div>

      </main>

      <footer>
        © 2026 VaxCare. Vaccination Slot Booking & Tracking Platform.
      </footer>

    </div>
  );
}

export default ManageSlots;