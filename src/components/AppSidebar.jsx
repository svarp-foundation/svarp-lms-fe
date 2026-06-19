import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X, ChevronRight } from "lucide-react";

const AppSidebar = ({
  open,
  setOpen,
  brandIcon,
  brandText1,
  brandText2,
  brandLink,
  navLinks,
  onLogout,
}) => {
  const { user } = useAuth();
  const location = useLocation();

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
      : (link.to !== "/" && location.pathname.startsWith(link.to)) ||
          (link.to === "/" && location.pathname === "/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative flex flex-col bg-accent text-white flex-shrink-0 transition-all duration-300 h-full z-50 ${
          open
            ? "w-64 translate-x-0"
            : "w-16 md:translate-x-0 -translate-x-full"
        }`}
      >
        {/* Brand + Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 flex-shrink-0">
          <Link
            to={brandLink}
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
              open ? "opacity-100 w-auto" : "opacity-0 w-0 md:opacity-0"
            }`}
          >
            {brandIcon}
            <div className="flex leading-tight gap-1">
              <span className="font-bold text-white text-md block">
                {brandText1}
              </span>
              <span className="text-primary text-md font-semibold">
                {brandText2}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition text-gray-300 flex-shrink-0 ${
              !open && "mx-auto hidden md:flex"
            }`}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.to + link.label}
                to={link.to}
                title={!open ? link.label : undefined}
                onClick={() => {
                  if (window.innerWidth < 768) setOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? "bg-primary text-accent shadow-lg shadow-primary/20"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                <span
                  className={`flex-1 transition-all duration-300 ${
                    open
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4 pointer-events-none md:hidden"
                  }`}
                >
                  {link.label}
                </span>
                {open && active && (
                  <ChevronRight size={14} className="opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user profile */}
        <div className="border-t border-white/10 p-3 flex-shrink-0 bg-accent/50 backdrop-blur-md">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${open ? "px-1" : "justify-center"}`}
          >
            <div className="w-9 h-9 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-inner">
              {initials}
            </div>
            {open && (
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.full_name || "User"}
                </p>
                <p className="text-[10px] text-gray-400 truncate uppercase tracking-tighter">
                  {user?.role || "Learner"}
                </p>
              </div>
            )}
            {open && (
              <button
                onClick={onLogout}
                title="Log out"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition flex-shrink-0"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          {!open && (
            <button
              onClick={onLogout}
              title="Log out"
              className="hidden md:flex mx-auto mt-2 w-8 h-8 items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
