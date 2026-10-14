import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authenticatedFetch } from "../../config/api";
import "./BookSlot.css";

function BookSlot() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vaccine: "",
    date: "",
    time: "",
    slotId: "",
    center: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [centers, setCenters] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [vaccineResponse, centerResponse] = await Promise.all([
          authenticatedFetch(`${API_BASE_URL}/api/catalog/vaccines`),
          authenticatedFetch(`${API_BASE_URL}/api/catalog/centers`),
        ]);
        const [vaccineData, centerData] = await Promise.all([
          vaccineResponse.json(),
          centerResponse.json(),
        ]);
        if (!vaccineResponse.ok || !centerResponse.ok) {
          throw new Error("Unable to load vaccine and center options.");
        }
        setVaccines(Array.isArray(vaccineData) ? vaccineData.filter((item) => item.available) : []);
        setCenters(Array.isArray(centerData) ? centerData.filter((item) => item.available) : []);
      } catch (error) {
        setMessage(error.message || "Unable to load vaccine and center options.");
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  // ---------------------------------------------------------
  // GET TODAY'S DATE
  // ---------------------------------------------------------

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ---------------------------------------------------------
  // FETCH AVAILABLE SLOTS
  // WHEN CENTER + DATE ARE SELECTED
  // ---------------------------------------------------------

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.center || !formData.vaccine || !formData.date) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);
      setAvailableSlots([]);
      setFormData((previous) => ({
        ...previous,
        time: "",
        slotId: "",
      }));

      try {
        const url =
          `${API_BASE_URL}/api/slots/available` +
          `?center=${encodeURIComponent(formData.center)}` +
          `&date=${encodeURIComponent(formData.date)}` +
          `&vaccine=${encodeURIComponent(formData.vaccine)}`;

        const response = await authenticatedFetch(url);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load available slots."
          );
        }

        const slots = Array.isArray(data)
          ? data
          : Array.isArray(data?.slots)
            ? data.slots
            : [];

        // Only keep slots which still have capacity
        const usableSlots = slots.filter(
          (slot) =>
            slot.center === formData.center &&
            slot.date === formData.date &&
            slot.vaccine === formData.vaccine &&
            Number(slot.booked || 0) <
            Number(slot.capacity || 0)
        );

        setAvailableSlots(usableSlots);

        if (usableSlots.length === 0) {
          setMessage(
            "No available slots for the selected vaccine, center and date."
          );
        } else {
          setMessage("");
        }
      } catch (error) {
        console.error("Slot loading error:", error);

        setAvailableSlots([]);

        setMessage(
          error.message ||
            "Unable to load available slots. Please try again."
        );
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [formData.center, formData.vaccine, formData.date]);

  // ---------------------------------------------------------
  // HANDLE INPUT CHANGES
  // ---------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "center" || name === "date" || name === "vaccine"
        ? { time: "", slotId: "" }
        : {}),
    }));

    setMessage("");
  };

  const handleSlotChange = (event) => {
    const slotId = event.target.value;
    const selectedSlot = availableSlots.find(
      (slot) => String(slot.id) === slotId
    );
    setFormData((previous) => ({
      ...previous,
      slotId,
      time: selectedSlot?.time || "",
    }));
    setMessage("");
  };

  // ---------------------------------------------------------
  // BOOK SLOT
  // ---------------------------------------------------------

  const handleBooking = async (e) => {
    e.preventDefault();

    if (
      !formData.vaccine ||
      !formData.date ||
      !formData.time ||
      !formData.slotId ||
      !formData.center
    ) {
      setMessage("Please fill all the details.");
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setMessage(
        "Please login before booking a vaccination slot."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: Number(userId),
            vaccine: formData.vaccine,
            slotId: Number(formData.slotId),

            // Backend accepts this field
            date: formData.date,

            // Send the exact selected slot time
            time: formData.time,

            center: formData.center,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Booking failed."
        );
      }

      setMessage(
        "Vaccination slot booked successfully!"
      );

      // Go back to dashboard after successful booking
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1500);
    } catch (error) {
      console.error("Booking error:", error);

      setMessage(
        error.message ||
          "Unable to book slot. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Only past dates are blocked. Available times still depend on staff-created slots.
  // ---------------------------------------------------------

  const today = getToday();

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="book-slot-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="book-slot-header">

        <div className="brand">

          <div className="brand-icon">

            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3L21 5L17 9L15 7L19 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M13.5 8.5L4 18C3.4 18.6 3.4 19.4 4 20C4.6 20.6 5.4 20.6 6 20L15.5 10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M8 14L10 16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

          </div>

          <div>
            <h2>VaxCare</h2>
            <span>Vaccination Portal</span>
          </div>

        </div>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/user-dashboard")}
        >
          ← Back to Dashboard
        </button>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="book-slot-content">

        {/* PAGE HEADING */}

        <div className="page-heading">

          <div className="heading-icon">

            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

          </div>

          <div>

            <h1>Book Vaccination Slot</h1>

            <p>
              Choose your vaccine, preferred date, time and
              vaccination center.
            </p>

          </div>

        </div>


        {/* ===================================================
            BOOKING CARD
        ==================================================== */}

        <div className="booking-card">

          <form onSubmit={handleBooking}>

            {/* =================================================
                VACCINATION DETAILS
            ================================================== */}

            <div className="form-section">

              <h3>Vaccination Details</h3>

              <p>
                Select the vaccine you want to receive.
              </p>

              <label>Vaccine</label>

              <select
                name="vaccine"
                value={formData.vaccine}
                onChange={handleChange}
              >

                <option value="">
                  {catalogLoading ? "Loading vaccines..." : "Select Vaccine"}
                </option>

                {vaccines.map((vaccine) => (
                  <option key={vaccine.id} value={vaccine.vaccineName}>
                    {vaccine.vaccineName}
                  </option>
                ))}

              </select>

            </div>


            {/* =================================================
                DATE + TIME
            ================================================== */}

            <div className="form-row">

              {/* DATE */}

              <div className="form-group">

                <label>Preferred Date</label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                />

              </div>


              {/* TIME */}

              <div className="form-group">

                <label>Preferred Time</label>

                <select
                  name="time"
                  value={formData.slotId}
                  onChange={handleSlotChange}
                  disabled={
                    !formData.center ||
                    !formData.vaccine ||
                    !formData.date ||
                    slotsLoading ||
                    availableSlots.length === 0
                  }
                >

                  <option value="">
                    {slotsLoading
                      ? "Loading available times..."
                      : !formData.center ||
                        !formData.date
                      ? "Select vaccine, center and date first"
                      : availableSlots.length === 0
                      ? "No available times"
                      : "Select Time"}
                  </option>

                  {availableSlots.map((slot) => (
                    <option
                      key={slot.id}
                      value={slot.id}
                    >
                      {slot.time}
                    </option>
                  ))}

                </select>

              </div>

            </div>


            {/* =================================================
                VACCINATION CENTER
            ================================================== */}

            <div className="form-section center-section">

              <h3>Vaccination Center</h3>

              <p>
                Select a vaccination center.
              </p>

              <label>Center</label>

              <select
                name="center"
                value={formData.center}
                onChange={handleChange}
              >

                <option value="">
                  {catalogLoading ? "Loading centers..." : "Select Vaccination Center"}
                </option>

                {centers.map((center) => (
                  <option key={center.id} value={center.centerName}>
                    {center.centerName}
                  </option>
                ))}

              </select>

            </div>


            {/* =================================================
                AVAILABLE SLOT INFORMATION
            ================================================== */}

            {formData.center &&
            formData.vaccine &&
            formData.date &&
              !slotsLoading &&
              availableSlots.length > 0 && (
                <div className="success-message">
                  {availableSlots.length} vaccination time
                  {availableSlots.length > 1 ? "s" : ""} available
                  for the selected vaccine, center and date.
                </div>
              )}


            {/* =================================================
                MESSAGE
            ================================================== */}

            {message && (
              <div
                className={
                  message.includes("successfully") ||
                  message.includes("available")
                    ? "success-message"
                    : "error-message"
                }
              >
                {message}
              </div>
            )}


            {/* =================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="booking-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  navigate("/user-dashboard")
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="book-btn"
                disabled={
                  loading ||
                  slotsLoading ||
                  availableSlots.length === 0
                }
              >

                {loading ? (
                  "Booking..."
                ) : (
                  <>
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12.5L9.5 17L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    Book Slot
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer>

        <p>
          © 2026 VaxCare. Vaccination Slot Booking & Tracking
          Platform.
        </p>

      </footer>

    </div>
  );
}

export default BookSlot;