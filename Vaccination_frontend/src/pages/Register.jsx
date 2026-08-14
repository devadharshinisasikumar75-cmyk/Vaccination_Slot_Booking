import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Registration successful!");
    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <h1>Create Account</h1>

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input type="text" placeholder="Enter your name" required />

          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            required
          />

          <button type="submit">Register</button>
        </form>

        <button
          className="login-link"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}

export default Register;