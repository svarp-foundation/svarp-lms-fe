import React, { useState } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Users,
  ClipboardList,
  IndianRupee,
} from "lucide-react";

const ADMIN_NAV_LINKS = [
  {
    name: "Overview",
    label: "Overview",
    to: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Analytics",
    label: "Analytics",
    to: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Courses",
    label: "Courses",
    to: "/admin/courses",
    icon: BookOpen,
  },
  {
    name: "Users",
    label: "Users & Instructors",
    to: "/admin/users",
    icon: Users,
  },
  {
    name: "Submissions",
    label: "Submissions",
    to: "/admin/submissions",
    icon: ClipboardList,
  },
  {
    name: "Payments",
    label: "Payments",
    to: "/admin/payments",
    icon: IndianRupee,
  },
];

export const AdminLayout = ({ children, headerActions }) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-xs">
        Loading Admin Studio...
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
        brandSubtitle="ADMIN"
        brandLink="/admin"
        roleBadge="Admin Control Center"
        navLinks={ADMIN_NAV_LINKS}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          brandTitle="SVARP"
          brandSubtitle="ADMIN"
          brandLink="/admin"
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

export default AdminLayout;
