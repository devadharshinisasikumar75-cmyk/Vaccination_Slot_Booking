import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section" id="about">

        <div className="hero-content">

          <div className="hero-badge">
            <span>✦</span> Safe • Simple • Smart
          </div>

          <h1>
            Your Vaccination
            <br />
            <span>Journey Made Easy.</span>
          </h1>

          <p>
            Book your vaccination appointment, choose your preferred
            center and time, and track your vaccination status —
            all from one simple platform.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              <span>💉</span>
              Book a Vaccination Slot
              <span className="arrow">→</span>
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/login")}
            >
              Track Appointment
              <span>→</span>
            </button>

          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              Easy Booking
            </div>

            <div className="trust-item">
              <span className="trust-icon">✓</span>
              Secure Records
            </div>

            <div className="trust-item">
              <span className="trust-icon">✓</span>
              Easy Tracking
            </div>
          </div>

        </div>

        {/* Hero Visual */}
        <div className="hero-visual">

          <div className="pastel-blob blob-one"></div>
          <div className="pastel-blob blob-two"></div>

          <div className="medical-card">

            <div className="medical-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M18 2L6 14" />
                <path d="M6 14l-2 6 6-2" />
                <path d="M18 2c1.5 1.5 1.5 3.5 0 5L9 16" />
              </svg>
            </div>

            <div className="medical-plus">+</div>

            <h3>Vaccination</h3>
            <p>Care that keeps you protected</p>

            <div className="appointment-mini">

              <div className="mini-icon">📅</div>

              <div>
                <small>Next Appointment</small>
                <strong>Ready to Book</strong>
              </div>

              <span className="status-dot"></span>

            </div>

          </div>

          <div className="floating-info info-one">
            <span>✓</span>
            <div>
              <strong>Easy Booking</strong>
              <small>Choose your slot</small>
            </div>
          </div>

          <div className="floating-info info-two">
            <span>🔒</span>
            <div>
              <strong>Secure</strong>
              <small>Your records are safe</small>
            </div>
          </div>

        </div>

      </section>


      {/* Features Section */}
      <section className="features-section" id="features">

        <div className="section-heading">

          <span className="section-label">
            OUR FEATURES
          </span>

          <h2>
            Everything You Need,
            <span> In One Place.</span>
          </h2>

          <p>
            A simple and convenient way to manage your complete
            vaccination journey.
          </p>

        </div>


        <div className="feature-container">

          <div className="feature-card card-blue">

            <div className="feature-icon blue-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
                <path d="M8 14h2M14 14h2M8 18h2" />
              </svg>
            </div>

            <h3>Easy Booking</h3>

            <p>
              Find available vaccination centers and
              book your preferred date and time easily.
            </p>

            <div className="feature-link">
              Book Easily →
            </div>

          </div>


          <div className="feature-card card-purple">

            <div className="feature-icon purple-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
                <path d="M8 11l2 2 4-4" />
              </svg>
            </div>

            <h3>Track Appointment</h3>

            <p>
              Track your appointment status from booking
              to successful vaccination.
            </p>

            <div className="feature-link">
              Track Easily →
            </div>

          </div>


          <div className="feature-card card-mint">

            <div className="feature-icon mint-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <h3>Secure Records</h3>

            <p>
              Keep your vaccination details and appointment
              information organized securely.
            </p>

            <div className="feature-link">
              Stay Protected →
            </div>

          </div>

        </div>

      </section>


      {/* How It Works */}
      <section className="how-section" id="how-it-works">

        <div className="section-heading">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            Vaccination Made
            <span> Super Simple.</span>
          </h2>

          <p>
            Complete your vaccination journey in just three simple steps.
          </p>

        </div>


        <div className="steps-container">

          <div className="step-card">

            <div className="step-number">01</div>

            <div className="step-icon">👤</div>

            <h3>Create Account</h3>

            <p>
              Register as a user and get started
              to get started.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">02</div>

            <div className="step-icon">📅</div>

            <h3>Book Your Slot</h3>

            <p>
              Select your preferred vaccination center,
              date and available time slot.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">03</div>

            <div className="step-icon">✓</div>

            <h3>Track & Complete</h3>

            <p>
              Track your appointment and complete
              your vaccination safely.
            </p>

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="home-cta">

        <div className="cta-decoration decoration-one"></div>
        <div className="cta-decoration decoration-two"></div>

        <div className="cta-content">

          <span className="cta-icon">💙</span>

          <h2>
            Ready to take the next step?
          </h2>

          <p>
            Start your vaccination journey with VaxCare today.
          </p>

          <button
            onClick={() => navigate("/login")}
          >
            Get Started
            <span>→</span>
          </button>

        </div>

      </section>


      {/* Footer */}
      <footer className="home-footer">

        <div className="footer-logo">
          💉 <strong>VaxCare</strong>
        </div>

        <p>
          Vaccination Slot Booking & Tracking Platform
        </p>

        <span>
          © 2026 VaxCare. All rights reserved.
        </span>

      </footer>

    </div>
  );
}

export default Home;