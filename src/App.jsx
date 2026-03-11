import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/learner/Dashboard";
import CoursePlayer from "./pages/learner/CoursePlayer";
import CourseOverview from "./pages/learner/CourseOverview";
import AdminDashboard from "./pages/admin/Dashboard";
import CourseManager from "./pages/admin/CourseManager";
import CoursePayment from "./pages/CoursePayment";
import Users from "./pages/admin/Users";
import Payments from "./pages/admin/Payments";
import Wishlist from "./pages/learner/Wishlist";
import AllCourses from "./pages/learner/AllCourses";
import VerifyCertificate from "./pages/VerifyCertificate";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const location = useLocation();
  // Pages that have their own full-screen layout (sidebar, etc.) don't need the global Navbar
  const hideNavbar =
    location.pathname === "/dashboard" ||
    location.pathname === "/wishlist" ||
    location.pathname === "/courses-catalog" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.endsWith("/learn");

  return (
    <div className="min-h-screen bg-muted text-primary">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/verify/:certificateCode"
          element={<VerifyCertificate />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={["learner", "admin"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute roles={["learner", "admin"]}>
              <Wishlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses-catalog"
          element={
            <PrivateRoute roles={["learner", "admin"]}>
              <AllCourses />
            </PrivateRoute>
          }
        />
        <Route path="/courses/:courseId" element={<CourseOverview />} />
        <Route
          path="/courses/:courseId/pay"
          element={
            <PrivateRoute roles={["learner", "admin"]}>
              <CoursePayment />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses/:courseId/learn"
          element={
            <PrivateRoute roles={["learner", "admin"]}>
              <CoursePlayer />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <PrivateRoute roles={["admin"]}>
              <CourseManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute roles={["admin"]}>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <PrivateRoute roles={["admin"]}>
              <Payments />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
