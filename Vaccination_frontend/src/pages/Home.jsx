import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>Vaccination Slot Booking</h1>

      <p>
        Book your vaccination slot easily and track your appointment online.
      </p>

      <button onClick={() => navigate("/login")}>
        Book a Slot
      </button>
    </div>
  );
}

export default Home;