import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/learner/Dashboard";
import CoursePlayer from "./pages/learner/CoursePlayer";
import CourseOverview from "./pages/learner/CourseOverview";
import AdminDashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import CourseManager from "./pages/admin/CourseManager";
import CoursePayment from "./pages/CoursePayment";
import Users from "./pages/admin/Users";
import Payments from "./pages/admin/Payments";
import Submissions from "./pages/admin/Submissions";
import Wishlist from "./pages/learner/Wishlist";
import AllCourses from "./pages/learner/AllCourses";
import Certificates from "./pages/learner/Certificates";
import InstructorDashboard from "./pages/instructor/Dashboard";
import InstructorCourseManager from "./pages/instructor/CourseManager";
import InstructorSubmissions from "./pages/instructor/Submissions";
import { useAuth } from "./context/AuthContext";
import PwaInstallBanner from "./components/PwaInstallBanner";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const isAdminOnly = roles && roles.length === 1 && roles[0] === "admin";
  const redirectTarget = isAdminOnly ? "/admin/login" : "/login";

  if (loading)
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-xl w-3/4 mx-auto" />
          <div className="h-4 bg-gray-100 rounded-lg w-1/2 mx-auto" />
          <div className="h-12 bg-gray-200 rounded-2xl w-full pt-4" />
        </div>
      </div>
    );
  if (!user) return <Navigate to={redirectTarget} replace />;
  
  const effectiveRole = user.role || (user.roles?.includes("admin") ? "admin" : (user.roles?.includes("instructor") ? "instructor" : (user.roles?.includes("instructor_pending") ? "instructor_pending" : "learner")));
  
  if (roles) {
    const isAllowed =
      roles.includes(effectiveRole) ||
      (roles.includes("learner") && ["learner", "instructor_pending", "instructor", "admin"].includes(effectiveRole)) ||
      (roles.includes("instructor") && ["instructor", "admin"].includes(effectiveRole));

    if (!isAllowed) {
      return <Navigate to={redirectTarget} replace />;
    }
  }
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

        {/* Learner Routes (Accessible by learner, instructor_pending, instructor, admin) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={["learner"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute roles={["learner"]}>
              <Wishlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <PrivateRoute roles={["learner"]}>
              <Certificates />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses-catalog"
          element={
            <PrivateRoute roles={["learner"]}>
              <AllCourses />
            </PrivateRoute>
          }
        />
        <Route path="/courses/:courseId" element={<CourseOverview />} />
        <Route
          path="/courses/:courseId/pay"
          element={
            <PrivateRoute roles={["learner"]}>
              <CoursePayment />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses/:courseId/learn"
          element={
            <PrivateRoute roles={["learner"]}>
              <CoursePlayer />
            </PrivateRoute>
          }
        />

        {/* Instructor Studio Routes */}
        <Route path="/instructor" element={<Navigate to="/instructor/dashboard" replace />} />
        <Route
          path="/instructor/dashboard"
          element={
            <PrivateRoute roles={["instructor"]}>
              <InstructorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <PrivateRoute roles={["instructor"]}>
              <InstructorCourseManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/instructor/submissions"
          element={
            <PrivateRoute roles={["instructor"]}>
              <InstructorSubmissions />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute roles={["admin"]}>
              <Analytics />
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
