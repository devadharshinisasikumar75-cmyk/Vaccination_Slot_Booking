import React, {
  lazy,
  Suspense,
  Component
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import RoleSelect from "./pages/RoleSelect";

const UserDashboard = lazy(() =>
  import("./pages/Dashboard/UserDashboard")
);

const HealthcareDashboard = lazy(() =>
  import("./pages/Dashboard/HealthcareDashboard")
);

const AdminDashboard = lazy(() =>
  import("./pages/Dashboard/AdminDashboard")
);

/* ================= USER MODULES ================= */

const BookSlot = lazy(() =>
  import("./modules/User/BookSlot")
);

const MyAppointments = lazy(() =>
  import("./modules/User/MyAppointments")
);

const TrackAppointment = lazy(() =>
  import("./modules/User/TrackAppointment")
);

const UserVaccinationStatus = lazy(() =>
  import("./modules/User/VaccinationStatus")
);

const MyProfile = lazy(() =>
  import("./modules/User/MyProfile")
);

/* ================= HEALTHCARE MODULES ================= */

const Appointments = lazy(() =>
  import("./modules/Healthcare/Appointments")
);

const Requests = lazy(() =>
  import("./modules/Healthcare/Requests")
);

const Patients = lazy(() =>
  import("./modules/Healthcare/Patients")
);

const ManageSlots = lazy(() =>
  import("./modules/Healthcare/ManageSlots")
);

const HealthcareReports = lazy(() =>
  import("./modules/Healthcare/Reports")
);

/* ================= ADMIN MODULES ================= */

const Overview = lazy(() =>
  import("./modules/Admin/Overview")
);

const Users = lazy(() =>
  import("./modules/Admin/Users")
);

const Staff = lazy(() =>
  import("./modules/Admin/Staff")
);

const Centers = lazy(() =>
  import("./modules/Admin/Centers")
);

const Vaccines = lazy(() =>
  import("./modules/Admin/Vaccines")
);

const AdminReports = lazy(() =>
  import("./modules/Admin/Reports")
);


/* ================= ERROR HANDLER ================= */

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: ""
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Something went wrong."
    };
  }

  componentDidCatch(error) {
    console.error("Page Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f7ff",
            padding: "30px",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              background: "#ffffff",
              padding: "35px",
              borderRadius: "18px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
            }}
          >
            <h2 style={{ color: "#1e3a8a" }}>
              Page could not be loaded
            </h2>

            <p style={{ color: "#64748b" }}>
              Please go back and try again.
            </p>

            <button
              onClick={() => window.location.href = "/"}
              style={{
                border: "none",
                background: "#3155c7",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Go to Home
            </button>

            <p
              style={{
                marginTop: "20px",
                color: "#94a3b8",
                fontSize: "12px"
              }}
            >
              {this.state.errorMessage}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


/* ================= LOADING ================= */

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7ff",
        color: "#3155c7",
        fontSize: "18px",
        fontWeight: "600"
      }}
    >
      Loading...
    </div>
  );
}


/* ================= ROUTE WRAPPER ================= */

function Page({ children }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </PageErrorBoundary>
  );
}


/* ================= PROTECTED ROUTE ================= */

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");

  if (!userId || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


/* ================= ROLE ROUTE ================= */

function RoleRoute({ role, children }) {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  if (!userId || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return <Navigate to="/role-select" replace />;
  }

  return children;
}


/* ================= DASHBOARD REDIRECT ================= */

function DashboardRedirect() {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!userId || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (role === "USER") {
    return <Navigate to="/user-dashboard" replace />;
  }

  if (role === "HEALTHCARE_STAFF") {
    return <Navigate to="/healthcare-dashboard" replace />;
  }

  if (role === "ADMIN") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Navigate to="/role-select" replace />;
}


/* ================= APP ================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin/login"
          element={<Login role="ADMIN" />}
        />

        <Route
          path="/staff/login"
          element={<Login role="HEALTHCARE_STAFF" />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ================= ROLE SELECTION ================= */}

        <Route
          path="/role-select"
          element={
            <ProtectedRoute>
              <Page>
                <RoleSelect />
              </Page>
            </ProtectedRoute>
          }
        />


        {/* ================= OLD DASHBOARD URL ================= */}

        <Route
          path="/dashboard"
          element={<DashboardRedirect />}
        />


        {/* ================= USER DASHBOARD ================= */}

        <Route
          path="/user-dashboard"
          element={
            <RoleRoute role="USER">
              <Page>
                <UserDashboard />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/book-slot"
          element={
            <RoleRoute role="USER">
              <Page>
                <BookSlot />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <RoleRoute role="USER">
              <Page>
                <MyAppointments />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/track-appointment"
          element={
            <RoleRoute role="USER">
              <Page>
                <TrackAppointment />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/vaccination-status"
          element={
            <RoleRoute role="USER">
              <Page>
                <UserVaccinationStatus />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <RoleRoute role="USER">
              <Page>
                <MyProfile />
              </Page>
            </RoleRoute>
          }
        />


        {/* ================= HEALTHCARE DASHBOARD ================= */}

        <Route
          path="/healthcare-dashboard"
          element={
            <RoleRoute role="HEALTHCARE_STAFF">
              <Page>
                <HealthcareDashboard />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/healthcare/appointments"
          element={
            <RoleRoute role="HEALTHCARE_STAFF">
              <Page>
                <Appointments />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/healthcare/requests"
          element={
            <RoleRoute role="HEALTHCARE_STAFF">
              <Page>
                <Requests />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/healthcare/patients"
          element={
            <RoleRoute role="HEALTHCARE_STAFF">
              <Page>
                <Patients />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/healthcare/manage-slots"
          element={
            <RoleRoute role="HEALTHCARE_STAFF">
              <Page>
                <ManageSlots />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/healthcare/reports"
          element={
            <RoleRoute role="HEALTHCARE_STAFF">
              <Page>
                <HealthcareReports />
              </Page>
            </RoleRoute>
          }
        />


        {/* ================= ADMIN DASHBOARD ================= */}

        <Route
          path="/admin-dashboard"
          element={
            <RoleRoute role="ADMIN">
              <Page>
                <AdminDashboard />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/overview"
          element={
            <RoleRoute role="ADMIN">
              <Page>
                <Overview />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleRoute role="ADMIN">
              <Page>
                <Users />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <RoleRoute role="ADMIN">
              <Page>
                <Staff />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/centers"
          element={
            <RoleRoute role="ADMIN">
              <Page>
                <Centers />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/vaccines"
          element={
            <RoleRoute role="ADMIN">
              <Page>
                <Vaccines />
              </Page>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <RoleRoute role="ADMIN">
              <Page>
                <AdminReports />
              </Page>
            </RoleRoute>
          }
        />


        {/* ================= OLD PAGES ================= */}

        <Route
          path="/slot-booking"
          element={
            <ProtectedRoute>
              <Page>
                <Navigate to="/book-slot" replace />
              </Page>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Page>
                <Navigate to="/track-appointment" replace />
              </Page>
            </ProtectedRoute>
          }
        />


        {/* ================= UNKNOWN ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;