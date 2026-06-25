import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppSidebar from "./AppSidebar";
import API_URL from "../config";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Bell,
  IndianRupee,
  Menu,
  GraduationCap,
} from "lucide-react";

const adminLinks = [
  {
    label: "Overview",
    to: "/admin",
    icon: <LayoutDashboard size={18} />,
    exact: true,
  },
  {
    label: "Courses",
    to: "/admin/courses",
    icon: <BookOpen size={18} />,
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: <Users size={18} />,
  },
  {
    label: "Payments",
    to: "/admin/payments",
    icon: <IndianRupee size={18} />,
  },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [profileImgErr, setProfileImgErr] = useState(false);

  const token = localStorage.getItem("token") || "";
  const secureProfilePicUrl = user?.profile_picture_url
    ? `${API_URL}${user.profile_picture_url}${user.profile_picture_url.includes("?") ? "&" : "?"}token=${token}`
    : null;

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "A";

  const isActive = (link) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);

  const currentLabel = adminLinks.find((l) => isActive(l))?.label ?? "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans selection:bg-primary/20">
      {/* ── Sidebar (Drawer on mobile) ── */}
      <AppSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        brandIcon={<img src="/company/svarp-logo.png" alt="SVARP Logo" className="h-8 w-auto object-contain" />}
        brandText1="SVARP"
        brandText2="Admin"
        brandLink="/admin"
        navLinks={adminLinks}
        onLogout={handleLogout}
      />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {/* Top bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-4 md:px-8 gap-4 flex-shrink-0 z-30 sticky top-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h2 className="text-base font-bold text-accent md:text-sm md:font-medium md:text-gray-500">
              {currentLabel}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 group">
              <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all overflow-hidden">
                {secureProfilePicUrl && !profileImgErr ? (
                  <img
                    src={secureProfilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setProfileImgErr(true)}
                  />
                ) : (
                  initials
                )}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden lg:block">
                {user?.full_name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
