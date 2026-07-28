import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/learner/Dashboard";
import CoursePlayer from "./pages/learner/CoursePlayer";
import CourseOverview from "./pages/learner/CourseOverview";
import AdminDashboard from "./pages/admin/Dashboard";
import CourseManager from "./pages/admin/CourseManager";
import CoursePayment from "./pages/CoursePayment";
import Users from "./pages/admin/Users";
import Payments from "./pages/admin/Payments";
import Submissions from "./pages/admin/Submissions";
import Wishlist from "./pages/learner/Wishlist";
import AllCourses from "./pages/learner/AllCourses";
import Certificates from "./pages/learner/Certificates";
import { useAuth } from "./context/AuthContext";
import PwaInstallBanner from "./components/PwaInstallBanner";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const isAdminOnly = roles && roles.length === 1 && roles[0] === "admin";
  const redirectTarget = isAdminOnly ? "/admin/login" : "/login";

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!user) return <Navigate to={redirectTarget} replace />;
  
  const effectiveRole = user.role || (user.roles?.includes("admin") ? "admin" : "learner");
  if (roles && !roles.includes(effectiveRole)) return <Navigate to={redirectTarget} replace />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-muted text-primary">
      <PwaInstallBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
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
          path="/certificates"
          element={
            <PrivateRoute roles={["learner", "admin"]}>
              <Certificates />
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
          path="/admin/submissions"
          element={
            <PrivateRoute roles={["admin"]}>
              <Submissions />
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
