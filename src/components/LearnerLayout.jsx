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
  Menu,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const isActive = (link) => {
    if (link.to === "#") return false;
    return link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);
  };

  const currentLabel =
    learnerLinks.find((l) => isActive(l))?.label ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans selection:bg-primary/20">
      {/* ── Sidebar (Drawer on mobile, Sidebar on desktop) ── */}
      <AppSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        brandIcon={<GraduationCap size={20} className="text-primary" />}
        brandText1="SGA"
        brandText2="LEARN"
        brandLink="/dashboard"
        navLinks={learnerLinks}
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

            <Link 
              to="/dashboard"
              className="flex items-center gap-2 pl-3 border-l border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 flex items-center justify-between z-40">
          {learnerLinks.slice(0, 4).map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.to + "-bottom"}
                to={link.to}
                className={`flex flex-col items-center gap-1 transition-all ${
                  active ? "text-primary scale-110" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {React.cloneElement(link.icon, { size: active ? 22 : 20 })}
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${active ? "opacity-100" : "opacity-0"}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default LearnerLayout;
