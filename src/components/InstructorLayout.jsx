import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const InstructorLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-muted text-primary text-xs">
        Loading Instructor Studio...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Overview",
      path: "/instructor/dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      end: true,
    },
    {
      name: "My Courses",
      path: "/instructor/courses",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: "Submissions",
      path: "/instructor/submissions",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-dvh bg-muted font-sans text-accent overflow-x-hidden w-full relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden w-full bg-[#1f3b45] text-white p-2.5 flex justify-between items-center fixed top-0 left-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <img
            src="/company/svarp-logo.webp"
            alt="SVARP Global"
            className="h-8 w-auto object-contain"
          />
          <span className="text-xs font-bold tracking-wider text-white">
            SVARP STUDIO
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 bg-white/10 hover:bg-white/20 rounded transition-all"
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-52 bg-[#1f3b45] text-white fixed h-dvh border-r border-white/5 flex flex-col z-50 transition-all duration-300
          max-md:top-0 max-md:left-0 max-md:shadow-2xl
          ${isSidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-3.5 flex items-center justify-between gap-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <img
              src="/company/svarp-logo.webp"
              alt="SVARP Global"
              className="h-7 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-white leading-none">
                SVARP GLOBAL
              </span>
              <span className="text-[8px] font-bold text-emerald-400 tracking-wider uppercase mt-0.5">
                Instructor Studio
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <div className="px-3 pb-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold mb-0.5 transition-all ${
                  isActive
                    ? "bg-white/10 text-primary border-l-2 border-primary"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}

          <div className="pt-4 px-3 pb-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Portals
          </div>

          <Link
            to="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <span>Learner Portal</span>
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-400/90 hover:bg-white/5 hover:text-amber-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all group"
          >
            <svg className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 ml-52 p-6 max-w-7xl max-md:ml-0 max-md:p-4 max-md:pt-20 w-full">
        {children}
      </main>
    </div>
  );
};

export default InstructorLayout;
