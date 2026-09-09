import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Heart, GraduationCap, LogOut, Award, Sparkles, ChevronRight, BookOpen } from "lucide-react";
import API_URL from "../config";

const learnerLinks = [
  { label: "Home", to: "/dashboard", icon: <Home size={18} />, exact: true },
  {
    label: "Courses",
    to: "/courses-catalog",
    icon: <GraduationCap size={18} />,
  },
  { label: "Wishlist", to: "/wishlist", icon: <Heart size={18} /> },
  { label: "Certificates", to: "/certificates", icon: <Award size={18} /> },
];

const LearnerLayout = ({ children, isPlayerPage = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setDesktopMenuOpen(false);
  }, [location.pathname]);

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
    learnerLinks.find((l) => isActive(l))?.label ?? "Learning Portal";

  const isMemberActive = (() => {
    if (!user?.membership) return false;
    if (typeof user.membership === "string") return true;
    return user.membership.is_active !== false;
  })();

  const getMembershipLabel = () => {
    if (!user?.membership) return "Free Plan";
    if (typeof user.membership === "string") return user.membership;
    const plan = user.membership.plan;
    if (!plan) return "Active Member";
    if (typeof plan === "object") {
      return plan.name || plan.title || "Active Member";
    }
    return plan;
  };

  // If in Course Player page, provide full-width canvas with zero layout overhead
  if (isPlayerPage) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-primary/20">
        <main className="flex-1 min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-primary/20">
      {/* ── Desktop Left Sidebar Navigation ── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200/80 flex-col fixed inset-y-0 left-0 z-40 justify-between p-5 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-6">
          {/* Logo Branding */}
          <Link to="/dashboard" className="flex items-center gap-3 px-2 py-1 group">
            <img
              src="/company/svarp-logo.png"
              alt="SVARP Logo"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg font-black text-accent tracking-wider leading-none">
                SVARP
              </span>
              <span className="text-[8.5px] font-bold text-primary tracking-[0.18em] uppercase mt-1 leading-none">
                GLOBAL ACADEMY
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Menu
            </span>
            {learnerLinks.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.to + "-side"}
                  to={link.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-sm ${
                    active
                      ? "bg-accent text-white shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <span className={active ? "text-primary" : "text-slate-400"}>
                    {React.cloneElement(link.icon, { size: 17 })}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout (Sidebar Footer - Single Row) */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden ring-2 ring-primary/20">
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
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {user?.full_name || "Learner"}
                </span>
                <span className="text-[10.5px] text-emerald-600 font-semibold truncate leading-tight">
                  {getMembershipLabel()}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area with Desktop Header ── */}
      <div className="flex-grow flex flex-col md:pl-60 min-h-screen min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/dashboard" className="hover:text-accent font-medium">Academy</Link>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-bold text-slate-800">{currentLabel}</span>
          </div>

          <div className="flex items-center gap-4">
            {(user?.role === "instructor" || user?.role === "admin") && (
              <Link
                to="/instructor/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1f3b45] text-white hover:bg-[#152830] transition-colors shadow-xs"
              >
                <span>Instructor Studio</span>
              </Link>
            )}

            <Link
              to="/courses-catalog"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-accent hover:bg-slate-100 transition-colors"
            >
              <BookOpen size={14} />
              <span>Explore Courses</span>
            </Link>

            {isMemberActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold">
                <Sparkles size={12} className="text-emerald-500" />
                <span>{getMembershipLabel()}</span>
              </span>
            ) : null}

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs overflow-hidden">
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
              <span className="text-xs font-bold text-slate-700">
                {user?.full_name ? user.full_name.split(" ")[0] : "Learner"}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Top Bar */}
        <header className="md:hidden h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0 z-30 sticky top-0">
          <div className="flex-1 flex items-center gap-2">
            <img
              src="/company/svarp-logo.png"
              alt="SVARP Logo"
              className="w-7 h-7 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm font-black text-accent tracking-wider leading-none">
                SVARP
              </span>
              <span className="text-[8px] font-bold text-primary tracking-[0.16em] uppercase mt-0.5 leading-none">
                GLOBAL ACADEMY
              </span>
            </div>
          </div>

          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs ring-2 ring-primary/20 overflow-hidden">
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
          </button>
        </header>

        {/* Page content */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-8"
        >
          {user?.role === "instructor_pending" && (
            <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <strong>Instructor Application Pending:</strong> Your application is currently under review by our admin team. You can continue accessing all courses in the meantime.
                </span>
              </span>
            </div>
          )}
          {children}
        </main>

        {/* ── Bottom Navigation (Mobile only) ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 flex items-center justify-around z-40 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          {learnerLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.to + "-bottom"}
                to={link.to}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  active
                    ? "text-accent font-bold"
                    : "text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                {React.cloneElement(link.icon, { size: active ? 20 : 18, className: active ? "text-primary" : "" })}
                <span className="text-[10px] tracking-tight">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Profile Slide-Up Bottom Sheet (Mobile only) ── */}
      {profileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setProfileOpen(false)}
        />
      )}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-8 z-[60] border-t border-slate-200 transition-transform duration-300 shadow-2xl ${
          profileOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        <div className="flex flex-col items-center mb-5">
          <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl ring-4 ring-primary/20 mb-2.5 overflow-hidden">
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
          <h3 className="text-base font-bold text-slate-900">
            {user?.full_name || "Learner"}
          </h3>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>

        <div className="space-y-3 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Role</span>
            <span className="text-slate-900 font-bold capitalize">
              {user?.role || "Learner"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Membership</span>
            <span className="text-emerald-700 font-bold">
              {getMembershipLabel()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleLogout}
            className="w-full text-red-600 font-bold py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <LogOut size={15} />
            Log out
          </button>
          <button
            onClick={() => setProfileOpen(false)}
            className="w-full bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnerLayout;
