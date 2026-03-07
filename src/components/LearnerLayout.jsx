import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppSidebar from "./AppSidebar";
import {
  LayoutGrid,
  Home,
  Heart,
  History,
  Settings,
  Bell,
  GraduationCap,
} from "lucide-react";

const learnerLinks = [
  { label: "Home", to: "/", icon: <Home size={18} />, exact: true },
  {
    label: "My Learning",
    to: "/dashboard",
    icon: <LayoutGrid size={18} />,
    exact: true,
  },
  {
    label: "Courses",
    to: "/courses-catalog",
    icon: <GraduationCap size={18} />,
  },
  { label: "Wishlist", to: "/wishlist", icon: <Heart size={18} /> },
  { label: "History", to: "#", icon: <History size={18} /> },
  { label: "Settings", to: "#", icon: <Settings size={18} /> },
];

const LearnerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  const isActive = (link) => {
    if (link.to === "#") return false;
    return link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);
  };

  const currentLabel =
    learnerLinks.find((l) => isActive(l))?.label ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* ── Sidebar ── */}
      <AppSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        brandIcon={
          <GraduationCap size={20} className="text-primary flex-shrink-0" />
        }
        brandText1="SGA"
        brandText2="LEARN"
        brandLink="/dashboard"
        navLinks={learnerLinks}
        onLogout={handleLogout}
      />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-gray-500">
              {currentLabel}
            </h2>
          </div>

          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user?.full_name || user?.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default LearnerLayout;
