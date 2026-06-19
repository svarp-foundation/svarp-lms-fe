import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Heart, Bell, GraduationCap, LogOut } from "lucide-react";

const learnerLinks = [
  { label: "Home", to: "/dashboard", icon: <Home size={18} />, exact: true },
  {
    label: "Courses",
    to: "/courses-catalog",
    icon: <GraduationCap size={18} />,
  },
  { label: "Wishlist", to: "/wishlist", icon: <Heart size={18} /> },
];

const LearnerLayout = ({ children, isPlayerPage = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

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
    if (
      link.to === "/courses-catalog" &&
      location.pathname.startsWith("/courses")
    ) {
      return true;
    }
    return link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);
  };

  const currentLabel =
    learnerLinks.find((l) => isActive(l))?.label ?? "Dashboard";

  const getMembershipLabel = () => {
    if (!user?.membership) return "Free Tier";
    if (typeof user.membership === "string") return user.membership;
    const plan = user.membership.plan;
    if (!plan) return "Active Member";
    if (typeof plan === "object") {
      return plan.name || plan.title || "Active Member";
    }
    return plan;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-primary/20">
      {/* ── Left Sidebar Navigation (Desktop only) ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed inset-y-0 left-0 z-40 justify-between p-6 shadow-sm">
        <div className="flex flex-col gap-8">
          {/* Logo Branding */}
          <div className="flex flex-col px-2">
            <span className="text-xl font-extrabold text-accent tracking-wider leading-none">
              SVARP
            </span>
            <span className="text-[10px] font-bold text-primary tracking-[0.16em] uppercase mt-1 leading-none">
              GLOBAL ACADEMY
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1.5">
            {learnerLinks.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.to + "-side"}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                    active
                      ? "bg-primary/15 text-accent shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
                  }`}
                >
                  {React.cloneElement(link.icon, { size: 18 })}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile / Logout */}
        <div className="border-t border-gray-100 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-gray-900 truncate">
                {user?.full_name || "Learner"}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-red-600 font-bold py-3.5 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-grow flex flex-col md:pl-64 min-h-screen min-w-0">
        {/* Top bar (Mobile only) */}
        {!isPlayerPage && (
          <header className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0 z-30 sticky top-0">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-lg font-extrabold text-accent tracking-wider leading-none">
                SVARP
              </span>
              <span className="text-[10px] font-bold text-primary tracking-[0.16em] uppercase mt-0.5 leading-none">
                GLOBAL ACADEMY
              </span>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center group"
              >
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                  {initials}
                </div>
              </button>
            </div>
          </header>
        )}

        {/* Page content */}
        <main
          ref={mainRef}
          className={`flex-1 min-w-0 ${
            isPlayerPage
              ? "overflow-hidden"
              : "overflow-y-auto pb-24 md:pb-8 page-container-context"
          }`}
        >
          {children}
        </main>

        {/* ── Bottom Navigation (Mobile only) ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 flex items-center justify-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="w-full flex items-center justify-around">
            {learnerLinks.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.to + "-bottom"}
                  to={link.to}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    active
                      ? "text-primary scale-105 font-semibold"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {React.cloneElement(link.icon, { size: active ? 22 : 20 })}
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Profile Slide-Up Bottom Sheet (Mobile only) ── */}
      {profileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setProfileOpen(false)}
        />
      )}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 pb-8 z-[60] border-t border-gray-200 transition-transform duration-300 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] ${
          profileOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        {/* User Info */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-primary/20 mb-3">
            {initials}
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {user?.full_name || "Learner"}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">Role</span>
            <span className="text-gray-900 font-bold capitalize">
              {user?.role || "Learner"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">Membership</span>
            <span className="text-primary font-bold">
              {getMembershipLabel()}
            </span>
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
  );
};

export default LearnerLayout;
