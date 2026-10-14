import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
      >
        <div className="logo-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 2L6 14" />
            <path d="M6 14l-2 6 6-2" />
            <path d="M18 2c1.5 1.5 1.5 3.5 0 5L9 16" />
          </svg>
        </div>

        <span>VaxCare</span>
      </div>


      {/* MENU */}
      <div className="navbar-menu">

        <button
          className="nav-item"
          onClick={() => navigate("/")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
          </svg>

          Home
        </button>


        <a
          href="/#about"
          className="nav-item"
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v6" />
            <circle
              cx="12"
              cy="7.5"
              r="0.7"
              fill="currentColor"
            />
          </svg>

          About
        </a>


        <a
          href="/#features"
          className="nav-item"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3z" />
          </svg>

          Features
        </a>


        <a
          href="/#how-it-works"
          className="nav-item"
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>

          How It Works
        </a>

      </div>


      {/* LOGIN + SIGNUP */}
      <div className="navbar-buttons">

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>


        <button
          className="signup-btn"
          onClick={() => navigate("/register")}
        >
          Signup
        </button>

      </div>

    </nav>
  );
}

export default Navbar;