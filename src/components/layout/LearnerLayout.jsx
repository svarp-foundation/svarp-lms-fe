import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import {
  Home,
  GraduationCap,
  Heart,
  Award,
} from "lucide-react";

const LEARNER_NAV_LINKS = [
  {
    name: "Home",
    label: "Home",
    to: "/dashboard",
    icon: Home,
    end: true,
  },
  {
    name: "Courses",
    label: "All Courses",
    to: "/courses-catalog",
    icon: GraduationCap,
  },
  {
    name: "Wishlist",
    label: "Wishlist",
    to: "/wishlist",
    icon: Heart,
  },
  {
    name: "Certificates",
    label: "My Certificates",
    to: "/certificates",
    icon: Award,
  },
];

export const LearnerLayout = ({
  children,
  isPlayerPage = false,
  headerActions,
  noPadding = false,
}) => {
  const location = useLocation();

  if (isPlayerPage) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-emerald-500/20">
        <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans selection:bg-emerald-500/20 text-slate-900 pb-16 md:pb-0">
      {/* Desktop-Only Left Sidebar Navigation */}
      <AppSidebar
        brandTitle="SVARP"
        brandSubtitle="LEARNING"
        brandLink="/dashboard"
        roleBadge="Learner Portal"
        navLinks={LEARNER_NAV_LINKS}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          brandTitle="SVARP"
          brandSubtitle="LEARNING"
          brandLink="/dashboard"
          actions={headerActions}
        />

        {noPadding ? (
          <main className="flex-1 w-full">{children}</main>
        ) : (
          <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-5 md:p-6 lg:p-8">
            {children}
          </main>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg">
        {LEARNER_NAV_LINKS.map((link) => {
          const isActive = link.end
            ? location.pathname === link.to
            : location.pathname.startsWith(link.to);
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
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

export default LearnerLayout;
