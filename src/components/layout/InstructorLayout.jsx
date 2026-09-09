import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
} from "lucide-react";

const INSTRUCTOR_NAV_LINKS = [
  {
    name: "Overview",
    label: "Overview",
    to: "/instructor/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "My Courses",
    label: "Course Studio",
    to: "/instructor/courses",
    icon: BookOpen,
  },
  {
    name: "Submissions",
    label: "Student Submissions",
    to: "/instructor/submissions",
    icon: ClipboardList,
  },
];

export const InstructorLayout = ({ children, headerActions }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-xs">
        Loading Instructor Studio...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900 pb-16 md:pb-0">
      {/* Desktop-Only Left Sidebar */}
      <AppSidebar
        brandTitle="SVARP"
        brandSubtitle="STUDIO"
        brandLink="/instructor/dashboard"
        roleBadge="Instructor Studio"
        navLinks={INSTRUCTOR_NAV_LINKS}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          brandTitle="SVARP"
          brandSubtitle="STUDIO"
          brandLink="/instructor/dashboard"
          actions={headerActions}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg">
        {INSTRUCTOR_NAV_LINKS.map((link) => {
          const isActive = link.end
            ? location.pathname === link.to
            : location.pathname.startsWith(link.to);
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                isActive ? "text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={18} />
              <span className="mt-0.5">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default InstructorLayout;

