import React, { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-xs">
        Loading Instructor Studio...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <AppSidebar
        open={isSidebarOpen}
        setOpen={setIsSidebarOpen}
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
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          actions={headerActions}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
