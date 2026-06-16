import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutGrid,
  Home,
  Heart,
  Bell,
  GraduationCap,
  LogOut,
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
];

const LearnerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center font-sans selection:bg-primary/20">
      {/* ── High-Fidelity Mobile App Container ── */}
      <div className="w-full max-w-md h-[100dvh] md:h-[85vh] md:max-h-[900px] md:my-6 md:rounded-[3rem] bg-gray-50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden md:border-[10px] md:border-slate-800 ring-1 ring-slate-700/50">
        
        {/* Top bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0 z-30 sticky top-0">
          <div className="flex-1">
            <h2 className="text-base font-bold text-accent">
              {currentLabel}
            </h2>
          </div>

          <div className="flex items-center gap-3">
             <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            <button 
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 pl-3 border-l border-gray-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                {initials}
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>

        {/* ── Bottom Navigation ── */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 flex items-center justify-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="w-full flex items-center justify-between gap-1">
            {learnerLinks.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.to + "-bottom"}
                  to={link.to}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    active ? "text-primary scale-105 font-semibold" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {React.cloneElement(link.icon, { size: active ? 22 : 20 })}
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {link.label}
                  </span>
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 transition-all text-gray-400 hover:text-red-500"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                Logout
              </span>
            </button>
          </div>
        </nav>

        {/* ── Profile Slide-Up Bottom Sheet ── */}
        {profileOpen && (
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setProfileOpen(false)}
          />
        )}
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 pb-8 z-[60] border-t border-gray-200 transition-transform duration-300 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] ${
          profileOpen ? "translate-y-0" : "translate-y-full"
        }`}>
          {/* Drag Handle */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

          {/* User Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-primary/20 mb-3">
              {initials}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{user?.full_name || "Learner"}</h3>
            <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Role</span>
              <span className="text-gray-900 font-bold capitalize">{user?.role || "Learner"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Membership</span>
              <span className="text-primary font-bold">{user?.membership || "Free Tier"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full text-red-600 font-bold py-3.5 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <LogOut size={18} />
              Log out
            </button>
            <button
              onClick={() => setProfileOpen(false)}
              className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerLayout;
